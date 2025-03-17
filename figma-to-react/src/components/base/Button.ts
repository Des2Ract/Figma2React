import { BaseComponent } from "./BaseComponent";
import { ComponentNode, ShapeNode } from "../../types/nodeTypes";
import {
  parseBackgroundStyles,
  parseStrokeStyles,
} from "../../utils/styleParser";

export class Button extends BaseComponent {
  constructor(data: ComponentNode) {
    super(data);
  }

  toReact(childrenCode: string = ""): string {
    return `<button className="${this.className}" type="button">${childrenCode}</button>`;
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

    // Calculate margins based on x-center of node and parent
    const marginStyles = this.calculateXCenterMargin(node);

    // Additional button-specific styles
    const buttonStyles = {
      cursor: "pointer",
      outline: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0",
      border: "0",
      // Add default styles if no specific styles are provided
      ...(!Object.keys(borderStyles).length
        ? { border: "1px solid #ccc" }
        : {}),
      ...(!Object.keys(backgroundStyles).length
        ? { backgroundColor: "#f0f0f0" }
        : {}),
    };

    return {
      ...commonStyles,
      ...backgroundStyles,
      ...borderStyles,
      ...borderRadius,
      ...marginStyles,
      ...buttonStyles,
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

  private calculateXCenterMargin(node: ShapeNode): Record<string, string> {
    // Check if we have both node and parent dimensions
    if (!node || !this.data.node.parentWidth || !this.data.node.parentX) {
      return {};
    }

    // Calculate x-center positions
    const nodeXCenter = node.x + node.width / 2;
    const parentXCenter =
      this.data.node.parentX + this.data.node.parentWidth / 2;

    // Calculate the difference between centers
    const xDifference = nodeXCenter - parentXCenter;

    if (Math.abs(xDifference) < 1) {
      // If the centers are very close, center the button
      return {
        marginLeft: "auto",
        marginRight: "auto",
      };
    } else if (xDifference > 0) {
      // Node is to the right of parent center - add left margin
      return {
        marginLeft: `${xDifference}px`,
        marginRight: "0",
      };
    } else {
      // Node is to the left of parent center - add right margin
      return {
        marginLeft: "0",
        marginRight: `${Math.abs(xDifference)}px`,
      };
    }
  }
}
