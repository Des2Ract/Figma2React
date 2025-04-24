import { BaseComponent } from "./BaseComponent";
import { ComponentNode, LineNode } from "../../types/nodeTypes";
import { parseStrokeStyles } from "../../utils/styleParser";

export class Hr extends BaseComponent {
  constructor(data: ComponentNode) {
    super(data);
  }

  toReact(): string {
    return `<div style={${JSON.stringify(
      this.getInnerDivStyles()
    )}}><hr className="${this.className}" /></div>`;
  }

  getInnerDivStyles(): Record<string, string> {
    const commonStyles = this.getCommonStyles();
    commonStyles.position = "undefined";
    // Text-specific styles - now applied to the inner div
    const textStyles = {
      display: "flex",
      width: commonStyles.width,
      height: commonStyles.height,
    };

    return textStyles;
  }

  getStyles(): Record<string, string> {
    const commonStyles = this.getCommonStyles();

    const node = this.data.node as LineNode;

    // Parse border/stroke styles for the HR
    const strokeStyles = parseStrokeStyles(node.strokes || []);

    // HR-specific styles
    const hrStyles = {
      height: "0px",
      margin: "8px 0",
      boxSizing: "border-box",
      // Add default styles if no specific styles are provided
      ...(!Object.keys(strokeStyles).length
        ? { border: "none", borderTop: "1px solid #ccc" }
        : {}),
    };

    return {
      ...commonStyles,
      ...strokeStyles,
      ...hrStyles,
    };
  }
}
