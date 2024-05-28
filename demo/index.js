const enable_debug = false;

/**
 * @param {CanvasRenderingContext2D} ctx2d
 * @param {string} text
 * @param {number} len
 * @returns {TextMetrics}
 */
function getMetrics(ctx2d, text, len) {
    let str;
    if (typeof text === "string")
        str = text;
    else
        str = microui.UTF8ToString(text);
    if (len !== -1)
        str = str.substring(0, len);
    return ctx2d.measureText(str);
}

const FONT_HEIGHT = 12;

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
canvas.width = canvas.clientWidth * window.devicePixelRatio;
canvas.height = canvas.clientHeight * window.devicePixelRatio;

import MicroUiModule from "../dist/microui.mjs";

var microui;
var mctx;
var ctx2d;

MicroUiModule().then((Module) => {
    microui = Module;

    ctx2d = canvas.getContext("2d");
    ctx2d.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx2d.font = `${FONT_HEIGHT}px sans`;
    const metrics = getMetrics(ctx2d, "ABC", -1);
    const font_height_actual = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

    mctx = new microui.Context();
    mctx.set_text_width_callback(Module.addFunction((_, text, len) => getMetrics(ctx2d, text, len).width, 'iiii'));
    // mctx.set_text_height_callback(Module.addFunction((_) => {
    //     const metrics = getMetrics(ctx2d, text, len);
    //     return metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    // }, 'ii'));
    mctx.set_text_height_callback(Module.addFunction((_) => font_height_actual, 'ii'));

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
        mctx.input_scroll(ev.offsetX, ev.offsetY);
    });

    window.requestAnimationFrame(draw);
})

/**
 * @param {*} mctx
 * @param {CanvasRenderingContext2D} ctx2d
 */
function process_commands(mctx, ctx2d) {
    ctx2d.save();

    const commands = mctx.commands();
    for (const cmd of commands) {
        switch (cmd.type) {
            case microui.COMMAND_TEXT: draw_text(ctx2d, cmd.text_str(), cmd.text.pos, cmd.text.color); break;
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
    switch (icon_id) {
        case microui.ICON_CLOSE: {
            ctx2d.strokeStyle = color_to_hex(color);
            ctx2d.lineWidth = 1.25;
            ctx2d.lineCap = "square";
            ctx2d.strokeStyle = "white";
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
            // TODO: v
            break;
        }
        case microui.ICON_COLLAPSED: {
            // TODO: >
            break;
        }
        case microui.ICON_EXPANDED: {
            // TODO: v
            break;
        }
    }
}

function set_clip_rect(ctx2d, rect) {
    // NOTE: CanvasRenderingContext2D.clip would set the intersection with the previous clip region.
    ctx2d.restore();
    ctx2d.save();
    ctx2d.beginPath();
    ctx2d.rect(rect.x, rect.y, rect.w, rect.h);
    ctx2d.clip();
}

function hex2(c) {
    const h = c.toString(16);
    return h.length == 1 ? "0" + h : h;
}

function color_to_hex(color) {
    return "#" + hex2(color.r) + hex2(color.g) + hex2(color.b) + hex2(color.a);
}

function mu_rect(x, y, w, h) {
    return { x, y, w, h };
}

// User code

function draw() {
    process_frame(mctx);

    ctx2d.fillStyle = "#ddd"
    ctx2d.fillRect(0, 0, canvas.width, canvas.height);

    process_commands(mctx, ctx2d);

    window.requestAnimationFrame(draw);
}

let count = 0;

function my_test_window(ctx) {
    if (ctx.begin_window("Test Window", mu_rect(40, 40, 120, 80))) {
        if (ctx.button("count")) {
            count += 1;
        }
        ctx.text(`count: ${count}`);
        ctx.end_window();
    }
}

function process_frame(ctx) {
    ctx.begin();
    my_test_window(ctx);
    ctx.end();
}
