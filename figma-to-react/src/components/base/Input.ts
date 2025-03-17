import { BaseComponent } from "./BaseComponent";
import { ComponentNode, ShapeNode } from "../../types/nodeTypes";
import {
  parseBackgroundStyles,
  parseStrokeStyles,
} from "../../utils/styleParser";

export class Input extends BaseComponent {
  constructor(data: ComponentNode) {
    super(data);
  }

  toReact(): string {
    // Determine input type based on node properties or custom properties
    const inputType = this.determineInputType();

    // Extract potential placeholder text from node properties
    const placeholder = this.getPlaceholder();

    return `<input className="${this.className}" type="${inputType}" placeholder="${placeholder}" />`;
  }

  getStyles(): Record<string, string> {
    const commonStyles = this.getCommonStyles();
    const node = this.data.node as ShapeNode;

    // Parse background styles
    const backgroundStyles = parseBackgroundStyles(node.fills || []);

    // Parse border styles
    const borderStyles = parseStrokeStyles(node.strokes || []);

    // Parse border radius
    const borderRadius = this.getBorderRadius(node);

    // Input-specific styles
    const inputStyles = {
      // padding: "8px 12px",
      boxSizing: "border-box",
      outline: "none",
      fontSize: "14px",
      fontFamily: "inherit",
      // Add default styles if no specific styles are provided
      ...(!Object.keys(borderStyles).length
        ? { border: "1px solid #ccc" }
        : {}),
      ...(!Object.keys(backgroundStyles).length
        ? { backgroundColor: "#ffffff" }
        : {}),
    };

    return {
      ...commonStyles,
      ...backgroundStyles,
      ...borderStyles,
      ...borderRadius,
      ...inputStyles,
    };
  }

  private getBorderRadius(node: ShapeNode): Record<string, string> {
    if (
      !node.topLeftRadius &&
      !node.topRightRadius &&
      !node.bottomLeftRadius &&
      !node.bottomRightRadius
    ) {
      return {};
    }

    return {
      borderTopLeftRadius: `${node.topLeftRadius || 0}px`,
      borderTopRightRadius: `${node.topRightRadius || 0}px`,
      borderBottomLeftRadius: `${node.bottomLeftRadius || 0}px`,
      borderBottomRightRadius: `${node.bottomRightRadius || 0}px`,
    };
  }

  private determineInputType(): string {
    // In a real implementation, this would use node properties or naming conventions
    // to determine the input type (text, email, password, etc.)

    // For now, we'll just return 'text' as the default
    return "text";
  }

  private getPlaceholder(): string {
    // Check if the input node has children
    if (this.data.children && this.data.children.length > 0) {
      // Look for paragraph nodes in the children
      const paragraphNodes = this.data.children.filter(
        (child) => child.node && child.node.type === "TEXT"
      );

      if (paragraphNodes.length > 0) {
        // Extract text content from the first paragraph node
        // This assumes the paragraph node has a 'text' or 'characters' property
        const firstParagraph = paragraphNodes[0];

        if (firstParagraph.node.characters) {
          return firstParagraph.node.characters;
        }
      }
    }

    // Return empty string if no paragraph nodes found or no text content
    return "";
  }
}
