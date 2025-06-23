const express = require('express');
const multer = require('multer');
const archiver = require('archiver');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

// Your existing functions (copied as-is)
function color(fills) {
  if (!fills || fills.length === 0) return "";
  const solidFill = fills.find(f => f.type === "SOLID");
  const gradientFill = fills.find(f => f.type === "GRADIENT_LINEAR");
  if (gradientFill) {
    const stops = gradientFill.gradientStops.map(stop => 
      `rgba(${Math.round(stop.color.r * 255)},${Math.round(stop.color.g * 255)},${Math.round(stop.color.b * 255)},${stop.color.a}) ${stop.position * 100}%`
    ).join(", ");
    return `linear-gradient(90deg, ${stops})`;
  }
  if (solidFill && solidFill.color) {
    const { r, g, b, a } = solidFill.color;
    return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a})`;
  }
  return "";
}

function getImageUrl(node) {
  if (node.fills) {
    const imageFill = node.fills.find(fill => fill.type === "IMAGE");
    if (imageFill && imageFill.imageRef) {
      return imageFill.imageRef;
    }
  }
  return null;
}

function escapeStyleValue(value) {
  if (typeof value === "string") {
    return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"');
  }
  return value;
}

function getCompleteStyle(node, parentPosition = { x: 0, y: 0 }, tag = "") {
  const style = {};
  const isRoot = parentPosition.x === 0 && parentPosition.y === 0;

  if (node && !isRoot && node.x !== undefined && node.y !== undefined) {
    const relativeX = Math.max(0, node.x - parentPosition.x);
    const relativeY = Math.max(0, node.y - parentPosition.y);
    style.position = "absolute";
    style.left = `${relativeX}px`;
    style.top = `${relativeY}px`;
  }

  if (node && node.width !== undefined) style.width = `${node.width}px`;
  if (node && node.height !== undefined) style.height = `${node.height}px`;

  if (node && node.fills && node.fills.length > 0 && node.type !== "TEXT") {
    const bgColor = color(node.fills);
    if (bgColor) style.backgroundColor = bgColor;
  }

  const imageUrl = getImageUrl(node);
  if (imageUrl && node.children && node.children.length > 0) {
    style.backgroundImage = `url("${imageUrl}")`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
  }

  const { topLeftRadius = 0, topRightRadius = 0, bottomRightRadius = 0, bottomLeftRadius = 0 } = node || {};
  if (node && (topLeftRadius || topRightRadius || bottomRightRadius || bottomLeftRadius)) {
    if (topLeftRadius === topRightRadius && topRightRadius === bottomRightRadius && bottomRightRadius === bottomLeftRadius) {
      style.borderRadius = `${topLeftRadius}px`;
    } else {
      style.borderRadius = `${topLeftRadius}px ${topRightRadius}px ${bottomRightRadius}px ${bottomLeftRadius}px`;
    }
  }

  if (node && node.type === "ELLIPSE") style.borderRadius = "50%";

  if (node && node.strokes && node.strokes.length > 0) {
    const strokeColor = color(node.strokes);
    const strokeWeight = node.strokeWeight || node.StrokeWeight || 1;
    if (strokeColor && strokeWeight > 0) style.border = `${strokeWeight}px solid ${strokeColor}`;
  }

  if (node.effects && node.effects.some(effect => effect.type === "DROP_SHADOW")) {
    const shadow = node.effects.find(effect => effect.type === "DROP_SHADOW");
    style.boxShadow = `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px rgba(${Math.round(shadow.color.r * 255)},${Math.round(shadow.color.g * 255)},${Math.round(shadow.color.b * 255)},${shadow.color.a})`;
  }

  if (node.zIndex !== undefined) style.zIndex = node.zIndex;

  if (node && (node.type === "TEXT" || tag === "P" || tag === "LABEL")) {
    if (node.textStyle) {
      const textStyle = node.textStyle;
      if (textStyle.fontFamily) style.fontFamily = `${textStyle.fontFamily}, sans-serif`;
      if (textStyle.fontSize) style.fontSize = `${textStyle.fontSize}px`;
      if (textStyle.fontWeight) style.fontWeight = textStyle.fontWeight;
      if (textStyle.textAlignHorizontal) style.textAlign = textStyle.textAlignHorizontal.toLowerCase();
      if (textStyle.lineHeightPx) style.lineHeight = `${textStyle.lineHeightPx}px`;
      if (textStyle.textDecoration === "UNDERLINE") style.textDecoration = "underline";
    }
    const textColor = color(node.fills);
    if (textColor) style.color = textColor;
    if (node.textAlignHorizontal) style.textAlign = node.textAlignHorizontal.toLowerCase();
    style.backgroundColor = "transparent";
  }

  if (tag === "BUTTON") {
    style.cursor = "pointer";
    style.display = "flex";
    style.alignItems = "center";
    style.justifyContent = "center";
    style.border = style.border || "none";
    style.outline = "none";
    style.padding = "0";
    style.margin = "0";
    style.boxSizing = "border-box";
  }

  if (tag === "INPUT") {
    style.outline = "none";
    style.boxSizing = "border-box";
  }

  return Object.fromEntries(Object.entries(style).filter(([_, v]) => v !== undefined && v !== ""));
}

function shouldUseTypography(node) {
  return node && node.type === "TEXT" && node.characters;
}

function shouldUseButton(node, children) {
  const buttonKeywords = ["continue", "create", "sign", "log", "login", "submit", "read", "subscribe"];
  const hasButtonText = children && children.some(child =>
    child.node && child.node.type === "TEXT" && child.node.characters &&
    buttonKeywords.some(keyword => child.node.characters.toLowerCase().includes(keyword))
  );
  return hasButtonText || (
    node && (node.type === "RECTANGLE" || node.type === "INSTANCE") &&
    node.height && node.height > 30 && node.height < 80 &&
    node.width && node.width > 100 && node.width < 400 &&
    node.fills && node.fills.length > 0
  );
}

function shouldUseInput(node) {
  return (
    node &&
    (node.type === "FRAME" || node.type === "RECTANGLE") &&
    node.height && node.height > 30 && node.height < 100 &&
    node.width && node.width > 150 && node.width < 800
  );
}

function findTextInChildren(children) {
  if (!children) return "";
  for (const child of children) {
    if (child && child.node && child.node.type === "TEXT" && child.node.characters) {
      return child.node.characters;
    }
    if (child && child.children) {
      const text = findTextInChildren(child.children);
      if (text) return text;
    }
  }
  return "";
}

function findTextColorInChildren(children) {
  if (!children) return "";
  for (const child of children) {
    if (child && child.node && child.node.type === "TEXT" && child.node.fills) {
      const textColor = color(child.node.fills);
      if (textColor) return textColor;
    }
    if (child && child.children) {
      const textColor = findTextColorInChildren(child.children);
      if (textColor) return textColor;
    }
  }
  return "";
}

function ensureContrastingColors(backgroundColor, textColor) {
  if (!backgroundColor || !textColor) return textColor;
  const bgMatch = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  const textMatch = textColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!bgMatch || !textMatch) return textColor;

  const bgR = Number.parseInt(bgMatch[1]);
  const bgG = Number.parseInt(bgMatch[2]);
  const bgB = Number.parseInt(bgMatch[3]);
  const textR = Number.parseInt(textMatch[1]);
  const textG = Number.parseInt(textMatch[2]);
  const textB = Number.parseInt(textMatch[3]);

  const bgLuminance = (0.299 * bgR + 0.587 * bgG + 0.114 * bgB) / 255;
  const textLuminance = (0.299 * textR + 0.587 * textG + 0.114 * textB) / 255;
  const contrast = Math.abs(bgLuminance - textLuminance);

  if (contrast < 0.5) {
    return bgLuminance > 0.5 ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)";
  }
  return textColor;
}

function generateComponentCode(node, parentPosition = { x: 0, y: 0 }, level = 0) {
  if (!node || (node.node && node.node.visitation === false)) {
    return "";
  }

  const indent = "  ".repeat(level + 1);
  let componentName = "div";
  let props = {};
  let skipChildren = false;

  if (node.node && (node.node.type === "IMAGE" || (getImageUrl(node.node) && !node.children))) {
    componentName = "img";
    props = {
      src: getImageUrl(node.node),
      alt: node.node.name || "image",
      style: getCompleteStyle(node.node, parentPosition),
    };
    skipChildren = true;
  } else if (shouldUseTypography(node.node)) {
    const fontSize = node.node.textStyle?.fontSize || node.node.fontSize || 16;
    componentName = fontSize > 24 ? "Typography.Heading" : "Typography.Text";
    props = {
      children: node.node.characters,
      style: getCompleteStyle(node.node, parentPosition, "P"),
    };
    if (componentName === "Typography.Heading") {
      props.size = fontSize > 32 ? "xl" : "lg";
    }
    skipChildren = true;
  } else if (shouldUseButton(node.node, node.children)) {
    componentName = "Button";
    const buttonText = findTextInChildren(node.children);
    const buttonStyle = getCompleteStyle(node.node, parentPosition, "BUTTON");
    let textColor = findTextColorInChildren(node.children);
    if (buttonStyle.backgroundColor && textColor) {
      textColor = ensureContrastingColors(buttonStyle.backgroundColor, textColor);
    }
    if (textColor) buttonStyle.color = textColor;
    props = {
      children: buttonText,
      className: "",
      style: buttonStyle,
    };
    skipChildren = true;
  } else if (shouldUseInput(node.node)) {
    componentName = "Input";
    const inputStyle = getCompleteStyle(node.node, parentPosition, "INPUT");
    const placeholder = findTextInChildren(node.children);
    props = {
      type: "text",
      className: "",
      style: inputStyle,
    };
    if (placeholder) {
      props.placeholder = placeholder;
      skipChildren = true;
    }
  } else if (node.node && node.node.type === "RECTANGLE" && node.node.height <= 5) {
    componentName = "hr";
    props = {
      style: {
        ...getCompleteStyle(node.node, parentPosition, "HR"),
        border: "none",
        margin: 0,
      },
    };
    skipChildren = true;
  } else {
    componentName = "div";
    props = {
      style: getCompleteStyle(node.node, parentPosition, "DIV"),
    };
    if (node.node && node.children && node.children.length > 1) {
      const isHorizontal = node.children.every(child => 
        child.node.y === node.children[0].node.y
      );
      props.style.display = "flex";
      props.style.flexDirection = isHorizontal ? "row" : "column";
      props.style.gap = "20px";
    }
  }

  const propsString = Object.entries(props)
    .map(([key, value]) => {
      if (key === "style" && value && Object.keys(value).length > 0) {
        const styleStr = Object.entries(value)
          .map(([k, v]) => `${k}: "${escapeStyleValue(v)}"`)
          .join(", ");
        return `style={{ ${styleStr} }}`;
      }
      if (key === "className" && value === "") return `className=""`;
      if (key === "className" && value) return `${key}="${value}"`;
      if (key === "size" && value) return `${key}="${value}"`;
      if (key === "type" && value) return `${key}="${value}"`;
      if (key === "placeholder" && value) return `${key}="${escapeStyleValue(value)}"`;
      if (typeof value === "string" && value && key !== "children") return `${key}="${escapeStyleValue(value)}"`;
      return "";
    })
    .filter(Boolean)
    .join(" ");

  if (skipChildren || !node.children || node.children.length === 0) {
    if (props.children) {
      return `${indent}<${componentName} ${propsString}>${escapeStyleValue(props.children)}</${componentName}>`;
    }
    return `${indent}<${componentName} ${propsString} />`;
  }

  const childrenCode = (node.children || [])
    .map((child) => generateComponentCode(child, { x: node.node?.x || 0, y: node.node?.y || 0 }, level + 1))
    .filter(Boolean)
    .join("\n");

  if (childrenCode) {
    return `${indent}<${componentName} ${propsString}>\n${childrenCode}\n${indent}</${componentName}>`;
  } else {
    return `${indent}<${componentName} ${propsString} />`;
  }
}

function generatePage(json) {
  if (!json) {
    console.log("Root JSON is undefined");
    return "";
  }

  const pageCode = generateComponentCode(json, { x: 0, y: 0 }, 0);
  const rootWidth = json.node?.width || 1441;
  const rootHeight = json.node?.height || 1024;
  let backgroundColor = "rgba(240, 242, 245, 1)";
  if (json.children && json.children[0] && json.children[0].node && json.children[0].node.fills) {
    const firstChildBg = color(json.children[0].node.fills);
    if (firstChildBg) backgroundColor = firstChildBg;
  }

  return `import React from 'react';
import Button from './components/Button';
import Input from './components/Input';
import Typography from './components/Typography';

export default function GeneratedPage() {
  return (
    <div className="w-full min-h-screen relative flex items-center justify-center" style={{ backgroundColor: '${backgroundColor}' }}>
      <div className="relative max-w-[${rootWidth}px] w-full" style={{ minHeight: '${rootHeight}px' }}>
${pageCode}
      </div>
    </div>
  );
}`;
}

const app = express();
const uploadPath = '/data/uploads';

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const upload = multer({ dest: uploadPath });

// Endpoint to receive Figma JSON and send ZIP
app.post('/generate-react', upload.single('figmaJson'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  // Rename the uploaded file to FigmaData.json
  const oldPath = req.file.path;
  const newPath = path.join(uploadPath, 'FigmaData.json');
  fs.renameSync(oldPath, newPath);

  try {
    // Read the JSON file
    const jsonData = fs.readFileSync(newPath, 'utf8');
    const json = JSON.parse(jsonData);

    // Generate React code using your script's logic
    const reactCode = generatePage(json);

    // Write the generated React code to src/GeneratedPage.jsx
    const outputPath = path.join(__dirname, 'src', 'GeneratedPage.jsx');
    fse.ensureDirSync(path.dirname(outputPath));
    fs.writeFileSync(outputPath, reactCode, 'utf8');

    // Create ZIP file
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Compression level
    });

    // Set response headers
    res.attachment('react-project.zip');
    archive.pipe(res);

    // Add project files to ZIP, excluding node_modules
    archive.directory(__dirname, false, {
      ignore: ['node_modules', 'uploads', '.git', '*.zip'], // Exclude unwanted dirs/files
    });

    // Finalize the ZIP
    archive.finalize();

  } catch (error) {
    console.error('Error processing request:', error.message);
    res.status(500).send('Error processing the JSON or generating ZIP');
  } finally {
    // Clean up uploaded file
    if (fs.existsSync(newPath)) {
      fs.unlinkSync(newPath);
    }
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} at ${new Date().toLocaleString('en-US', { timeZone: 'Europe/Helsinki' })}`);
});