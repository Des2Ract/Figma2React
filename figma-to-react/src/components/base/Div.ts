import { BaseComponent } from "./BaseComponent";
import { ComponentNode, ShapeNode } from "../../types/nodeTypes";
import { CSSGenerator } from "../../utils/cssGenerator";

import {
  parseBackgroundStyles,
  parseStrokeStyles,
} from "../../utils/styleParser";

export class Div extends BaseComponent {
  private wrapperStyles: Record<string, string> = {};
  private useWrapper: boolean = true;
  private wrapperClassName: string = "";
  private parentAlignmentThreshold: number = 10; // Threshold in pixels to determine "small margin"
  private childrenGap: number = 0;
  private flexDirection: string = "column"; // Default flex direction
  private containerStart: number = 0;
  private containerEnd: number = 0;
  private padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  constructor(data: ComponentNode, cssGenerator: CSSGenerator) {
    super(data);
    // Initialize with default wrapper styles
    this.wrapperStyles = {
      display: "flex",
      overflow: "hidden",
      // justifyContent: "space-around",
    };
    this.wrapperClassName = this.className + "-wrapper";
    // Get the container bounds
    const isRow = this.flexDirection === "row";

    this.containerStart = isRow ? data.node.x : data.node.y;
    this.containerEnd = isRow
      ? data.node.x + data.node.width
      : data.node.y + data.node.height;
    // Check for parent alignment on initialization
    if (data.node.flexDirection) this.flexDirection = data.node.flexDirection;
    this.applyParentRelativeAlignment();

    this.calculateChildrenGap(data.children);
    // this.calculatePaddingPercentages(data.children); // Calculate percentage padding

    cssGenerator.styles.set(this.wrapperClassName, this.wrapperStyles);
  }

  // Enable wrapper and optionally set a custom wrapper class name
  enableWrapper(wrapperClassName?: string): Div {
    this.useWrapper = true;
    if (wrapperClassName) {
      this.wrapperClassName = wrapperClassName;
    }
    return this;
  }

  // Disable wrapper
  disableWrapper(): Div {
    this.useWrapper = false;
    return this;
  }

  // Set wrapper-specific styles
  setWrapperStyles(styles: Record<string, string>): Div {
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
  setAlignmentThreshold(pixels: number): Div {
    this.parentAlignmentThreshold = pixels;
    return this;
  }

  // Apply parent-relative alignment
  applyParentRelativeAlignment(): Div {
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

  calculateChildrenGap(childNodes: ComponentNode[]): Div {
    if (!childNodes || childNodes.length < 2) {
      this.childrenGap = 0;
      return this;
    }

    // Sort children by x position for row layout or y position for column layout
    const isRow = this.flexDirection === "row";
    const sortedChildren = [...childNodes].sort((a, b) => {
      return isRow ? a.node.x - b.node.x : a.node.y - b.node.y;
    });

    // Calculate gaps between adjacent elements AND container boundaries
    const gaps: number[] = [];

    // Calculate gaps between adjacent elements
    for (let i = 0; i < sortedChildren.length - 1; i++) {
      const current = sortedChildren[i];
      const next = sortedChildren[i + 1];

      if (isRow) {
        const currentEnd = current.node.x + current.node.width;
        const nextStart = next.node.x;
        gaps.push(nextStart - currentEnd);
      } else {
        const currentEnd = current.node.y + current.node.height;
        const nextStart = next.node.y;
        gaps.push(nextStart - currentEnd);
      }
    }

    // Calculate average gap
    if (gaps.length > 0) {
      // Filter negative gaps (overlapping elements) and calculate average
      const positiveGaps = gaps.filter((gap) => gap >= 0);
      if (positiveGaps.length > 0) {
        const sum = positiveGaps.reduce((acc, gap) => acc + gap, 0);
        this.childrenGap = Math.round(sum / positiveGaps.length) / 2.0;
      } else {
        this.childrenGap = 0;
      }
    } else {
      this.childrenGap = 0;
    }

    return this;
  }

  // Calculate padding as percentages of the container dimensions
  calculatePaddingPercentages(childNodes: ComponentNode[]): Div {
    if (!childNodes || childNodes.length === 0) {
      return this;
    }

    const node = this.data.node as ShapeNode;
    const containerWidth = node.width;
    const containerHeight = node.height;

    if (containerWidth <= 0 || containerHeight <= 0) {
      return this;
    }

    // Find the bounds of all children
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    childNodes.forEach((child) => {
      minX = Math.min(minX, child.node.x);
      maxX = Math.max(maxX, child.node.x + child.node.width);
      minY = Math.min(minY, child.node.y);
      maxY = Math.max(maxY, child.node.y + child.node.height);
    });

    // Calculate padding in pixels
    const paddingLeftPx = Math.max(0, minX - node.x);
    const paddingRightPx = Math.max(0, node.x + node.width - maxX);
    const paddingTopPx = Math.max(0, minY - node.y);
    const paddingBottomPx = Math.max(0, node.y + node.height - maxY);

    // Convert to percentages
    this.padding = {
      left: (paddingLeftPx / containerWidth) * 100,
      right: (paddingRightPx / containerWidth) * 100,
      top: (paddingTopPx / containerHeight) * 100,
      bottom: (paddingBottomPx / containerHeight) * 100,
    };

    return this;
  }

  // Set flex direction and recalculate gaps accordingly
  setFlexDirection(direction: "row" | "column"): Div {
    this.flexDirection = direction;
    this.wrapperStyles = {
      ...this.wrapperStyles,
      flexDirection: direction,
    };
    return this;
  }

  // Apply calculated gap to styles
  applyChildrenGap(): Div {
    if (this.childrenGap !== null && this.childrenGap > 0) {
      this.wrapperStyles = {
        ...this.wrapperStyles,
        gap: `${this.childrenGap}px`,
      };
    }
    return this;
  }

  toReact(childrenCode: string = ""): string {
    if (this.useWrapper) {
      // Create the inner div with original className
      const innerDiv = `<div className="${this.className}">${childrenCode}</div>`;

      // Create the wrapper div containing the inner div
      return `<div className="${this.wrapperClassName}">${innerDiv}</div>`;
    } else {
      // Return standard div without wrapper
      return `<div className="${this.className}">${childrenCode}</div>`;
    }
  }

  getStyles(): Record<string, string> {
    const commonStyles = this.getCommonStyles();
    commonStyles.justifyContent = "space-around";
    const node = this.data.node as ShapeNode;

    // Parse background styles
    const backgroundStyles = parseBackgroundStyles(node.fills || []);

    // Parse border styles
    const borderStyles = parseStrokeStyles(node.strokes || []);

    // Parse border radius
    const borderRadius = this.getBorderRadius(node);

    // Responsive styles
    const responsiveStyles = this.getResponsiveStyles(node);

    // Apply flex styles with gap if calculated
    var flexStyles: Record<string, string> = {};

    // Add gap if it exists and is greater than 0
    flexStyles.gap = `${this.childrenGap}px`;

    const isRow = this.flexDirection === "row";

    // flexStyles = {
    //   ...flexStyles,
    //   paddingTop: `${this.padding.top}%`,
    //   paddingRight: `${this.padding.right}%`,
    //   paddingBottom: `${this.padding.bottom}%`,
    //   paddingLeft: `${this.padding.left}%`,
    // };

    return {
      ...commonStyles,
      ...backgroundStyles,
      ...borderStyles,
      ...borderRadius,
      ...responsiveStyles,
      ...flexStyles,
    };
  }

  // Generate CSS classes for both the main div and wrapper (if enabled)
  generateCSS(): Record<string, Record<string, string>> {
    const result: Record<string, Record<string, string>> = {};

    // Add main div styles
    result[`.${this.className}`] = this.getStyles();

    // Add wrapper styles if wrapper is enabled
    result[`.${this.wrapperClassName}`] = this.getWrapperStyles();

    return result;
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

// Helper function to create a div with content wrapper, auto-calculated gap, and padding
export function createContentDiv(
  data: ComponentNode,
  cssGenerator: CSSGenerator,
  direction: "row" | "column" = "row"
): Div {
  const div = new Div(data, cssGenerator);

  // Enable wrapper with a specific class
  div.enableWrapper("content-wrapper");

  // Set flex direction
  div.setFlexDirection(direction);

  // Calculate and apply gap based on child nodes
  div.calculateChildrenGap(data.children).applyChildrenGap();

  // Calculate and apply padding based on child nodes

  // Set some common content wrapper styles
  div.setWrapperStyles({
    maxWidth: "100%",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
  });

  return div;
}
