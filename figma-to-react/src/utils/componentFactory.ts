import { ComponentNode } from "../types/nodeTypes";
import { Div } from "../components/base/Div";
import { P } from "../components/base/P";
import { Button } from "../components/base/Button";
import { Input } from "../components/base/Input";
import { Body } from "../components/base/Body";
import { CSSGenerator } from "./cssGenerator";
import { Checkbox } from "../components/base/Checkbox"; // Added import
import { Navbar } from "../components/base/Navbar";
import { Hr } from "../components/base/Hr";
import { Image } from "../components/base/Img";

export function createComponent(
  data: ComponentNode,
  cssGenerator: CSSGenerator,
  dataLabel?: ComponentNode
): any {
  switch (data.tag.toUpperCase()) {
    case "DIV":
      return new Div(data, cssGenerator);
    case "P":
      return new P(data);
    case "BUTTON":
      return new Button(data, cssGenerator);
    case "INPUT":
      return new Input(data);
    case "CHECKBOX":
      return new Checkbox(data, dataLabel);
    case "NAVBAR":
      return new Navbar(data, cssGenerator);
    case "HR":
      return new Hr(data);
    case "IMG":
      return new Image(data);
    // Add other component types as needed
    default:
      console.warn(`Unknown component tag: ${data.tag}. Falling back to Div.`);
      return new Div(data, cssGenerator);
  }
}

export function parseComponentTree(
  data: ComponentNode,
  cssGenerator: CSSGenerator,
  dataLabel?: ComponentNode
): string {
  // Ensure only the root is a body tag
  const componentData = data;
  const component = createComponent(componentData, cssGenerator, dataLabel);
  cssGenerator.addComponent(component);

  let childrenCode = "";
  if (data.children && data.children.length > 0) {
    for (let index = 0; index < data.children.length; index++) {
      const child = data.children[index];
      if (child.tag && child.tag.toUpperCase() === "CHECKBOX") {
        if (index + 1 < data.children.length) {
          childrenCode += parseComponentTree(
            child,
            cssGenerator,
            data.children[index + 1]
          );
          index++; // Skip the next element
        } else {
          childrenCode += parseComponentTree(child, cssGenerator);
        }
      } else {
        childrenCode += parseComponentTree(child, cssGenerator);
      }
    }
  }

  return component.toReact(childrenCode);
}
