import React, { useState, useEffect } from "react";

// Extended mapping of Figma tags to React components
const ComponentMap = {
  BODY: "div",
  DIV: "div",
  HEADER: "header",
  A: "a",
  TXT: "span",
  IFRAME: "iframe",
  SVG: "svg",
  BUTTON: "button",
  SPAN: "span",
  NAV: "nav",
  MAIN: "main",
  ARTICLE: "article",
  SECTION: "section",
  FOOTER: "footer",
  UL: "ul",
  LI: "li",
  H1: "h1",
  H2: "h2",
  H3: "h3",
  P: "p",
  IMG: "img",
  FORM: "form",
  INPUT: "input",
  LABEL: "label",
  TABLE: "table",
  TR: "tr",
  TD: "td",
  TH: "th",
  // You can add additional tags as needed
};

// A helper function to extract and assign attributes based on the tag and node properties.
const getAttributesForNode = (tag, nodeData) => {
  const attributes = {};
  switch (tag) {
    case "A":
      if (nodeData.linkUnfurlData?.url) {
        attributes.href = nodeData.linkUnfurlData.url;
      }
      break;
    case "IMG":
      if (nodeData.fills && nodeData.fills[0]?.url) {
        attributes.src = nodeData.fills[0].url;
      }
      attributes.alt = nodeData.alt || "";
      break;
    case "IFRAME":
      if (nodeData.src) {
        attributes.src = nodeData.src;
      }
      break;
    case "INPUT":
      attributes.placeholder = nodeData.placeholder || "";
      attributes.value = nodeData.value || "";
      attributes.type = nodeData.inputType || "text";
      break;
    case "FORM":
      attributes.action = nodeData.action || "";
      attributes.method = nodeData.method || "get";
      break;
    default:
      // Other tags may not require special attributes.
      break;
  }
  return attributes;
};

// Recursive component to render the Figma JSON tree.
const FigmaRenderer = ({ node, offsetX = 0, offsetY = 0 }) => {
  if (!node) return null;

  const { tag, node: nodeData, children = [] } = node;
  const Component = ComponentMap[tag] || "div";

  // Compute the element's position relative to the parent's top-left
  const left = (nodeData.x || 0) - offsetX;
  const top = (nodeData.y || 0) - offsetY;

  // Map Figma node properties to inline styles.
  const style = {
    position: "absolute",
    left,
    top,
    width: nodeData.width || "auto",
    height: nodeData.height || "auto",
    backgroundColor:
      nodeData.fills && nodeData.fills[0] && nodeData.fills[0].color
        ? `rgba(${nodeData.fills[0].color.r * 255}, ${nodeData.fills[0].color.g * 255}, ${nodeData.fills[0].color.b * 255}, ${nodeData.fills[0].opacity || 1})`
        : "transparent",
    fontSize: nodeData.fontSize,
    textAlign: nodeData.textAlignHorizontal
      ? nodeData.textAlignHorizontal.toLowerCase()
      : undefined,
    textDecoration: nodeData.textDecoration
      ? nodeData.textDecoration.toLowerCase()
      : undefined,
    // Add additional style mappings (borders, borderRadius, etc.) as needed.
  };

  // Get extra attributes based on the tag.
  const attributes = getAttributesForNode(tag, nodeData);

  // Define self-closing tags that do not wrap children.
  const selfClosingTags = ["IMG", "INPUT"];
  if (selfClosingTags.includes(tag)) {
    return <Component style={style} {...attributes} />;
  }

  return (
    <Component style={style} {...attributes}>
      {/* For text-based nodes, render the characters */}
      {nodeData.characters && typeof nodeData.characters === "string"
        ? nodeData.characters
        : null}
      {/* Render children recursively */}
      {children &&
        children.map((child, index) => (
          <FigmaRenderer
            key={index}
            node={child}
            // Pass the current node's absolute x and y as the offset for its children
            offsetX={nodeData.x || 0}
            offsetY={nodeData.y || 0}
          />
        ))}
    </Component>
  );
};

const App = () => {
  const [figmaJson, setFigmaJson] = useState(null);

  useEffect(() => {
    // Fetch the JSON file from the public folder.
    fetch("/figmaData.json")
      .then((response) => response.json())
      .then((data) => setFigmaJson(data))
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  // If the root node (typically a frame) specifies a width and height,
  // we use it to size our main container.
  const containerStyle =
    figmaJson &&
    figmaJson.node &&
    figmaJson.node.width &&
    figmaJson.node.height
      ? {
          position: "relative",
          width: figmaJson.node.width,
          height: figmaJson.node.height,
        }
      : { position: "relative" };

  return (
    <div style={containerStyle}>
      {figmaJson ? <FigmaRenderer node={figmaJson} /> : <p>Loading...</p>}
    </div>
  );
};

export default App;
