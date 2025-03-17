import { BaseComponent } from "./BaseComponent";
import { ComponentNode, TextNode } from "../../types/nodeTypes";

export class P extends BaseComponent {
  constructor(data: ComponentNode) {
    super(data);
  }

  toReact(): string {
    const textNode = this.data.node as TextNode;
    return `<p className="${this.className}">${textNode.characters}</p>`;
  }

  getStyles(): Record<string, string> {
    const commonStyles = this.getCommonStyles();
    commonStyles.width = "undefined";
    commonStyles.height = "undefined";

    const node = this.data.node as TextNode;

    // Text-specific styles
    const textStyles = {
      fontSize: `${node.fontSize}px`,
      fontFamily: `'${node.fontName.family}', ${this.getFontFallback(
        node.fontName.family
      )}`,
      fontWeight: this.getFontWeight(node.fontName.style),
      fontStyle: this.getFontStyle(node.fontName.style),
      textAlign: this.getPositionBasedTextAlign(node),
      margin: "0",
      padding: "0",
      lineHeight: "1.5",
      color: "#000000", // Default color if not specified
      whiteSpace: "pre-wrap",
    };

    return {
      ...commonStyles,
      ...textStyles,
    };
  }

  private getPositionBasedTextAlign(node: TextNode): string {
    // Check if node has a parent
    if (!node.parentX || !node.parentWidth) {
      return this.getTextAlign(node.textAlignHorizontal || "LEFT");
    }

    // Calculate the x-center positions
    const nodeXCenter = node.x + node.width / 2;
    const parentXCenter = node.parentX + node.parentWidth / 2;

    // Calculate the difference
    const difference = nodeXCenter - parentXCenter;
    const tolerance = 10; // Pixel tolerance for considering nodes centered

    // Determine alignment based on position
    if (Math.abs(difference) <= tolerance) {
      return "center";
    } else if (difference < 0) {
      return "left";
    } else {
      return "right";
    }
  }

  private getFontFallback(fontFamily: string): string {
    // Map common font families to appropriate fallbacks
    const fallbacks: Record<string, string> = {
      Arial: "sans-serif",
      Helvetica: "sans-serif",
      "Times New Roman": "serif",
      Times: "serif",
      "Courier New": "monospace",
      Courier: "monospace",
      Verdana: "sans-serif",
      Georgia: "serif",
      Palatino: "serif",
      Garamond: "serif",
      Bookman: "serif",
      "Comic Sans MS": "cursive",
      "Trebuchet MS": "sans-serif",
      Impact: "sans-serif",
      Roboto: "sans-serif",
      "Open Sans": "sans-serif",
      Lato: "sans-serif",
      "Kode Mono": "monospace",
      "Permanent Marker": "cursive",
    };

    return fallbacks[fontFamily] || "sans-serif";
  }

  private getFontWeight(fontStyle: string): string {
    // Map font styles to font weights
    if (fontStyle.includes("Bold")) return "bold";
    if (fontStyle.includes("Light")) return "300";
    if (fontStyle.includes("SemiBold")) return "600";
    if (fontStyle.includes("Medium")) return "500";
    if (fontStyle.includes("Black")) return "900";
    if (fontStyle.includes("Thin")) return "100";

    return "normal"; // Default to normal weight
  }

  private getFontStyle(fontStyle: string): string {
    // Check if font style indicates italic
    if (fontStyle.includes("Italic")) return "italic";

    return "normal";
  }

  private getTextAlign(textAlignHorizontal: string): string {
    // Map Figma's text alignment to CSS text-align
    switch (textAlignHorizontal.toUpperCase()) {
      case "LEFT":
        return "left";
      case "CENTER":
        return "center";
      case "RIGHT":
        return "right";
      case "JUSTIFIED":
        return "justify";
      default:
        return "left";
    }
  }
}
