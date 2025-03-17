import { ComponentNode } from "./types/nodeTypes";
import { generateReactComponent } from "./converters/reactConverter";
import { CSSGenerator } from "./utils/cssGenerator";

// Process the component tree to add parent information for responsive calculations
function processComponentTree(
  node: ComponentNode,
  parentWidth?: number,
  parentHeight?: number,
  parentX?: number,
  parentY?: number
): void {
  // Add parent dimensions for percentage calculations
  if (parentWidth) node.node.parentWidth = parentWidth;
  if (parentHeight) node.node.parentHeight = parentHeight;
  if (parentX != undefined) node.node.parentX = parentX;
  if (parentY != undefined) node.node.parentY = parentY;

  // Process children
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      processComponentTree(
        child,
        node.node.width,
        node.node.height,
        node.node.x,
        node.node.y
      );
    });
  }
}

export function convert(jsonData: ComponentNode): {
  reactCode: string;
  cssCode: string;
} {
  // Process the tree to add parentage information
  processComponentTree(jsonData);

  const cssGenerator = new CSSGenerator();

  // Add container styles
  cssGenerator.addComponent({
    getClassName: () => "figma-container",
    getStyles: () => ({
      position: "relative",
      width: `${jsonData.node.width}px`,
      height: "auto", // Allow height to adjust based on content
      minHeight: `${jsonData.node.height}px`,
      margin: "0 auto",
      overflow: "hidden",
      boxSizing: "border-box",
      maxWidth: "100%",
    }),
  });

  // Generate React code
  const reactCode = generateReactComponent(jsonData, cssGenerator);

  // Generate CSS code
  const cssCode = cssGenerator.generateCSS();

  return { reactCode, cssCode };
}
