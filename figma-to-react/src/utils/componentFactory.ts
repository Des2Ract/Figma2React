import { ComponentNode } from "../types/nodeTypes";
import { Div } from "../components/base/Div";
import { P } from "../components/base/P";
import { Button } from "../components/base/Button";
import { Input } from "../components/base/Input";
import { Body } from "../components/base/Body";
import { CSSGenerator } from "./cssGenerator";

export function createComponent(
  data: ComponentNode,
  cssGenerator: CSSGenerator
): any {
  switch (data.tag.toUpperCase()) {
    case "DIV":
      return new Div(data, cssGenerator);
    case "P":
      return new P(data);
    case "BUTTON":
      return new Button(data);
    case "INPUT":
      return new Input(data);
    // Add other component types as needed
    default:
      console.warn(`Unknown component tag: ${data.tag}. Falling back to Div.`);
      return new Div(data, cssGenerator);
  }
}

export function parseComponentTree(
  data: ComponentNode,
  cssGenerator: CSSGenerator
): string {
  // Ensure only the root is a body tag
  const componentData = data;
  const component = createComponent(componentData, cssGenerator);
  cssGenerator.addComponent(component);

  let childrenCode = "";
  if (data.children && data.children.length > 0) {
    data.children.forEach((child) => {
      childrenCode += parseComponentTree(child, cssGenerator);
    });
  }

  return component.toReact(childrenCode);
}
