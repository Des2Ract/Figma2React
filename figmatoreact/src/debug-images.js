#!/usr/bin/env node
const fs = require("fs")
const path = require("path")

// Let's add debugging to see what's happening with images
function debugNode(node, depth = 0) {
  const indent = "  ".repeat(depth)

  if (node.node) {
    console.log(`${indent}Node: ${node.node.type} (${node.node.name || "unnamed"})`)

    // Check for image fills
    if (node.node.fills && node.node.fills.length > 0) {
      node.node.fills.forEach((fill, i) => {
        console.log(`${indent}  Fill ${i}: ${fill.type}`)
        if (fill.type === "IMAGE") {
          console.log(`${indent}    Image URL: ${fill.imageRef || "NO URL"}`)
        }
        if (fill.type === "SOLID") {
          console.log(
            `${indent}    Color: rgba(${Math.round(fill.color.r * 255)}, ${Math.round(fill.color.g * 255)}, ${Math.round(fill.color.b * 255)}, ${fill.color.a})`,
          )
        }
      })
    }

    // Check children
    if (node.children && node.children.length > 0) {
      console.log(`${indent}  Children: ${node.children.length}`)
      node.children.forEach((child) => debugNode(child, depth + 1))
    }
  }
}

// Read and debug the JSON
const jsonPath = path.join(__dirname, "../public/figmaData.json")

try {
  console.log("🔍 Debugging Figma JSON structure...")
  const jsonData = fs.readFileSync(jsonPath, "utf8")
  const json = JSON.parse(jsonData)

  console.log("Root structure:")
  console.log("- Has node:", !!json.node)
  console.log("- Has children:", !!json.children)
  console.log("- Children count:", json.children ? json.children.length : 0)

  console.log("\n📋 Full node tree:")
  debugNode(json)
} catch (error) {
  console.error("❌ Error reading JSON:", error.message)
}
