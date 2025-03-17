import { BaseComponent } from "./BaseComponent";
import { ComponentNode, ShapeNode } from "../../types/nodeTypes";
import { CSSGenerator } from "../../utils/cssGenerator";
import {
  parseBackgroundStyles,
  parseStrokeStyles,
} from "../../utils/styleParser";

export class Button extends BaseComponent {
  private wrapperStyles: Record<string, string> = {};
  private useWrapper: boolean = true;
  private wrapperClassName: string = "";
  private parentAlignmentThreshold: number = 10; // Threshold in pixels to determine "small margin"

  constructor(data: ComponentNode, cssGenerator: CSSGenerator) {
    super(data);
    // Initialize with default wrapper styles
    this.wrapperStyles = {
      display: "flex",
      overflow: "hidden",
    };
    this.wrapperClassName = this.className + "-wrapper";

    // Apply parent-relative alignment on initialization
    this.applyParentRelativeAlignment();

    // Register wrapper styles with CSS generator
    cssGenerator.styles.set(this.wrapperClassName, this.wrapperStyles);
  }

  // Enable wrapper and optionally set a custom wrapper class name
  enableWrapper(wrapperClassName?: string): Button {
    this.useWrapper = true;
    if (wrapperClassName) {
      this.wrapperClassName = wrapperClassName;
    }
    return this;
  }

  // Disable wrapper
  disableWrapper(): Button {
    this.useWrapper = false;
    return this;
  }

  // Set wrapper-specific styles
  setWrapperStyles(styles: Record<string, string>): Button {
    this.wrapperStyles = {
      ...this.wrapperStyles,
      ...styles,
    };
    return this;
  }

  // Get wrapper styles
  getWrapperStyles(): Record<string, string> {
    return { ...this.wrapperStyles };
  }

  // Set the threshold for determining when margins are "small" enough for center alignment
  setAlignmentThreshold(pixels: number): Button {
    this.parentAlignmentThreshold = pixels;
    return this;
  }

  // Apply parent-relative alignment
  applyParentRelativeAlignment(): Button {
    const node = this.data.node as ShapeNode;
    // Skip if there's no parent or no wrapper
    if (
      this.data.node.parentX == undefined ||
      this.data.node.parentWidth == undefined
    ) {
      return this;
    }

    // Calculate centers
    const nodeCenterX = node.x + node.width / 2;
    const parentCenterX =
      this.data.node.parentX + this.data.node.parentWidth / 2;

    // Calculate horizontal offset from parent center
    const centerOffset = Math.abs(nodeCenterX - parentCenterX);

    // If centers are close enough, apply center alignment
    if (centerOffset <= this.parentAlignmentThreshold) {
      this.wrapperStyles = {
        ...this.wrapperStyles,
        display: "flex",
        justifyContent: "center",
        width: "100%",
      };
    } else {
      // Determine if the node is more to the left, right, or needs specific positioning
      if (nodeCenterX < parentCenterX) {
        // Node is more to the left
        this.wrapperStyles = {
          ...this.wrapperStyles,
          display: "flex",
          justifyContent: "flex-start",
          width: "100%",
        };
      } else {
        // Node is more to the right
        this.wrapperStyles = {
          ...this.wrapperStyles,
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
        };
      }
    }

    return this;
  }

  toReact(childrenCode: string = ""): string {
    if (this.useWrapper) {
      // Create the inner button with original className
      const innerButton = `<button className="${this.className}" type="button">${childrenCode}</button>`;

      // Create the wrapper div containing the inner button
      return `<div className="${this.wrapperClassName}">${innerButton}</div>`;
    } else {
      // Return standard button without wrapper
      return `<button className="${this.className}" type="button">${childrenCode}</button>`;
    }
  }

  getStyles(): Record<string, string> {
    const commonStyles = this.getCommonStyles();

    // Remove positioning styles as they'll be handled by the wrapper
    if (this.useWrapper) {
      delete commonStyles.position;
      delete commonStyles.left;
      delete commonStyles.top;
    }

    const node = this.data.node as ShapeNode;

    // Parse background styles
    const backgroundStyles = parseBackgroundStyles(node.fills || []);

    // Parse border styles
    const borderStyles = parseStrokeStyles(node.strokes || []);

    // Get border width, style and color from strokes
    const enhancedBorderStyles = this.getEnhancedBorderStyles(
      node.strokes || []
    );

    // Parse border radius
    const borderRadius = this.getBorderRadius(node);

    // Additional button-specific styles
    const buttonStyles = {
      cursor: "pointer",
      outline: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0",
      // Only add default border if no border styles are provided
      ...(!Object.keys(enhancedBorderStyles).length &&
      !Object.keys(borderStyles).length
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
      ...enhancedBorderStyles,
      ...borderRadius,
      ...buttonStyles,
    };
  }

  // Generate CSS classes for both the main button and wrapper (if enabled)
  generateCSS(): Record<string, Record<string, string>> {
    const result: Record<string, Record<string, string>> = {};

    // Add main button styles
    result[`.${this.className}`] = this.getStyles();

    // Add wrapper styles if wrapper is enabled
    if (this.useWrapper) {
      result[`.${this.wrapperClassName}`] = this.getWrapperStyles();
    }

    return result;
  }

  private getEnhancedBorderStyles(strokes: any[]): Record<string, string> {
    if (!strokes || strokes.length === 0) {
      return {};
    }

    // Get the first stroke (assuming it's the primary one)
    const stroke = strokes[0];

    if (!stroke || stroke.type !== "SOLID") {
      return {};
    }

    // Get the color from the stroke
    const color = stroke.color;
    const borderColor = `rgba(${Math.round(color.r * 255)}, ${Math.round(
      color.g * 255
    )}, ${Math.round(color.b * 255)}, ${color.a})`;

    // Get the stroke weight if available, otherwise default to 1px
    const strokeWeight = stroke.strokeWeight || 1;

    // Return the enhanced border styles
    return {
      borderWidth: `${strokeWeight}px`,
      borderStyle: "solid",
      borderColor: borderColor,
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
}

// Helper function to create a button with wrapper, similar to createContentDiv
export function createWrappedButton(
  data: ComponentNode,
  cssGenerator: CSSGenerator,
  wrapperClassName?: string
): Button {
  const button = new Button(data, cssGenerator);

  // Enable wrapper with an optional specific class name
  button.enableWrapper(wrapperClassName || "button-wrapper");

  // Set some common wrapper styles
  button.setWrapperStyles({
    maxWidth: "100%",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
  });

  return button;
}
