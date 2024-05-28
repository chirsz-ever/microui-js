// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
interface WasmModule {
  _malloc(_0: number): number;
}

export interface Context {
  commands(): Command[];
  get_current_container(): Container;
  begin(): void;
  end(): void;
  pop_id(): void;
  pop_clip_rect(): void;
  bring_to_front(_0: Container): void;
  layout_begin_column(): void;
  layout_end_column(): void;
  end_treenode(): void;
  end_window(): void;
  end_popup(): void;
  end_panel(): void;
  input_mousemove(_0: number, _1: number): void;
  input_mousedown(_0: number, _1: number, _2: number): void;
  input_mouseup(_0: number, _1: number, _2: number): void;
  input_scroll(_0: number, _1: number): void;
  input_keydown(_0: number): void;
  input_keyup(_0: number): void;
  push_command(_0: number, _1: number): Command;
  layout_row(_0: number[], _1: number): void;
  layout_width(_0: number): void;
  layout_height(_0: number): void;
  push_clip_rect(_0: Rect): void;
  get_clip_rect(): Rect;
  check_clip(_0: Rect): number;
  set_clip(_0: Rect): void;
  draw_rect(_0: Rect, _1: Color): void;
  draw_box(_0: Rect, _1: Color): void;
  draw_icon(_0: number, _1: Rect, _2: Color): void;
  layout_set_next(_0: Rect, _1: number): void;
  layout_next(): Rect;
  mouse_over(_0: Rect): number;
  set_focus(_0: number): void;
  draw_control_frame(_0: number, _1: Rect, _2: number, _3: number): void;
  update_control(_0: number, _1: Rect, _2: number): void;
  push_id_ptr(_0: number): void;
  set_text_width_callback(_0: number): void;
  set_text_height_callback(_0: number): void;
  style_colors_addr(): number;
  slider(_0: number, _1: number, _2: number): number;
  get_container(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): Container;
  draw_control_text(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string, _1: Rect, _2: number, _3: number): void;
  text(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  label(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  button_ex(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string, _1: number, _2: number): number;
  checkbox(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string, _1: number): number;
  slider_ex(_0: number, _1: number, _2: number, _3: number, _4: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string, _5: number): number;
  header_ex(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string, _1: number): number;
  begin_treenode_ex(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string, _1: number): number;
  begin_window_ex(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string, _1: Rect, _2: number): number;
  open_popup(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  begin_popup(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): number;
  begin_panel_ex(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string, _1: number): void;
  button(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): number;
  header(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): number;
  begin_treenode(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): number;
  begin_window(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string, _1: Rect): number;
  begin_panel(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  delete(): void;
}

export interface Command {
  text: TextCommand;
  clip: ClipCommand;
  rect: RectCommand;
  icon: IconCommand;
  type: number;
  readonly text_str: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string;
  delete(): void;
}

export interface TextCommand {
  color: Color;
  pos: Vec2;
  delete(): void;
}

export interface ClipCommand {
  rect: Rect;
  delete(): void;
}

export interface RectCommand {
  color: Color;
  rect: Rect;
  delete(): void;
}

export interface IconCommand {
  color: Color;
  rect: Rect;
  id: number;
  delete(): void;
}

export interface Container {
  scroll: Vec2;
  content_size: Vec2;
  rect: Rect;
  body: Rect;
  delete(): void;
}

export type Color = {
  r: number,
  g: number,
  b: number,
  a: number
};

export type Vec2 = {
  x: number,
  y: number
};

export type Rect = {
  x: number,
  y: number,
  w: number,
  h: number
};

interface EmbindModule {
  Context: {new(): Context};
  Command: {};
  TextCommand: {};
  ClipCommand: {};
  RectCommand: {};
  IconCommand: {};
  Container: {};
  CLIP_PART: number;
  CLIP_ALL: number;
  COMMAND_CLIP: number;
  COMMAND_RECT: number;
  COMMAND_TEXT: number;
  COMMAND_ICON: number;
  COLOR_TEXT: number;
  COLOR_BORDER: number;
  COLOR_WINDOWBG: number;
  COLOR_TITLEBG: number;
  COLOR_TITLETEXT: number;
  COLOR_PANELBG: number;
  COLOR_BUTTON: number;
  COLOR_BUTTONHOVER: number;
  COLOR_BUTTONFOCUS: number;
  COLOR_BASE: number;
  COLOR_BASEHOVER: number;
  COLOR_BASEFOCUS: number;
  COLOR_SCROLLBASE: number;
  COLOR_SCROLLTHUMB: number;
  ICON_CLOSE: number;
  ICON_CHECK: number;
  ICON_COLLAPSED: number;
  ICON_EXPANDED: number;
  OPT_ALIGNCENTER: number;
  OPT_ALIGNRIGHT: number;
  OPT_NOINTERACT: number;
  OPT_NOFRAME: number;
  OPT_NORESIZE: number;
  OPT_NOSCROLL: number;
  OPT_NOCLOSE: number;
  OPT_NOTITLE: number;
  OPT_HOLDFOCUS: number;
  OPT_AUTOSIZE: number;
  OPT_POPUP: number;
  OPT_CLOSED: number;
  OPT_EXPANDED: number;
  MOUSE_LEFT: number;
  MOUSE_RIGHT: number;
  MOUSE_MIDDLE: number;
  KEY_SHIFT: number;
  KEY_CTRL: number;
  KEY_ALT: number;
  KEY_BACKSPACE: number;
  KEY_RETURN: number;
}
export type MainModule = WasmModule & EmbindModule;
