import React, { useState, useEffect, useRef } from 'react';
import GeneratedComponent from './GeneratedComponent';

const GlobalStyles = () => (
  <style>
    {`
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        overflow-x: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      /* Improved text handling */
      .text-node {
        display: block;
        white-space: pre-line;
        overflow-wrap: break-word;
        word-break: keep-all;
        padding-left: 4px;
        margin: 2px 0;
        line-height: 1.4;
        text-align: left;
        hyphens: none;
      }

      .button .text-node {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-left: 0;
        margin: 0;
        display: inline;
      }

      /* Component-specific styles */
      .navbar {
        background-color: #f8f9fa;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .nav-list {
        list-style: none;
        display: flex;
        gap: 2rem;
        padding: 0;
        margin: 0;
      }

      .button {
        padding: 12px 24px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.2s;
        overflow: hidden;
      }

      .input {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        width: 100%;
        max-width: 300px;
      }

      .card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        padding: 1.5rem;
      }
    `}
  </style>
);

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
  TXT: 'span',
};

const tagClassMap = {
  NAV: 'navbar',
  UL: 'nav-list',
  LI: 'nav-item',
  BUTTON: 'button',
  A: 'link',
  INPUT: 'input',
  FORM: 'form',
  SECTION: 'card',
};

const getColorFromFill = (fill) => {
  if (fill?.type === 'SOLID' && fill.color) {
    const { r, g, b } = fill.color;
    const opacity = fill.opacity ?? 1;
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${opacity})`;
  }
  return null;
};

const getStyleFromNode = (nodeData, isText = false) => {
  const style = {
    position: 'absolute',
    left: nodeData.x || 0,
    top: nodeData.y || 0,
    width: nodeData.width || 'auto',
    height: nodeData.height || 'auto',
    boxSizing: 'border-box',
  };

  if (isText) {
    style.whiteSpace = 'pre-line';
    style.wordBreak = 'normal';
    style.hyphens = 'none';
    style.overflowWrap = 'break-word';
  }

  if (nodeData.topLeftRadius !== undefined ||
    nodeData.topRightRadius !== undefined ||
    nodeData.bottomLeftRadius !== undefined ||
    nodeData.bottomRightRadius !== undefined) {
    style.borderRadius = `${nodeData.topLeftRadius || 0}px ${nodeData.topRightRadius || 0}px ${nodeData.bottomRightRadius || 0}px ${nodeData.bottomLeftRadius || 0}px`;
  }

  if (nodeData.fills?.[0]) {
    const color = getColorFromFill(nodeData.fills[0]);
    if (color) {
      if (isText) style.color = color;
      else style.backgroundColor = color;
    }
  }

  if (nodeData.fontSize) style.fontSize = nodeData.fontSize;
  if (nodeData.fontName?.family) style.fontFamily = nodeData.fontName.family;
  if (nodeData.fontWeight) style.fontWeight = nodeData.fontWeight;
  if (nodeData.textAlignHorizontal) style.textAlign = nodeData.textAlignHorizontal.toLowerCase();
  if (nodeData.textDecoration) style.textDecoration = nodeData.textDecoration.toLowerCase();

  if (nodeData.strokes?.[0]) {
    const strokeColor = getColorFromFill(nodeData.strokes[0]);
    if (strokeColor) {
      style.border = `${nodeData.strokeWeight || 1}px solid ${strokeColor}`;
      if (nodeData.dashPattern?.length) style.borderStyle = 'dashed';
    }
  }

  if (nodeData.effects?.length) {
    const shadow = nodeData.effects.find(e => e.type === 'DROP_SHADOW');
    if (shadow) {
      style.boxShadow = `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px ${getColorFromFill(shadow.color)}`;
    }
  }

  return style;
};

const getAttributesForNode = (tag, nodeData) => {
  const attributes = {};
  switch (tag) {
    case 'A':
      attributes.href = nodeData.linkUnfurlData?.url || '#';
      break;
    case 'IMG':
      attributes.src = nodeData.fills?.[0]?.url || nodeData.backgrounds?.[0]?.url || '';
      attributes.alt = nodeData.alt || '';
      break;
    case 'INPUT':
      attributes.type = nodeData.inputType || 'text';
      attributes.placeholder = nodeData.placeholder || '';
      attributes.value = nodeData.value || '';
      if (nodeData.checked !== undefined) attributes.checked = nodeData.checked;
      break;
    case 'FORM':
      attributes.action = nodeData.action || '#';
      attributes.method = nodeData.method || 'get';
      break;
    case 'VIDEO':
    case 'AUDIO':
      attributes.controls = true;
      attributes.src = nodeData.fills?.[0]?.url || '';
      break;
  }
  return attributes;
};

const selfClosingTags = ['IMG', 'INPUT', 'BR'];

const FigmaRenderer = ({ node, parentOffsetX = 0, parentOffsetY = 0 }) => {
  if (!node) return null;
  const { tag, node: nodeData, children = [] } = node;

  if (tag === 'BODY' && parentOffsetX === 0 && parentOffsetY === 0) {
    return children.map((child, i) => (
      <FigmaRenderer key={i} node={child} parentOffsetX={0} parentOffsetY={0} />
    ));
  }

  const Component = ComponentMap[tag] || 'div';
  const attributes = getAttributesForNode(tag, nodeData);
  const defaultClass = tagClassMap[tag] || '';
  const isText = tag === 'TXT' || !!nodeData.characters;
  const textClass = isText ? 'text-node' : '';
  const className = `${defaultClass} ${textClass} ${attributes.className || ''}`.trim();

  const style = {
    ...getStyleFromNode(nodeData, isText),
    left: Math.round((nodeData.x || 0) - parentOffsetX),
    top: Math.round((nodeData.y || 0) - parentOffsetY),
    width: Math.round(nodeData.width) || 'auto',
    height: Math.round(nodeData.height) || 'auto',
  };

  if (tag === 'SVG' && nodeData.svg) {
    return <Component className={className} style={style} dangerouslySetInnerHTML={{ __html: nodeData.svg }} />;
  }

  if (selfClosingTags.includes(tag)) {
    return <Component className={className || undefined} style={style} {...attributes} />;
  }

  return (
    <Component className={className || undefined} style={style} {...attributes}>
      {nodeData.characters && (
        <span className="text-node" style={{ 
          display: 'block',
          width: '100%',
          height: '100%',
          whiteSpace: 'pre-line',
          wordBreak: 'normal'
        }}>
          {nodeData.characters}
        </span>
      )}
      {children.map((child, i) => (
        <FigmaRenderer
          key={i}
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
      .then(res => res.json())
      .then(setFigmaJson)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && figmaJson?.node?.width) {
        const containerWidth = containerRef.current.offsetWidth;
        setScale(containerWidth / figmaJson.node.width);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [figmaJson]);

  if (!figmaJson) return <div>Loading design...</div>;

  return (
    <>
      <GlobalStyles />
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: `${(figmaJson.node.height / figmaJson.node.width) * 100}%`,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: figmaJson.node.width,
            height: figmaJson.node.height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left'
          }}
        >
          {/* ← swap this: */}
          <GeneratedComponent />
        </div>
      </div>
    </>
  );
};

export default App;