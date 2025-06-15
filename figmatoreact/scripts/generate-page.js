#!/usr/bin/env node
const fs = require("fs")
const path = require("path")

const tagToComponent = {
  DIV: "div",
  FORM: "Form",
  NAVBAR: "Navbar",
  P: "Typography.Text",
  BUTTON: "Button",
  INPUT: "Input",
  LABEL: "Label",
  CHECKBOX: "Checkbox",
  HR: "hr",
  SVG: "img",
  LI: "li",
}

function color(fills) {
  if (!fills || fills.length === 0) return ""
  const solidFill = fills.find((f) => f.type === "SOLID")
  if (solidFill && solidFill.color) {
    const { r, g, b, a } = solidFill.color
    if (a > 0) {
      return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a})`
    }
  }
  return ""
}

function escapeStyleValue(value) {
  if (typeof value === "string") {
    return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")
  }
  return value
}

function getCompleteStyle(node, parentPosition = { x: 0, y: 0 }, tag = "") {
  const style = {}
  const isRoot = parentPosition.x === 0 && parentPosition.y === 0

  if (!isRoot && node.x !== undefined && node.y !== undefined) {
    const relativeX = node.x - parentPosition.x
    const relativeY = node.y - parentPosition.y
    style.position = "absolute"
    style.left = `${relativeX}px`
    style.top = `${relativeY}px`
  }

  if (node.width && node.height) {
    style.width = `${node.width}px`
    style.height = `${node.height}px`
  }

  if (node.type !== "TEXT" && tag !== "P" && tag !== "LABEL") {
    if (node.fills && node.fills.length > 0) {
      const bgColor = color(node.fills)
      if (bgColor) {
        style.backgroundColor = bgColor
      }
    }
  }

  if (node.strokes && node.strokes.length > 0) {
    const strokeColor = color(node.strokes)
    const strokeWeight = node.strokeWeight || node.StrokeWeight || 1
    if (strokeColor) {
      style.border = `${strokeWeight}px solid ${strokeColor}`
    }
  }

  const { topLeftRadius = 0, topRightRadius = 0, bottomRightRadius = 0, bottomLeftRadius = 0 } = node
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

  if (node.type === "TEXT" || tag === "P" || tag === "LABEL") {
    if (node.fontName) {
      const fontFamily = node.fontName.family
      if (fontFamily === "Permanent Marker") {
        style.fontFamily = "Permanent Marker, cursive"
      } else {
        style.fontFamily = `${fontFamily}, sans-serif`
      }
      if (node.fontName.style) {
        const fontStyle = node.fontName.style.toLowerCase()
        if (fontStyle.includes("bold")) {
          style.fontWeight = "bold"
        }
        if (fontStyle.includes("italic")) {
          style.fontStyle = "italic"
        }
      }
    }
    if (node.fontSize) {
      style.fontSize = `${node.fontSize}px`
    }
    const textColor = color(node.fills) || "rgba(0,0,0,1)"
    style.color = textColor
    style.backgroundColor = "transparent"
    if (node.textAlignHorizontal) {
      style.textAlign = node.textAlignHorizontal.toLowerCase()
    }
    if (node.lineHeight && typeof node.lineHeight === "object" && node.lineHeight.value) {
      style.lineHeight = `${node.lineHeight.value}px`
    }
    if (tag === "P" && node.characters && node.characters.includes("Terms")) {
      style.whiteSpace = "nowrap"
    }
  }

  if (node.effects && node.effects.length > 0) {
    const shadows = node.effects
      .filter((effect) => effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW")
      .map((effect) => {
        const { offset, radius, color: shadowColor } = effect
        const colorStr = shadowColor
          ? `rgba(${Math.round(shadowColor.r * 255)}, ${Math.round(shadowColor.g * 255)}, ${Math.round(shadowColor.b * 255)}, ${shadowColor.a || 1})`
          : "rgba(0, 0, 0, 0.25)"
        const x = offset?.x || 0
        const y = offset?.y || 0
        const blur = radius || 0
        return effect.type === "INNER_SHADOW"
          ? `inset ${x}px ${y}px ${blur}px ${colorStr}`
          : `${x}px ${y}px ${blur}px ${colorStr}`
      })
    if (shadows.length > 0) {
      style.boxShadow = shadows.join(", ")
    }
  }

  if (node.opacity !== undefined && node.opacity < 1) {
    style.opacity = node.opacity
  }

  return Object.fromEntries(Object.entries(style).filter(([_, v]) => v !== undefined && v !== ""))
}

const componentConfig = {
  DIV: {
    getProps: (node, children, parentPosition) => ({
      className: "relative",
      style: getCompleteStyle(node, parentPosition, "DIV"),
    }),
  },
  FORM: {
    getProps: (node, children, parentPosition) => ({
      className: "space-y-4",
      style: getCompleteStyle(node, parentPosition, "FORM"),
    }),
  },
  NAVBAR: {
    getProps: (node, children, parentPosition) => {
      const extractNavbarContent = (children) => {
        const pElements = []
        const buttons = []
        const traverse = (items) => {
          items.forEach((child) => {
            if (child.tag === "P" && child.node.characters) {
              pElements.push(child)
            } else if (child.tag === "BUTTON") {
              buttons.push(child)
            } else if (child.children) {
              traverse(child.children)
            }
          })
        }
        traverse(children)
        return { pElements, buttons }
      }
      const { pElements, buttons } = extractNavbarContent(children)
      return {
        brand: pElements[0]?.node.characters || "",
        items: pElements.slice(1).map((p) => p.node.characters).filter(Boolean),
        cta: buttons[0]?.children?.[0]?.node.characters || null,
        style: getCompleteStyle(node, parentPosition, "NAVBAR"),
      }
    },
    skipChildren: true,
  },
  P: {
    getProps: (node, children, parentPosition) => ({
      children: node.characters || "",
      style: getCompleteStyle(node, parentPosition, "P"),
    }),
  },
  BUTTON: {
    getProps: (node, children, parentPosition) => {
      // Recursive search for text node
      function findTextNode(children) {
        for (let child of children) {
          if (child.node.type === "TEXT" && child.node.characters) {
            return child.node.characters;
          } else if (child.children) {
            const text = findTextNode(child.children);
            if (text) return text;
          }
        }
        return null;
      }

      let buttonText = findTextNode(children) || node.characters || "";
      return {
        children: buttonText,
        style: {
          ...getCompleteStyle(node, parentPosition, "BUTTON"),
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: findTextNode(children) ? color(children.find((c) => c.node.type === "TEXT").node.fills) || "rgba(0,0,0,1)" : "rgba(0,0,0,1)",
        },
      };
    },
    skipChildren: true,
  },
  INPUT: {
    getProps: (node, children, parentPosition) => {
      const placeholderNode = children.find((child) => child.tag === "P")
      return {
        placeholder: placeholderNode ? placeholderNode.node.characters : "",
        type: node.characters?.toLowerCase().includes("password") ? "password" : "text",
        style: {
          ...getCompleteStyle(node, parentPosition, "INPUT"),
          padding: "8px 12px",
          outline: "none",
        },
      }
    },
    skipChildren: true,
  },
  SVG: {
    getProps: (node, children, parentPosition) => ({
      src: "",
      alt: "icon",
      style: getCompleteStyle(node, parentPosition, "SVG"),
    }),
  },
  CHECKBOX: {
    getProps: (node, children, parentPosition) => ({
      type: "checkbox",
      style: getCompleteStyle(node, parentPosition, "CHECKBOX"),
    }),
  },
  LABEL: {
    getProps: (node, children, parentPosition) => ({
      children: node.characters || "",
      htmlFor: node.characters ? node.characters.toLowerCase().replace(/\s/g, "-") : "",
      style: getCompleteStyle(node, parentPosition, "LABEL"),
    }),
  },
  HR: {
    getProps: (node, children, parentPosition) => ({
      style: {
        ...getCompleteStyle(node, parentPosition, "HR"),
        border: "none",
        borderTop: "1px solid currentColor",
        margin: 0,
      },
    }),
  },
  LI: {
    getProps: (node, children, parentPosition) => ({
      style: {
        ...getCompleteStyle(node, parentPosition, "LI"),
        display: "flex",
        alignItems: "center",
      },
    }),
  },
}

function generateComponentCode(node, parentPosition = { x: 0, y: 0 }, level = 0) {
  const config = componentConfig[node.tag] || {}
  const componentName = tagToComponent[node.tag] || "div"
  const props = config.getProps
    ? config.getProps(node.node, node.children, parentPosition)
    : { style: getCompleteStyle(node.node, parentPosition, node.tag) }

  const indent = "  ".repeat(level + 1)
  const propsString = Object.entries(props)
    .map(([key, value]) => {
      if (key === "style" && value && Object.keys(value).length > 0) {
        const styleStr = Object.entries(value)
          .map(([k, v]) => `${k}: "${escapeStyleValue(v)}"`)
          .join(", ")
        return `style={{ ${styleStr} }}`
      }
      if (key === "className" && value) return `${key}="${value}"`
      if (typeof value === "string" && value) return `${key}="${escapeStyleValue(value)}"`
      if (value === null) return ""
      if (Array.isArray(value)) return `${key}={${JSON.stringify(value)}}`
      return ""
    })
    .filter(Boolean)
    .join(" ")

  if (config.skipChildren || !node.children || node.children.length === 0) {
    if (props.children) {
      return `${indent}<${componentName} ${propsString}>${escapeStyleValue(props.children)}</${componentName}>`
    }
    return `${indent}<${componentName} ${propsString} />`
  }

  const childrenCode = node.children
    .map((child) => generateComponentCode(child, { x: node.node.x || 0, y: node.node.y || 0 }, level + 1))
    .join("\n")
  return `${indent}<${componentName} ${propsString}>\n${childrenCode}\n${indent}</${componentName}>`
}

function generatePage(json) {
  const pageCode = generateComponentCode(json, { x: 0, y: 0 }, 1)
  return `import React from 'react';
import Navbar from './components/Navbar';
import Form from './components/Form';
import Label from './components/Label';
import Input from './components/Input';
import Checkbox from './components/Checkbox';
import Button from './components/Button';
import Typography from './components/Typography';

export default function GeneratedPage() {
  return (
    <div className="relative w-[668px] h-[579px] mx-auto">
      ${pageCode}
    </div>
  );
}
`
}

// Read JSON and write generated code
const jsonPath = path.join(__dirname, "../public/figmaData.json")
const outputPath = path.join(__dirname, "../src/GeneratedPage.jsx")

try {
  const jsonData = fs.readFileSync(jsonPath, "utf8")
  const json = JSON.parse(jsonData)
  const code = generatePage(json)
  fs.writeFileSync(outputPath, code, "utf8")
  console.log("✅ GeneratedPage.jsx written successfully.")
  console.log("🔧 Fixed JSX syntax errors with proper string escaping")
} catch (error) {
  console.error("Error generating page:", error.message)
}