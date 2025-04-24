import { ComponentNode } from "../types/nodeTypes";
import { parseComponentTree } from "../utils/componentFactory";
import { CSSGenerator } from "../utils/cssGenerator";

export function generateReactComponent(
  rootNode: ComponentNode,
  cssGenerator: CSSGenerator
): string {
  // Import React at the top
  let reactCode = `import React from 'react';\n`;
  reactCode += `import './styles.css';\n\n`;

  // Create the main component
  reactCode += `const FigmaComponent = () => {\n`;

  // Add viewport meta tag for better mobile responsiveness
  reactCode += `  React.useEffect(() => {\n`;
  reactCode += `    // Ensure proper responsive behavior\n`;
  reactCode += `    const viewport = document.querySelector("meta[name=viewport]");\n`;
  reactCode += `    if (!viewport) {\n`;
  reactCode += `      const meta = document.createElement("meta");\n`;
  reactCode += `      meta.name = "viewport";\n`;
  reactCode += `      meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0";\n`;
  reactCode += `      document.head.appendChild(meta);\n`;
  reactCode += `    }\n`;
  reactCode += `  }, []);\n\n`;

  reactCode += `  return (\n`;
  reactCode += `    <body className="figma-container">\n`;

  // Generate component tree
  const componentCode = parseComponentTree(rootNode, cssGenerator);
  reactCode += `      ${componentCode}\n`;

  // Close tags
  reactCode += `    </body>\n`;
  reactCode += `  );\n`;
  reactCode += `};\n\n`;

  // Export
  reactCode += `export default FigmaComponent;\n`;

  return reactCode;
}
