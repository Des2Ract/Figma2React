import { BaseComponent } from "./BaseComponent";
import { ComponentNode, ShapeNode } from "../../types/nodeTypes";
import { CSSGenerator } from "../../utils/cssGenerator";

import {
  parseBackgroundStyles,
  parseStrokeStyles,
} from "../../utils/styleParser";

export class Navbar extends BaseComponent {
  private wrapperStyles: Record<string, string> = {};
  private useWrapper: boolean = true;
  private wrapperClassName: string = "";
  private parentAlignmentThreshold: number = 10; // Threshold in pixels to determine "small margin"
  private childrenGap: number = 0;
  private flexDirection: string = "row"; // Default flex direction for navbar is row
  private containerStart: number = 0;
  private containerEnd: number = 0;
  private linkColor: string = "#0066cc";
  private linkHoverColor: string = "#0066cc";
  private activeLink: string | null = null;
  private pTagStyles: Record<string, string> = {};

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
      alignItems: "center", // Align items vertically centered by default for navbar
      width: "100%",
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

    cssGenerator.styles.set(this.wrapperClassName, this.wrapperStyles);

    // Extract p tag styles if they exist
    this.extractPTagStyles(cssGenerator);

    // Only add basic styles to a tags that aren't from p tags
    cssGenerator.styles.set(`${this.className} a`, {
      textDecoration: "none",
      cursor: "pointer",
      transition: "color 0.3s ease",
      ...this.pTagStyles, // Apply the p tag styles to a tags
    });

    // Keep hover state
    cssGenerator.styles.set(`${this.className} a:hover`, {
      textDecoration: "underline",
      color: this.pTagStyles.color,
    });

    if (this.activeLink) {
      cssGenerator.styles.set(`${this.className} a.active`, {
        fontWeight: "bold",
        color: this.linkHoverColor,
      });
    }
  }

  extractPTagStyles(cssGenerator: CSSGenerator): Navbar {
    // Check if p tag styles exist in the cssGenerator
    const pTagSelector = `${this.className} p`;
    if (cssGenerator.styles.has(pTagSelector)) {
      this.pTagStyles = { ...cssGenerator.styles.get(pTagSelector) };

      // Remove the original p tag styles since we'll apply them to a tags
      cssGenerator.styles.delete(pTagSelector);
    }
    return this;
  }

  // Enable wrapper and optionally set a custom wrapper class name
  enableWrapper(wrapperClassName?: string): Navbar {
    this.useWrapper = true;
    if (wrapperClassName) {
      this.wrapperClassName = wrapperClassName;
    }
    return this;
  }

  // Disable wrapper
  disableWrapper(): Navbar {
    this.useWrapper = false;
    return this;
  }

  // Set wrapper-specific styles
  setWrapperStyles(styles: Record<string, string>): Navbar {
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
  setAlignmentThreshold(pixels: number): Navbar {
    this.parentAlignmentThreshold = pixels;
    return this;
  }

  // Set link colors
  setLinkColors(normalColor: string, hoverColor: string): Navbar {
    this.linkColor = normalColor;
    this.linkHoverColor = normalColor;
    return this;
  }

  // Set active link
  setActiveLink(linkText: string): Navbar {
    this.activeLink = linkText;
    return this;
  }

  // Apply parent-relative alignment
  applyParentRelativeAlignment(): Navbar {
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

  calculateChildrenGap(childNodes: ComponentNode[]): Navbar {
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

  // Set flex direction and recalculate gaps accordingly
  setFlexDirection(direction: "row" | "column"): Navbar {
    this.flexDirection = direction;
    this.wrapperStyles = {
      ...this.wrapperStyles,
      flexDirection: direction,
    };
    return this;
  }

  // Apply calculated gap to styles
  applyChildrenGap(): Navbar {
    if (this.childrenGap !== null && this.childrenGap > 0) {
      this.wrapperStyles = {
        ...this.wrapperStyles,
        gap: `${this.childrenGap}px`,
      };
    }
    return this;
  }
  convertParagraphsToLinks(childrenCode: string): string {
    // Track whether we're inside an interactive element
    let insideButton = false;
    let insideLink = false;
    let processedCode = "";
    let currentPos = 0;

    // Look for interactive elements first
    while (currentPos < childrenCode.length) {
      // Check for button start
      const buttonStart = childrenCode.indexOf("<button", currentPos);
      const buttonEnd = childrenCode.indexOf("</button>", currentPos);
      const linkStart = childrenCode.indexOf("<a", currentPos);
      const linkEnd = childrenCode.indexOf("</a>", currentPos);
      const pStart = childrenCode.indexOf("<p", currentPos);

      // If we found a button opening tag
      if (
        buttonStart !== -1 &&
        (pStart === -1 || buttonStart < pStart) &&
        (linkStart === -1 || buttonStart < linkStart)
      ) {
        // Add everything up to the button
        processedCode += childrenCode.substring(currentPos, buttonStart);

        // If we found a button closing tag, copy the whole button unchanged
        if (buttonEnd !== -1) {
          processedCode += childrenCode.substring(buttonStart, buttonEnd + 9);
          currentPos = buttonEnd + 9;
        } else {
          // Edge case: unclosed button tag
          processedCode += childrenCode.substring(buttonStart);
          break;
        }
      }
      // If we found a link opening tag
      else if (
        linkStart !== -1 &&
        (pStart === -1 || linkStart < pStart) &&
        (buttonStart === -1 || linkStart < buttonStart)
      ) {
        // Add everything up to the link
        processedCode += childrenCode.substring(currentPos, linkStart);

        // If we found a link closing tag, copy the whole link unchanged
        if (linkEnd !== -1) {
          processedCode += childrenCode.substring(linkStart, linkEnd + 4);
          currentPos = linkEnd + 4;
        } else {
          // Edge case: unclosed link tag
          processedCode += childrenCode.substring(linkStart);
          break;
        }
      }
      // If we found a paragraph tag
      else if (pStart !== -1) {
        // Add everything up to the paragraph
        processedCode += childrenCode.substring(currentPos, pStart);

        // Find the closing tag
        const pEnd = childrenCode.indexOf("</p>", pStart);
        if (pEnd !== -1) {
          // Extract paragraph details
          const pTag = childrenCode.substring(pStart, pEnd + 4);
          const pOpenTag = pTag.match(/<p\s+([^>]*)>/);
          if (pOpenTag) {
            const attributes = pOpenTag[1];
            const content = pTag.substring(pOpenTag[0].length, pTag.length - 4);

            // Create the link with all the original p tag attributes
            const href = `#${content.toLowerCase().replace(/\s+/g, "-")}`;
            const activeClass =
              this.activeLink && content.includes(this.activeLink)
                ? ' class="active"'
                : "";

            // If attributes already has a class, we need to handle it differently
            const hasClass = attributes.includes('class="');
            let finalAttributes = attributes;

            if (
              hasClass &&
              this.activeLink &&
              content.includes(this.activeLink)
            ) {
              // Extract existing class value and append 'active'
              const classMatch = attributes.match(/class="([^"]*)"/);
              if (classMatch) {
                const existingClasses = classMatch[1];
                finalAttributes = attributes.replace(
                  /class="([^"]*)"/,
                  `class="${existingClasses} active"`
                );
              }
            } else if (
              !hasClass &&
              this.activeLink &&
              content.includes(this.activeLink)
            ) {
              // Just use the activeClass
              finalAttributes = attributes + activeClass;
            }

            processedCode += `<a href="${href}" ${finalAttributes}>${content}</a>`;
          } else {
            // If we couldn't match the opening tag, keep it unchanged
            processedCode += pTag;
          }

          currentPos = pEnd + 4;
        } else {
          // Edge case: unclosed paragraph tag
          processedCode += childrenCode.substring(pStart);
          break;
        }
      } else {
        // No more tags, add the rest
        processedCode += childrenCode.substring(currentPos);
        break;
      }
    }

    return processedCode;
  }
  toReact(childrenCode: string = ""): string {
    // Convert p tags to a tags before rendering
    const modifiedChildrenCode = this.convertParagraphsToLinks(childrenCode);

    if (this.useWrapper) {
      // Create the inner div with original className
      const innerDiv = `<nav className="${this.className}">${modifiedChildrenCode}</nav>`;

      // Create the wrapper div containing the inner div
      return `<div className="${this.wrapperClassName}">${innerDiv}</div>`;
    } else {
      // Return standard nav without wrapper
      return `<nav className="${this.className}">${modifiedChildrenCode}</nav>`;
    }
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

    // Responsive styles
    const responsiveStyles = this.getResponsiveStyles(node);

    // Apply flex styles with gap if calculated
    var flexStyles: Record<string, string> = {};

    // Add gap if it exists and is greater than 0
    flexStyles.gap = `${this.childrenGap}px`;

    // Navbar specific styles
    const navbarStyles = {
      display: "flex",
      flexDirection: this.flexDirection,
      alignItems: "center",
      justifyContent: "space-around",
    };

    return {
      ...commonStyles,
      ...backgroundStyles,
      ...borderStyles,
      ...borderRadius,
      ...responsiveStyles,
      ...flexStyles,
      ...navbarStyles,
    };
  }

  // Generate CSS classes for both the main nav and wrapper (if enabled)
  generateCSS(): Record<string, Record<string, string>> {
    const result: Record<string, Record<string, string>> = {};

    // Add main nav styles
    result[`.${this.className}`] = this.getStyles();

    // Add wrapper styles if wrapper is enabled
    result[`.${this.wrapperClassName}`] = this.getWrapperStyles();

    // Add link styles (based on p tag styles)
    result[`.${this.className} a`] = {
      textDecoration: "none",
      cursor: "pointer",
      transition: "color 0.3s ease",
      ...this.pTagStyles, // Use the p tag styles for a tags
    };

    if (this.activeLink) {
      result[`.${this.className} a.active`] = {
        fontWeight: "bold",
        color: this.linkHoverColor,
        ...this.pTagStyles, // Use the p tag styles as base
      };
    }

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

    return styles;
  }
}

// Helper function to create a navbar with content wrapper, auto-calculated gap, and padding
export function createNavbar(
  data: ComponentNode,
  cssGenerator: CSSGenerator,
  direction: "row" | "column" = "row"
): Navbar {
  const navbar = new Navbar(data, cssGenerator);

  // Enable wrapper with a specific class
  navbar.enableWrapper("navbar-wrapper");

  // Set flex direction (default is row for navbar)
  navbar.setFlexDirection(direction);

  // Calculate and apply gap based on child nodes
  navbar.calculateChildrenGap(data.children).applyChildrenGap();

  // Set some common content wrapper styles
  navbar.setWrapperStyles({
    maxWidth: "100%",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    position: "sticky",
    top: "0",
    zIndex: "100",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  });

  return navbar;
}
