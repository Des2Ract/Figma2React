import { Fill, Color } from "../types/nodeTypes";

export function parseBackgroundStyles(fills: Fill[]): Record<string, string> {
  if (!fills.length) return {};

  // Handle solid color backgrounds
  const solidFills = fills.filter(
    (fill) => fill.type === "SOLID" && fill.color
  );
  if (solidFills.length > 0) {
    const fill = solidFills[0];
    return {
      backgroundColor: colorToRGBA(fill.color!),
    };
  }

  // Handle image backgrounds
  const imageFills = fills.filter((fill) => fill.type === "IMAGE");
  if (imageFills.length > 0) {
    // In a real implementation, you'd need to handle image references
    return {
      backgroundImage: `url(${imageFills[0].imageRef})`,
    };
  }

  return {};
}

export function colorToRGBA(color: Color): string {
  const { r, g, b, a } = color;
  const rInt = Math.round(r * 255);
  const gInt = Math.round(g * 255);
  const bInt = Math.round(b * 255);

  return `rgba(${rInt}, ${gInt}, ${bInt}, ${a})`;
}

export function parseStrokeStyles(strokes: any[]): Record<string, string> {
  if (!strokes || !strokes.length) return {};

  const stroke = strokes[0];
  if (stroke.type === "SOLID" && stroke.color) {
    return {
      borderStyle: "solid",
      borderWidth: "1px",
      borderColor: colorToRGBA(stroke.color),
    };
  }

  return {};
}
