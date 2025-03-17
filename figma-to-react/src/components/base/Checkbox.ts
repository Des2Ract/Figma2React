import { BaseComponent } from "./BaseComponent";
import { ComponentNode, ShapeNode } from "../../types/nodeTypes";
import {
  parseBackgroundStyles,
  parseStrokeStyles,
} from "../../utils/styleParser";

export class Checkbox extends BaseComponent {
  constructor(data: ComponentNode) {
    super(data);
  }

  toReact(): string {
    // Extract potential label text from node properties
    const label = this.getLabel();

    // Determine if checkbox should be checked by default
    const isChecked = this.isCheckedByDefault();

    // Generate checkbox with optional label
    if (label) {
      return `
        <div className="${this.className}-container">
          <input 
            type="checkbox" 
            id="${this.id}" 
            className="${this.className}" 
            ${isChecked ? "defaultChecked" : ""} 
          />
          <label htmlFor="${this.id}">${label}</label>
        </div>
      `;
    }

    return `<input type="checkbox" className="${this.className}" ${
      isChecked ? "defaultChecked" : ""
    } />`;
  }

  getStyles(): Record<string, string> {
    const commonStyles = this.getCommonStyles();
    const node = this.data.node as ShapeNode;

    // Parse background styles
    const backgroundStyles = parseBackgroundStyles(node.fills || []);

    // Parse border styles
    const borderStyles = parseStrokeStyles(node.strokes || []);

    // Checkbox-specific styles - keep minimal as most styling should be done via CSS
    const checkboxStyles = {
      cursor: "pointer",
      // We avoid setting dimensions explicitly as checkboxes are typically styled with CSS
    };

    // Container styles for when we have a label
    const containerStyles = {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    };

    return {
      checkbox: {
        ...commonStyles,
        ...backgroundStyles,
        ...borderStyles,
        ...checkboxStyles,
      },
      container: {
        ...containerStyles,
      },
    };
  }

  private isCheckedByDefault(): boolean {
    // In a real implementation, this would check node properties or naming conventions
    // to determine if the checkbox should be checked by default

    // For example, check if the node name contains "checked" or if there's a custom property
    const nodeName = this.data.name?.toLowerCase() || "";
    return nodeName.includes("checked") || nodeName.includes("selected");
  }

  private getLabel(): string {
    // In a real implementation, this would extract label text from node properties
    // or check for text children that serve as labels

    // This could look for text nodes that are siblings or children of the checkbox node
    // For now, we'll just return an empty string
    return "";
  }

  private getId(): string {
    // Generate a unique ID for the checkbox to associate with its label
    return `checkbox-${
      this.data.id || Math.random().toString(36).substr(2, 9)
    }`;
  }

  get id(): string {
    return this.getId();
  }
}
