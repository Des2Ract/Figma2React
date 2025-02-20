import React, { useState, useEffect, useRef } from 'react';

// Global CSS reset for a responsive layout
const GlobalStyles = () => (
  <style>
    {`
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        overflow-x: hidden;
      }
    `}
  </style>
);

// Mapping from Figma tags to HTML elements
const ComponentMap = {
  HTML: 'html',
  HEAD: 'head',
  BODY: 'body', // We'll skip rendering the root BODY node.
  DIV: 'div',
  HEADER: 'header',
  FOOTER: 'footer',
  SECTION: 'section',
  ARTICLE: 'article',
  ASIDE: 'aside',
  NAV: 'nav',
  MAIN: 'main',
  UL: 'ul',
  LI: 'li',
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  H4: 'h4',
  H5: 'h5',
  H6: 'h6',
  P: 'p',
  A: 'a',
  IMG: 'img',
  SVG: 'svg',
  PATH: 'path',
  BUTTON: 'button',
  INPUT: 'input',
  LABEL: 'label',
  FORM: 'form',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  OPTION: 'option',
  IFRAME: 'iframe',
  VIDEO: 'video',
  AUDIO: 'audio',
  CANVAS: 'canvas',
  FIGURE: 'figure',
  FIGCAPTION: 'figcaption',
  DETAILS: 'details',
  SUMMARY: 'summary',
  TXT: 'span', // Custom mapping for text nodes
};

// Convert a Figma fill object to an rgba() color string.
const getColorFromFill = (fill) => {
  if (fill && fill.type === 'SOLID' && fill.color) {
    const { r, g, b } = fill.color;
    const opacity = fill.opacity !== undefined ? fill.opacity : 1;
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${opacity})`;
  }
  return null;
};

// Generate inline styles from Figma node data.
const getStyleFromNode = (nodeData, isText = false) => {
  let style = {
    position: 'absolute',
    left: nodeData.x || 0,
    top: nodeData.y || 0,
    width: nodeData.width || 'auto',
    height: nodeData.height || 'auto',
    boxSizing: 'border-box',
  };

  // Border radius
  if (
    nodeData.topLeftRadius !== undefined ||
    nodeData.topRightRadius !== undefined ||
    nodeData.bottomLeftRadius !== undefined ||
    nodeData.bottomRightRadius !== undefined
  ) {
    style.borderTopLeftRadius = nodeData.topLeftRadius || 0;
    style.borderTopRightRadius = nodeData.topRightRadius || 0;
    style.borderBottomLeftRadius = nodeData.bottomLeftRadius || 0;
    style.borderBottomRightRadius = nodeData.bottomRightRadius || 0;
  }

  // Fills / backgrounds
  if (nodeData.fills && nodeData.fills.length > 0) {
    if (isText || nodeData.type === 'TEXT' || nodeData.characters) {
      const textColor = getColorFromFill(nodeData.fills[0]);
      if (textColor) {
        style.color = textColor;
      }
    } else {
      const bgColor = getColorFromFill(nodeData.fills[0]);
      if (bgColor) {
        style.backgroundColor = bgColor;
      }
    }
  } else if (nodeData.backgrounds && nodeData.backgrounds.length > 0) {
    const bgFill = nodeData.backgrounds[0];
    if (bgFill && bgFill.type === 'SOLID' && bgFill.color && bgFill.visible !== false) {
      style.backgroundColor = `rgba(${Math.round(bgFill.color.r * 255)}, ${Math.round(
        bgFill.color.g * 255
      )}, ${Math.round(bgFill.color.b * 255)}, ${bgFill.opacity !== undefined ? bgFill.opacity : 1})`;
    }
  }

  // Text properties
  if (nodeData.fontSize) style.fontSize = nodeData.fontSize;
  if (nodeData.fontName && nodeData.fontName.family) style.fontFamily = nodeData.fontName.family;
  if (nodeData.fontWeight) style.fontWeight = nodeData.fontWeight;
  if (nodeData.textAlignHorizontal) style.textAlign = nodeData.textAlignHorizontal.toLowerCase();
  if (nodeData.textDecoration) style.textDecoration = nodeData.textDecoration.toLowerCase();

  // Stroke (borders)
  if (nodeData.strokes && nodeData.strokes.length > 0) {
    const strokeColor = getColorFromFill(nodeData.strokes[0]);
    if (strokeColor) {
      style.border = `${nodeData.strokeWeight || 1}px solid ${strokeColor}`;
      if (nodeData.dashPattern && nodeData.dashPattern.length > 0) {
        style.borderStyle = 'dashed';
      }
    }
  }

  // Effects (e.g., drop shadow)
  if (nodeData.effects && nodeData.effects.length > 0) {
    const shadow = nodeData.effects.find((effect) => effect.type === 'DROP_SHADOW');
    if (shadow && shadow.offset && shadow.radius !== undefined && shadow.color) {
      const { x: offsetX, y: offsetY } = shadow.offset;
      const blur = shadow.radius;
      const shadowColor = getColorFromFill(shadow.color);
      style.boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${shadowColor}`;
    }
  }

  return style;
};

// Extract extra HTML attributes based on the Figma node data.
const getAttributesForNode = (tag, nodeData) => {
  const attributes = {};
  switch (tag) {
    case 'A':
      if (nodeData.linkUnfurlData?.url) attributes.href = nodeData.linkUnfurlData.url;
      break;
    case 'IMG':
      if (nodeData.fills && nodeData.fills[0]?.url) {
        attributes.src = nodeData.fills[0].url;
      } else if (nodeData.backgrounds && nodeData.backgrounds[0]?.url) {
        attributes.src = nodeData.backgrounds[0].url;
      }
      attributes.alt = nodeData.alt || '';
      break;
    case 'IFRAME':
      if (nodeData.src) attributes.src = nodeData.src;
      break;
    case 'INPUT':
      attributes.placeholder = nodeData.placeholder || '';
      attributes.value = nodeData.value || '';
      attributes.type = nodeData.inputType || 'text';
      if (nodeData.checked !== undefined) attributes.checked = nodeData.checked;
      break;
    case 'FORM':
      attributes.action = nodeData.action || '';
      attributes.method = nodeData.method || 'get';
      break;
      case "VIDEO":
        if (
          nodeData.fills &&
          nodeData.fills.length > 0 &&
          nodeData.fills[0].url
        ) {
          attributes.src = nodeData.fills[0].url;
        }
        attributes.controls = true;
        break;
    case 'AUDIO':
      if (nodeData.src) attributes.src = nodeData.src;
      attributes.controls = true;
      break;
    default:
      break;
  }
  return attributes;
};

const selfClosingTags = ['IMG', 'INPUT', 'META', 'LINK', 'BR'];

// Recursive renderer for the Figma JSON tree.
// If the root node is a "BODY" node, we skip rendering it to avoid injecting fixed dimensions.
const FigmaRenderer = ({ node, parentOffsetX = 0, parentOffsetY = 0 }) => {
  if (!node) return null;
  const { tag, node: nodeData, children = [] } = node;

  // Skip the root BODY node—render its children directly.
  if (parentOffsetX === 0 && parentOffsetY === 0 && tag === 'BODY') {
    return children.map((child, index) => (
      <FigmaRenderer key={index} node={child} parentOffsetX={0} parentOffsetY={0} />
    ));
  }

  const Component = ComponentMap[tag] || 'div';

  // Compute position relative to the parent's offset.
  const relativeX = (nodeData.x || 0) - parentOffsetX;
  const relativeY = (nodeData.y || 0) - parentOffsetY;

  const isText = tag === 'TXT' || nodeData.type === 'TEXT' || !!nodeData.characters;
  let style = getStyleFromNode(nodeData, isText);

  // Ensure integer pixel values.
  style.left = Math.round(relativeX);
  style.top = Math.round(relativeY);
  style.width = Math.round(nodeData.width);
  style.height = Math.round(nodeData.height);

  const attributes = getAttributesForNode(tag, nodeData);

  // Special handling for SVG nodes: render using dangerouslySetInnerHTML.
  if (tag === 'SVG' && nodeData.svg) {
    return (
      <Component style={style} {...attributes} dangerouslySetInnerHTML={{ __html: nodeData.svg }} />
    );
  }

  if (selfClosingTags.includes(tag)) {
    return <Component style={style} {...attributes} />;
  }

  return (
    <Component style={style} {...attributes}>
      {nodeData.characters && typeof nodeData.characters === 'string'
        ? nodeData.characters
        : null}
      {children.map((child, index) => (
        <FigmaRenderer
          key={index}
          node={child}
          parentOffsetX={nodeData.x || 0}
          parentOffsetY={nodeData.y || 0}
        />
      ))}
    </Component>
  );
};

const App = () => {
  const [figmaJson, setFigmaJson] = useState(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    fetch('/figmaData.json')
      .then((response) => response.json())
      .then((data) => setFigmaJson(data))
      .catch((error) => console.error('Error loading JSON:', error));
  }, []);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && figmaJson && figmaJson.node && figmaJson.node.width) {
        const containerWidth = containerRef.current.offsetWidth;
        const designWidth = figmaJson.node.width;
        setScale(containerWidth / designWidth);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [figmaJson]);

  if (!figmaJson) {
    return <p>Loading...</p>;
  }

  const designWidth = figmaJson.node.width;
  const designHeight = figmaJson.node.height;

  // Outer container: full width, with padding-bottom for aspect ratio.
  const containerStyle = {
    position: 'relative',
    width: '100%',
    paddingBottom: `${(designHeight / designWidth) * 100}%`,
    overflow: 'hidden',
  };

  // Inner wrapper: fixed dimensions, scaled responsively.
  const innerWrapperStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: designWidth,
    height: designHeight,
    transformOrigin: 'top left',
    transform: `scale(${scale})`,
  };

  return (
    <>
      <GlobalStyles />
      <div ref={containerRef} style={containerStyle}>
        <div style={innerWrapperStyle}>
          <FigmaRenderer node={figmaJson} parentOffsetX={0} parentOffsetY={0} />
        </div>
      </div>
    </>
  );
};

export default App;
