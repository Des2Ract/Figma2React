import React, { useState, useEffect } from 'react';

// Extended mapping of Figma tags to React components
const ComponentMap = {
  HTML: 'html',
  HEAD: 'head',
  BODY: 'body',
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

// Helper to convert a Figma fill to an rgba() color string
const getColorFromFill = (fill) => {
  if (fill && fill.type === 'SOLID' && fill.color) {
    const { r, g, b } = fill.color;
    const opacity = fill.opacity !== undefined ? fill.opacity : 1;
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${opacity})`;
  }
  return null;
};

// Helper function to generate inline styles from Figma node data
const getStyleFromNode = (nodeData, isText = false) => {
  let style = {
    position: 'relative',
    left: nodeData.x || 0,
    //top: nodeData.y || 0,
    width: nodeData.width || 'auto',
    height: nodeData.height || 'auto',
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

  // Fill/background handling:
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

  // Font properties (for text nodes)
  if (nodeData.fontSize) {
    style.fontSize = nodeData.fontSize;
  }
  if (nodeData.fontName && nodeData.fontName.family) {
    style.fontFamily = nodeData.fontName.family;
  }
  if (nodeData.fontWeight) {
    style.fontWeight = nodeData.fontWeight;
  }
  if (nodeData.textAlignHorizontal) {
    style.textAlign = nodeData.textAlignHorizontal.toLowerCase();
  }
  if (nodeData.textDecoration) {
    style.textDecoration = nodeData.textDecoration.toLowerCase();
  }

  // Stroke handling (borders)
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
      const { x: offsetX, y: offsetY} = shadow.offset;
      const blur = shadow.radius;
      const shadowColor = getColorFromFill(shadow.color);
      style.boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${shadowColor}`;
    }
  }

  return style;
};

// Helper function to extract extra attributes based on the tag and node properties
const getAttributesForNode = (tag, nodeData) => {
  const attributes = {};
  switch (tag) {
    case 'A':
      if (nodeData.linkUnfurlData?.url) {
        attributes.href = nodeData.linkUnfurlData.url;
      }
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
      if (nodeData.src) {
        attributes.src = nodeData.src;
      }
      break;
    case 'INPUT':
      attributes.placeholder = nodeData.placeholder || '';
      attributes.value = nodeData.value || '';
      attributes.type = nodeData.inputType || 'text';
      if (nodeData.checked !== undefined) {
        attributes.checked = nodeData.checked;
      }
      break;
    case 'FORM':
      attributes.action = nodeData.action || '';
      attributes.method = nodeData.method || 'get';
      break;
    case 'VIDEO':
      if (nodeData.src) {
        attributes.src = nodeData.src;
      }
      attributes.controls = true;
      break;
    case 'AUDIO':
      if (nodeData.src) {
        attributes.src = nodeData.src;
      }
      attributes.controls = true;
      break;
    default:
      break;
  }
  return attributes;
};

// Define self-closing tags that don't wrap children
const selfClosingTags = ['IMG', 'INPUT', 'META', 'LINK', 'BR'];

// Recursive component that renders the Figma JSON tree.
const FigmaRenderer = ({ node, parentOffsetX = 0, parentOffsetY = 0, parentWidth, parentHeight }) => {
  if (!node) return null;
  const { tag, node: nodeData, children = [] } = node;
  const Component = ComponentMap[tag] || 'div';

  // Calculate position relative to the parent's offset (using Figma's coordinates)
  const relativeX = (nodeData.x || 0) - parentOffsetX;
  const relativeY = (nodeData.y || 0) - parentOffsetY;

  // Determine if this node should be treated as a text node
  const isText = tag === 'TXT' || nodeData.type === 'TEXT' || !!nodeData.characters;
  let style = getStyleFromNode(nodeData, isText);

  // Always convert left & top values to percentages relative to the parent.
  if (parentWidth) {
    style.left = `${(relativeX / parentWidth) * 100}%`;
  }
  if (parentHeight) {
    //style.top = `${(relativeY / parentHeight) * 100}%`;
  }

  // For elements that need a fixed aspect ratio (e.g. images and videos),
  // set the width as a percentage and let the height be auto while enforcing
  // the original aspect ratio. For all other elements, both width and height
  // are computed as percentages relative to the parent.
  if (['IMG', 'VIDEO'].includes(tag)) {
    if (parentWidth && nodeData.width) {
      style.width = `${(nodeData.width / parentWidth) * 100}%`;
    }
    style.height = 'auto';
    if (nodeData.width && nodeData.height) {
      style.aspectRatio = nodeData.width / nodeData.height;
    }
  } else {
    if (parentWidth && nodeData.width) {
      style.width = `${(nodeData.width / parentWidth) * 100}%`;
    }
    if (parentHeight && nodeData.height) {
      style.height = `${(nodeData.height / parentHeight) * 100}%`;
    }
  }

  const attributes = getAttributesForNode(tag, nodeData);

  // Render self-closing tags immediately
  if (selfClosingTags.includes(tag)) {
    return <Component style={style} {...attributes} />;
  }

  return (
    <Component style={style} {...attributes}>
      {/* Render text if available */}
      {nodeData.characters && typeof nodeData.characters === 'string'
        ? nodeData.characters
        : null}
      {/* Recursively render children, passing the current node's position and dimensions */}
      {children.map((child, index) => (
        <FigmaRenderer
          key={index}
          node={child}
          parentOffsetX={nodeData.x || 0}
          parentOffsetY={nodeData.y || 0}
          parentWidth={nodeData.width}
          parentHeight={nodeData.height}
        />
      ))}
    </Component>
  );
};

const App = () => {
  const [figmaJson, setFigmaJson] = useState(null);

  useEffect(() => {
    fetch('/figmaData.json')
      .then((response) => response.json())
      .then((data) => setFigmaJson(data))
      .catch((error) => console.error('Error loading JSON:', error));
  }, []);

  // Use the absolute dimensions from the root node for the container.
  const containerStyle =
    figmaJson && figmaJson.node && figmaJson.node.width && figmaJson.node.height
      ? {
          position: 'relative',
          width: figmaJson.node.width,
          height: figmaJson.node.height,
          // Optionally, add responsiveness:
          maxWidth: '100%',
          height: 'auto',
        }
      : { position: 'relative' };

  return (
    <div style={containerStyle}>
      {figmaJson ? (
        <FigmaRenderer
          node={figmaJson}
          parentWidth={figmaJson.node.width}
          parentHeight={figmaJson.node.height}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default App;
