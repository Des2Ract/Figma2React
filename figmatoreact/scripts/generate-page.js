#!/usr/bin/env node
const fs = require("fs")
const path = require("path")

function color(fills) {
  if (!fills || fills.length === 0) return ""
  const solidFill = fills.find((f) => f.type === "SOLID")
  if (solidFill && solidFill.color) {
    const { r, g, b, a } = solidFill.color
    if (a !== undefined && a > 0) {
      return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a})`
    }
  }
  return ""
}

function getImageUrl(nodeData) {
  // Check for imageUrl property first (like in your login form)
  if (nodeData && nodeData.imageUrl) {
    return nodeData.imageUrl
  }
  // Check for imageRef in fills (like in travel JSON)
  if (nodeData && nodeData.node && nodeData.node.fills) {
    const imageFill = nodeData.node.fills.find((fill) => fill.type === "IMAGE")
    if (imageFill && imageFill.imageRef) {
      return imageFill.imageRef
    }
  }
  return null
}

function escapeStyleValue(value) {
  if (typeof value === "string") {
    return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"')
  }
  return value
}

function getStyle(node, parentPosition = { x: 0, y: 0 }) {
  const style = {}

  // Positioning - always use absolute to match Figma exactly
  if (node && node.x !== undefined && node.y !== undefined) {
    style.position = "absolute"
    style.left = `${node.x - parentPosition.x}px`
    style.top = `${node.y - parentPosition.y}px`
  }

  // Dimensions
  if (node && node.width !== undefined) {
    style.width = `${node.width}px`
  }
  if (node && node.height !== undefined) {
    style.height = `${node.height}px`
  }

  // Background color (only for non-text elements)
  if (node && node.fills && node.fills.length > 0 && node.type !== "TEXT") {
    const bgColor = color(node.fills)
    if (bgColor && bgColor !== "rgba(0, 0, 0, 0)") {
      style.backgroundColor = bgColor
    }
  }

  // Border radius
  const { topLeftRadius = 0, topRightRadius = 0, bottomRightRadius = 0, bottomLeftRadius = 0 } = node || {}
  if (topLeftRadius || topRightRadius || bottomRightRadius || bottomLeftRadius) {
    if (
      topLeftRadius === topRightRadius &&
      topRightRadius === bottomRightRadius &&
      bottomRightRadius === bottomLeftRadius
    ) {
      style.borderRadius = `${topLeftRadius}px`
    } else {
      style.borderRadius = `${topLeftRadius}px ${topRightRadius}px ${bottomRightRadius}px ${bottomLeftRadius}px`
    }
  }

  // Text styling
  if (node && node.type === "TEXT") {
    if (node.textStyle) {
      if (node.textStyle.fontFamily) style.fontFamily = `${node.textStyle.fontFamily}, sans-serif`
      if (node.textStyle.fontSize) style.fontSize = `${node.textStyle.fontSize}px`
      if (node.textStyle.fontWeight) style.fontWeight = node.textStyle.fontWeight
      if (node.textStyle.textAlignHorizontal) style.textAlign = node.textStyle.textAlignHorizontal.toLowerCase()
      if (node.textStyle.lineHeightPx) style.lineHeight = `${node.textStyle.lineHeightPx}px`
    }
    const textColor = color(node.fills)
    if (textColor) style.color = textColor
  }

  // Borders
  if (node && node.strokes && node.strokes.length > 0) {
    const strokeColor = color(node.strokes)
    const strokeWeight = node.strokeWeight || node.StrokeWeight || 1
    if (strokeColor && strokeWeight > 0) {
      style.border = `${strokeWeight}px solid ${strokeColor}`
    }
  }

  return style
}

// UNIVERSAL: Process every single node in the tree
function generateComponent(nodeData, parentPosition = { x: 0, y: 0 }, level = 0) {
  if (!nodeData || !nodeData.node) return ""

  const indent = "  ".repeat(level + 1)
  const node = nodeData.node
  const components = []

  // 1. Handle background images (but don't stop processing!)
  const imageUrl = getImageUrl(nodeData)
  if (imageUrl) {
    const style = getStyle(node, parentPosition)
    const styleStr = Object.entries(style)
      .map(([k, v]) => `${k}: "${escapeStyleValue(v)}"`)
      .join(", ")

    components.push(`${indent}<img 
${indent}  src="${imageUrl}" 
${indent}  alt="${nodeData.name || "image"}"
${indent}  style={{ ${styleStr} }}
${indent}/>`)
  }

  // 2. Handle text elements
  if (node.type === "TEXT" && node.characters) {
    const style = getStyle(node, parentPosition)
    const styleStr = Object.entries(style)
      .map(([k, v]) => `${k}: "${escapeStyleValue(v)}"`)
      .join(", ")

    components.push(`${indent}<div style={{ ${styleStr} }}>
${indent}  ${escapeStyleValue(node.characters)}
${indent}</div>`)
  }

  // 3. Handle all other elements with children
  if (nodeData.children && nodeData.children.length > 0) {
    const childrenCode = nodeData.children
      .map((child) => generateComponent(child, { x: node.x || 0, y: node.y || 0 }, level + 1))
      .filter(Boolean)
      .join("\n")

    if (childrenCode) {
      // Only create a container if this node has styling or if it's not just a wrapper
      const style = getStyle(node, parentPosition)
      const hasVisualStyling = style.backgroundColor || style.border || style.borderRadius

      if (hasVisualStyling || Object.keys(style).length > 2) {
        // More than just position
        const styleStr = Object.entries(style)
          .map(([k, v]) => `${k}: "${escapeStyleValue(v)}"`)
          .join(", ")

        components.push(`${indent}<div style={{ ${styleStr} }}>
${childrenCode}
${indent}</div>`)
      } else {
        // Just add the children without extra wrapper
        components.push(childrenCode)
      }
    }
  }
  // 4. Handle leaf elements (no children, no text, no image)
  else if (!node.characters && !imageUrl) {
    const style = getStyle(node, parentPosition)
    if (Object.keys(style).length > 0) {
      const styleStr = Object.entries(style)
        .map(([k, v]) => `${k}: "${escapeStyleValue(v)}"`)
        .join(", ")
      components.push(`${indent}<div style={{ ${styleStr} }} />`)
    }
  }

  return components.join("\n")
}

function generatePage(json) {
  if (!json) {
    console.log("Root JSON is undefined")
    return ""
  }

  const pageCode = generateComponent(json, { x: 0, y: 0 }, 0)
  const rootWidth = json.node?.width || 1441
  const rootHeight = json.node?.height || 1024

  // Use a neutral background - let the design speak for itself
  let backgroundColor = "rgba(255, 255, 255, 1)" // White default

  // Only use background from JSON if it's not transparent
  if (json.node && json.node.fills) {
    const bgColor = color(json.node.fills)
    if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && !bgColor.includes("rgba(0, 0, 0, 0)")) {
      backgroundColor = bgColor
    }
  }

  return `import React from 'react';

export default function GeneratedPage() {
  return (
    <div 
      className="relative overflow-auto mx-auto"
      style={{ 
        width: '${rootWidth}px',
        height: '${rootHeight}px',
        backgroundColor: '${backgroundColor}'
      }}
    >
${pageCode}
    </div>
  );
}
`
}

// Execute
const jsonPath = path.join(__dirname, "../public/figmaData.json")
const outputPath = path.join(__dirname, "../src/GeneratedPage.jsx")

try {
  console.log("📖 Reading JSON...")
  const jsonData = fs.readFileSync(jsonPath, "utf8")
  const json = JSON.parse(jsonData)

  console.log("🚀 Generating universal layout...")
  const code = generatePage(json)

  fs.writeFileSync(outputPath, code, "utf8")
  console.log("✅ Universal layout generated!")
  console.log(`📊 Root dimensions: ${json.node?.width || "unknown"}x${json.node?.height || "unknown"}`)
} catch (error) {
  console.error("❌ Error:", error.message)
}










// app.post('/generate-react', (req, res) => {
//   const data = req.body;
//   try {
//     const json = data;
//     const reactCode = generatePage(json);
//     const outputPath = path.join(__dirname, '..', 'src', 'GeneratedPage.jsx');
//     fse.ensureDirSync(path.dirname(outputPath));
//     fs.writeFileSync(outputPath, reactCode, 'utf8');

//     const archive = archiver('zip', { zlib: { level: 9 } });
//     res.attachment('react-project.zip');
//     archive.pipe(res);
//     archive.directory(path.join(__dirname, '..'), false, {
//       ignore: ['node_modules', 'uploads', '.git', '*.zip'],
//     });
//     archive.finalize();
//   } catch (error) {
//     console.error('Error processing request:', error.message);
//     res.status(500).send('Error processing the JSON or generating ZIP');
//   }
// });

// const PORT = process.env.PORT || 7860;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT} at ${new Date().toLocaleString('en-US', { timeZone: 'Europe/Helsinki' })}`);
// });