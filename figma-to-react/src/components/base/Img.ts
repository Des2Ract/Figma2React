import { BaseComponent } from "./BaseComponent";
import { ComponentNode, ShapeNode } from "../../types/nodeTypes";
import {
  parseBackgroundStyles,
  parseStrokeStyles,
} from "../../utils/styleParser";

export class Image extends BaseComponent {
  constructor(data: ComponentNode) {
    super(data);
  }

  toReact(): string {
    // Get image source from node properties
    const src = this.getImageSource();

    // Get alt text (can be empty if not provided)
    const alt = this.getAltText();

    return `<img className="${this.className}" src="${src}" alt="${alt}" />`;
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

    // Image-specific styles
    const imageStyles = {
      objectFit: this.getObjectFit(),
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      maxWidth: "100%",
      opacity: this.getImageOpacity(),
      pointerEvents: "none",
    };

    return {
      ...commonStyles,
      ...backgroundStyles,
      ...borderStyles,
      ...borderRadius,
      ...imageStyles,
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

  private getImageSource(): string {
    const node = this.data.node as ShapeNode;

    // Check if node has fills and look for IMAGE type fills
    if (node.fills && node.fills.length > 0) {
      const imageFill = node.fills.find((fill) => fill.type === "IMAGE");

      if (imageFill && imageFill.imageRef) {
        // In a real implementation, you would likely need to convert this imageRef
        // to an actual URL or path that can be used in the src attribute
        return `${imageFill.imageRef}`;
      }
    }

    // Return a placeholder if no image found
    return "placeholder.jpg";
  }

  private getImageOpacity(): string {
    const node = this.data.node as ShapeNode;

    // Check if node has fills and look for IMAGE type fills
    if (node.fills && node.fills.length > 0) {
      const imageFill = node.fills.find((fill) => fill.type === "IMAGE");

      if (imageFill && imageFill.opacity) {
        // In a real implementation, you would likely need to convert this imageRef
        // to an actual URL or path that can be used in the src attribute
        return `${imageFill.opacity}`;
      }
    }
    return "1.0";
  }

  private getAltText(): string {
    // In a real implementation, you might extract alt text from node properties
    // or use node name as alt text

    // For now, return an empty string or node name if available
    return "";
  }

  private getObjectFit(): string {
    const node = this.data.node as ShapeNode;

    // Check if node has fills and look for IMAGE type fills
    if (node.fills && node.fills.length > 0) {
      const imageFill = node.fills.find((fill) => fill.type === "IMAGE");

      if (imageFill && imageFill.scaleMode) {
        // Map Figma scale modes to CSS object-fit values
        switch (imageFill.scaleMode) {
          case "FILL":
            return "cover";
          case "FIT":
            return "contain";
          case "TILE":
            return "repeat";
          case "STRETCH":
            return "fill";
          default:
            return "cover";
        }
      }
    }

    // Default to "cover" if no specific scale mode is defined
    return "cover";
  }
}
