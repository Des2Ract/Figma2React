import { BaseComponent } from "./BaseComponent";
import { ComponentNode, ShapeNode } from "../../types/nodeTypes";
import {
  parseBackgroundStyles,
  parseStrokeStyles,
} from "../../utils/styleParser";

export class Body extends BaseComponent {
  constructor(data: ComponentNode) {
    super(data);
  }

  toReact(childrenCode: string = ""): string {
    return `<body className="${this.className}">${childrenCode}</body>`;
  }

  getStyles(): Record<string, string> {
    const commonStyles = this.getCommonStyles();
    commonStyles.display = "block";
    commonStyles.width = "undefined";
    commonStyles.height = "undefined";

    const node = this.data.node as ShapeNode;

    // Parse background styles
    const backgroundStyles = parseBackgroundStyles(node.fills || []);

    // Parse border styles
    const borderStyles = parseStrokeStyles(node.strokes || []);

    // Parse border radius
    const borderRadius = this.getBorderRadius(node);

    // Responsive styles
    const responsiveStyles = this.getResponsiveStyles(node);

    return {
      ...commonStyles,
      ...backgroundStyles,
      ...borderStyles,
      ...borderRadius,
      ...responsiveStyles,
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

    // Use percentage-based radius for better responsiveness when possible
    const maxDimension = Math.max(node.width, node.height);

    return {
      borderTopLeftRadius: node.topLeftRadius ? `${node.topLeftRadius}px` : "0",
      borderTopRightRadius: node.topRightRadius
        ? `${node.topRightRadius}px`
        : "0",
      borderBottomLeftRadius: node.bottomLeftRadius
        ? `${node.bottomLeftRadius}px`
        : "0",
      borderBottomRightRadius: node.bottomRightRadius
        ? `${node.bottomRightRadius}px`
        : "0",
    };
  }

  private getResponsiveStyles(node: ShapeNode): Record<string, string> {
    const styles: Record<string, string> = {};

    // Add responsive properties
    styles.boxSizing = "border-box";

    // Add media queries for responsiveness (these will be extracted later)
    // The actual media queries will be handled by the CSS generator

    return styles;
  }
}
