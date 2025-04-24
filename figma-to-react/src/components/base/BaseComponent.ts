import { ComponentNode } from "../../types/nodeTypes";

export abstract class BaseComponent {
  protected data: ComponentNode;
  public className: string;
  protected static classCounter: number = 0;

  constructor(data: ComponentNode) {
    this.data = data;
    // Generate a unique className based on tag and counter
    this.className = `${data.tag.toLowerCase()}_${BaseComponent.classCounter++}`;
  }

  abstract toReact(childrenCode?: string): string;

  // Define CSS properties that will be exported to CSS file
  abstract getStyles(): Record<string, string>;

  getClassName(): string {
    return this.className;
  }

  protected getCommonStyles(): Record<string, string> {
    const { node } = this.data;
    const styles: Record<string, string> = {};

    // Check if this is a flex container
    if ("flexDirection" in node) {
      // For flex containers, use flex layout
      const flexDirection = (node["flexDirection"] || "row").toLowerCase();

      styles.display = "flex";
      styles.flexDirection = flexDirection;
      styles.width = `${node.width}px`;
      styles.height = `${node.height}px`;

      // Add responsive properties
      styles.maxWidth = "100%";
    } else {
      // For non-flex elements, use absolute positioning by default
      styles.position = "absolute";
      styles.left = `${node.x}px`;
      styles.top = `${node.y}px`;
      styles.width = `${node.width}px`;
      styles.height = `${node.height}px`;

      // Add responsive properties
      styles.maxWidth = "100%";
    }

    return styles;
  }

  // Helper to get percentage values for more responsive layouts
  protected getPercentageValue(value: number, containerSize: number): string {
    if (containerSize === 0) return "0";
    return `${((value / containerSize) * 100).toFixed(2)}%`;
  }

  // Get responsive dimensions
  protected getResponsiveDimensions(): Record<string, string> {
    const { node } = this.data;

    // If we have a parent, we can calculate percentage-based dimensions
    const parentWidth = node.parentWidth || node.width;
    const parentHeight = node.parentHeight || node.height;

    return {
      width: this.getPercentageValue(node.width, parentWidth),
      maxWidth: "100%",
      height: "auto", // Allow height to adjust based on content
      minHeight: `${node.height}px`, // Ensure minimum height
    };
  }
}
