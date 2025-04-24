export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Fill {
  blendMode: string;
  type: string;
  color?: Color;
  opacity?: number;
  scaleMode?: string;
  imageRef?: string;
}

export interface Stroke {
  blendMode: string;
  type: string;
  color: Color;
}

export interface FontName {
  family: string;
  style: string;
}

export interface NodeBase {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  flexDirection?: string;
  parentWidth?: number;
  parentHeight?: number;
  parentX?: number;
  parentY?: number;
  characters?: string;
}

export interface ShapeNode extends NodeBase {
  fills?: Fill[];
  strokes?: Stroke[];
  topLeftRadius?: number;
  topRightRadius?: number;
  bottomLeftRadius?: number;
  bottomRightRadius?: number;
  flexDirection?: string;
}

export interface TextNode extends NodeBase {
  characters: string;
  fontSize: number;
  fontName: FontName;
  textAlignHorizontal: string;
  fills?: Fill[];
}

export interface LineNode extends NodeBase {
  // Line-specific properties
  fills?: Fill[];
  strokes?: Stroke[];
}

export type Node = ShapeNode | TextNode | LineNode;

export interface ComponentNode {
  tag: string;
  node: Node;
  children: ComponentNode[];
}
