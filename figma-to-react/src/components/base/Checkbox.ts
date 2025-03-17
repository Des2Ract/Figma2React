import { BaseComponent } from "./BaseComponent";
import { ComponentNode, ShapeNode } from "../../types/nodeTypes";
import {
  parseBackgroundStyles,
  parseStrokeStyles,
} from "../../utils/styleParser";

export class Checkbox extends BaseComponent {
  private dataLabel: ComponentNode | undefined;

  constructor(data: ComponentNode, dataLabel: ComponentNode | undefined) {
    super(data);
    this.dataLabel = dataLabel;
  }

  toReact(): string {
    // Extract label text from dataLabel if available
    const label = this.getLabel();

    // Generate checkbox with optional label
    if (label) {
      return `
          <input 
            type="checkbox" 
            id="${this.id}" 
          />
        <label 
          style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          ${label}
        </label>
      `;
    }

    return `<input type="checkbox" className="${this.className}"  />`;
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

    return {};
  }

  private getLabel(): string | undefined {
    // Check if dataLabel exists and extract text from it
    if (this.dataLabel && this.dataLabel.node) {
      // Assuming a text property exists on the node or its children
      // This implementation may need adjustment based on your actual node structure
      return this.dataLabel.node.characters;
    }

    // Return empty string if no label found
    return "";
  }

  private getId(): string {
    // Generate a unique ID for the checkbox to associate with its label
    return `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  }

  get id(): string {
    return this.getId();
  }
}
