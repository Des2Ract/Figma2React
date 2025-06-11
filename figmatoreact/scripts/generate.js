// codegen.js
const fs = require('fs');
const prettier = require('prettier'); // optional, for formatting

// Reuse your ComponentMap & helpers:
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

function styleToString(styleObj) {
  const entries = Object.entries(styleObj)
    .map(([k,v]) => {
      // convert camelCase to kebab or keep camelCase for React
      const key = k;
      const val = typeof v === 'string' ? `"${v}"` : v;
      return `${key}: ${val}`;
    });
  return `{ ${entries.join(', ')} }`;
}

function attrsToString(tag, nodeData) {
  const attrs = [];
  // href, src, alt, etc.
  if (tag === 'A' && nodeData.linkUnfurlData?.url) {
    attrs.push(`href="${nodeData.linkUnfurlData.url}"`);
  }
  // add more cases...
  return attrs.join(' ');
}

function generateJSX(node, indent = 2) {
  const { tag, node: data, children = [] } = node;
  const jsxTag = ComponentMap[tag] || 'div';
  const cls = tagClassMap[tag];
  const isText = !!data.characters;
  const styleObj = {}; 
  // replicate getStyleFromNode for styles, but output values directly:
  styleObj.position = "'absolute'";
  styleObj.left = data.x || 0;
  styleObj.top = data.y || 0;
  styleObj.width = data.width || 'auto';
  styleObj.height = data.height || 'auto';
  // …and all the other style logic…

  const indentStr = ' '.repeat(indent);
  const classProp = cls ? ` className="${cls}"` : '';
  const styleProp = ` style={${styleToString(styleObj)}}`;
  const attrProp = attrsToString(tag, data) ? ' ' + attrsToString(tag, data) : '';

  // self closing?
  const selfClosing = ['IMG','INPUT','BR'].includes(tag);
  let lines = [];

  // opening
  if (selfClosing) {
    lines.push(`${indentStr}<${jsxTag}${classProp}${styleProp}${attrProp} />`);
    return lines.join('\n');
  }

  lines.push(`${indentStr}<${jsxTag}${classProp}${styleProp}${attrProp}>`);

  // text node
  if (isText) {
    const text = data.characters.replace(/\n/g, '\\n');
    lines.push(`${indentStr}  ${text}`);
  }

  // children
  children.forEach(child => {
    lines.push(generateJSX(child, indent + 2));
  });

  // closing
  lines.push(`${indentStr}</${jsxTag}>`);
  return lines.join('\n');
}

function wrapComponent(bodyJSX) {
  return `
import React from 'react';

export default function GeneratedComponent() {
  return (
${bodyJSX}
  );
}
`;
}

// --- Usage:
;(async () => {
    const figmaJson = JSON.parse(
      fs.readFileSync('./public/figmaData.json', 'utf8')
    );
    const bodyJSX = generateJSX(figmaJson, 4);
    const rawSource = wrapComponent(bodyJSX);
  
    // prettier.format is sync, but in case you ever switch to an async formatter:
    const formatted = await prettier
      .format(rawSource, { parser: 'babel', singleQuote: true });
  
    fs.writeFileSync('./src/GeneratedComponent.jsx', formatted, 'utf8');
    console.log('✅ GeneratedComponent.jsx written.');
  })();
