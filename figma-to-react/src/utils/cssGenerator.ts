export interface StyleProvider {
  getClassName(): string;
  getStyles(): Record<string, string>;
}

export class CSSGenerator {
  public styles: Map<string, Record<string, string>> = new Map();
  private mediaQueries: Map<string, Map<string, Record<string, string>>> =
    new Map();

  constructor() {
    // Initialize common media query breakpoints
    this.mediaQueries.set("tablet", new Map()); // max-width: 768px
    this.mediaQueries.set("mobile", new Map()); // max-width: 480px
  }

  addComponent(component: StyleProvider): void {
    this.styles.set(component.getClassName(), component.getStyles());

    // Add responsive styles for different breakpoints
    // This would be enhanced by actual Figma data if it contains responsive variants
    this.addResponsiveStyles(component);
  }

  private addResponsiveStyles(component: StyleProvider): void {
    const className = component.getClassName();
    const styles = component.getStyles();

    // Create tablet styles (simplified example)
    const tabletStyles = { ...styles };

    // Modify certain properties for tablet
    if ("width" in tabletStyles && !tabletStyles.width.includes("%")) {
      tabletStyles.width = "100%";
    }

    // Create mobile styles
    const mobileStyles = { ...tabletStyles };

    // Add specific mobile adjustments
    if ("fontSize" in mobileStyles) {
      // Reduce font size for mobile
      const currentSize = parseInt(mobileStyles.fontSize);
      if (!isNaN(currentSize)) {
        mobileStyles.fontSize = `${Math.max(12, currentSize * 0.9)}px`;
      }
    }

    // Store responsive styles in media queries
    this.mediaQueries.get("tablet")?.set(className, tabletStyles);
    this.mediaQueries.get("mobile")?.set(className, mobileStyles);
  }

  generateCSS(): string {
    let cssContent = "";

    // Generate base styles
    this.styles.forEach((styles, className) => {
      cssContent += `.${className} {\n`;

      Object.entries(styles).forEach(([property, value]) => {
        // Convert camelCase to kebab-case for CSS properties
        const cssProperty = property.replace(/([A-Z])/g, "-$1").toLowerCase();
        cssContent += `  ${cssProperty}: ${value};\n`;
      });

      cssContent += "}\n\n";
    });

    // Generate media queries
    this.mediaQueries.forEach((classStyles, breakpoint) => {
      if (classStyles.size === 0) return;

      const maxWidth = breakpoint === "tablet" ? "768px" : "480px";
      cssContent += `@media (max-width: ${maxWidth}) {\n`;

      classStyles.forEach((styles, className) => {
        cssContent += `  .${className} {\n`;

        Object.entries(styles).forEach(([property, value]) => {
          // Only include properties that change in responsive design
          if (this.styles.get(className)?.[property] !== value) {
            const cssProperty = property
              .replace(/([A-Z])/g, "-$1")
              .toLowerCase();
            cssContent += `    ${cssProperty}: ${value};\n`;
          }
        });

        cssContent += `  }\n`;
      });

      cssContent += "}\n\n";
    });

    // Add container styles for better responsiveness
    cssContent += `
  /* Container styles for better responsiveness */
  .figma-container {
    max-width: 100%;
    overflow-x: hidden;
    margin: 0 auto;
  }
  
  /* Responsive utility classes */
  .hide-on-mobile {
    display: block;
  }
  
  @media (max-width: 480px) {
    .hide-on-mobile {
      display: none !important;
    }
  }
  `;

    return cssContent;
  }
}
