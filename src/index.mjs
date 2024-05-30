const enable_debug = false;

/**
 * @param {CanvasRenderingContext2D} ctx2d
 * @param {string} text
 * @param {number} len
 * @returns {TextMetrics}
 */
function getMetrics(ctx2d, text, len) {
    ctx2d.save();
    ctx2d.font = `${FONT_HEIGHT}px sans`;
    let str;
    if (typeof text === "string")
        str = text;
    else
        str = microui.UTF8ToString(text);
    if (len !== -1)
        str = str.substring(0, len);
    const metrics = ctx2d.measureText(str);
    ctx2d.restore();
    return metrics;
}

const FONT_HEIGHT = 12;

export class Canvas2DRenderer {
    // canvas, canvas2d_context, microui_context, key_event_target
    constructor(options) {
        const canvas = options.canvas;

        let ctx2d;
        if (options.canvas2d_context !== undefined) {
            ctx2d = options.canvas2d_context;
        } else {
            ctx2d = canvas.getContext("2d");
            ctx2d.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
        this.ctx2d = ctx2d;

        let mctx;
        if (options.microui_context !== undefined) {
            mctx = options.microui_context;
        } else {
            mctx = new microui.Context();
            const metrics = getMetrics(ctx2d, "ABC", -1);
            const font_height_actual = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
            mctx.set_text_width_callback(microui.addFunction((_, text, len) => getMetrics(ctx2d, text, len).width, 'iiii'));
            mctx.set_text_height_callback(microui.addFunction((_) => font_height_actual, 'ii'));
        }
        this.mctx = mctx;

        const mu_mouse_btns = [microui.MOUSE_LEFT, microui.MOUSE_MIDDLE, microui.MOUSE_RIGHT];
        canvas.addEventListener("mousemove", ev => {
            mctx.input_mousemove(ev.offsetX, ev.offsetY);
        });
        canvas.addEventListener("mousedown", ev => {
            mctx.input_mousedown(ev.offsetX, ev.offsetY, mu_mouse_btns[ev.button]);
        });
        canvas.addEventListener("mouseup", ev => {
            mctx.input_mouseup(ev.offsetX, ev.offsetY, mu_mouse_btns[ev.button]);
        });
        canvas.addEventListener("wheel", ev => {
            mctx.input_scroll(ev.deltaX, ev.deltaY);
        });

        let key_event_target;
        if (options.key_event_target !== undefined) {
            key_event_target = options.key_event_target;
        } else {
            key_event_target = document.body;
        }
        // microui's `input_keydown` and `input_keyup` only process control keys.
        key_event_target.addEventListener("keydown", ev => {
            const ck = map_control_key(ev.key);
            if (ck) {
                mctx.input_keydown(ck);
            } else if (ev.key.length == 1) {
                mctx.input_text(ev.key);
            }
        });
        key_event_target.addEventListener("keyup", ev => {
            const ck = map_control_key(ev.key);
            if (ck) {
                mctx.input_keyup(ck);
            }
        });
    }

    microui_context() {
        return this.mctx;
    }

    canvas2d_context() {
        return this.ctx2d;
    }

    render() {
        process_commands(this.mctx, this.ctx2d);
    }
}

let CONTROL_KEY_MAP;
function map_control_key(k) {
    if (CONTROL_KEY_MAP === undefined) {
        CONTROL_KEY_MAP = new Map([
            ["Shift", microui.KEY_SHIFT],
            ["Control", microui.KEY_CTRL],
            ["Alt", microui.KEY_ALT],
            ["Enter", microui.KEY_RETURN],
            ["Backspace", microui.KEY_BACKSPACE],
        ]);
    }
    return CONTROL_KEY_MAP.get(k);
}

/**
 * @param {*} mctx
 * @param {CanvasRenderingContext2D} ctx2d
 */
function process_commands(mctx, ctx2d) {
    ctx2d.save();

    const commands = mctx.commands();
    for (const cmd of commands) {
        switch (cmd.type) {
            case microui.COMMAND_TEXT: draw_text(ctx2d, cmd.text_str, cmd.text.pos, cmd.text.color); break;
            case microui.COMMAND_RECT: draw_rect(ctx2d, cmd.rect.rect, cmd.rect.color); break;
            case microui.COMMAND_ICON: draw_icon(ctx2d, cmd.icon.id, cmd.icon.rect, cmd.icon.color); break;
            case microui.COMMAND_CLIP: set_clip_rect(ctx2d, cmd.clip.rect); break;
        }
    }

    ctx2d.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx2d
 */
function draw_text(ctx2d, str, pos, color) {
    ctx2d.font = `${FONT_HEIGHT}px sans`;
    ctx2d.fillStyle = color_to_hex(color);
    const metrics = getMetrics(ctx2d, str, -1);
    const y = pos.y + metrics.fontBoundingBoxAscent;
    ctx2d.fillText(str, pos.x, y);
    // debug
    if (enable_debug) {
        ctx2d.strokeStyle = "blue";
        const y1 = y + metrics.fontBoundingBoxDescent;
        const height = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        ctx2d.strokeRect(pos.x, y1, metrics.width, -height);
    }
}

function draw_rect(ctx2d, rect, color) {
    ctx2d.fillStyle = color_to_hex(color);
    ctx2d.fillRect(rect.x, rect.y, rect.w, rect.h);
}

/**
 * @param {CanvasRenderingContext2D} ctx2d
 */
function draw_icon(ctx2d, icon_id, rect, color) {
    if (enable_debug) {
        draw_rect(ctx2d, rect, { r: 10, g: 10, b: 250, a: 190 });
    }
    switch (icon_id) {
        case microui.ICON_CLOSE: {
            ctx2d.strokeStyle = color_to_hex(color);
            ctx2d.lineWidth = 1.25;
            ctx2d.lineCap = "square";
            const r = 0.35;
            ctx2d.beginPath();
            ctx2d.moveTo(rect.x + rect.w * r, rect.y + rect.h * r);
            ctx2d.lineTo(rect.x + rect.w * (1 - r), rect.y + rect.h * (1 - r));
            ctx2d.moveTo(rect.x + rect.w * (1 - r), rect.y + rect.h * r);
            ctx2d.lineTo(rect.x + rect.w * r, rect.y + rect.h * (1 - r));
            ctx2d.stroke();
            break;
        }
        case microui.ICON_CHECK: {
            ctx2d.strokeStyle = color_to_hex(color);
            ctx2d.lineWidth = 1.25;
            ctx2d.lineCap = "square";
            const dy1 = 0.55;
            const dx1 = 0.2;
            const dx2 = 0.15;
            const dx3 = 0.4;
            ctx2d.beginPath();
            ctx2d.moveTo(rect.x + rect.w * dx1, rect.y + rect.h * dy1);
            ctx2d.lineTo(rect.x + rect.w * (dx1 + dx2), rect.y + rect.h * (dy1 + dx2));
            ctx2d.lineTo(rect.x + rect.w * (dx1 + dx2 + dx3), rect.y + rect.h * (dy1 + dx2 - dx3));
            ctx2d.stroke();
            break;
        }
        case microui.ICON_COLLAPSED: {
            ctx2d.strokeStyle = color_to_hex(color);
            ctx2d.lineWidth = 1.25;
            ctx2d.lineCap = "square";
            const r = 0.35;
            const dx = 0.1;
            ctx2d.beginPath();
            ctx2d.moveTo(rect.x + rect.w * (r + dx), rect.y + rect.h * r);
            ctx2d.lineTo(rect.x + rect.w * (0.5 + dx), rect.y + rect.h * 0.5);
            ctx2d.lineTo(rect.x + rect.w * (r + dx), rect.y + rect.h * (1 - r));
            ctx2d.stroke();
            break;
        }
        case microui.ICON_EXPANDED: {
            ctx2d.strokeStyle = color_to_hex(color);
            ctx2d.lineWidth = 1.25;
            ctx2d.lineCap = "square";
            const r = 0.35;
            const dy = 0.1;
            ctx2d.beginPath();
            ctx2d.moveTo(rect.x + rect.w * r, rect.y + rect.h * (r + dy));
            ctx2d.lineTo(rect.x + rect.w * 0.5, rect.y + rect.h * (0.5 + dy));
            ctx2d.lineTo(rect.x + rect.w * (1 - r), rect.y + rect.h * (r + dy));
            ctx2d.stroke();
            break;
        }
    }
}

function set_clip_rect(ctx2d, rect) {
    // NOTE: CanvasRenderingContext2D.clip would set the intersection with the previous clip region.
    // draw_rect(ctx2d, rect, {r:0,g:0,b:255,a:255});
    // ctx2d.beginPath();
    // ctx2d.rect(rect.x, rect.y, rect.w, rect.h);
    // ctx2d.strokeStyle = "blue";
    // ctx2d.stroke()
    // return;
    ctx2d.restore();
    ctx2d.save();
    ctx2d.beginPath();
    ctx2d.rect(rect.x, rect.y, rect.w, rect.h);
    ctx2d.clip();
}

function hex2(c) {
    const h = c.toString(16).toUpperCase();
    return h.length == 1 ? "0" + h : h;
}

function color_to_hex(color) {
    let str = "#" + hex2(color.r) + hex2(color.g) + hex2(color.b);
    if (color.a !== undefined && color.a < 255)
        str += hex2(color.a);
    return str;
}

import MicroUiModuleLoader from "../dist/microui.mjs";

var microui = await MicroUiModuleLoader();

export default microui;

export { microui };
