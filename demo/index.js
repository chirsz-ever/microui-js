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
        mctx.input_scroll(ev.deltaX, ev.deltaY);
    });
    // microui's `input_keydown` and `input_keyup` only process control keys.
    document.body.addEventListener("keydown", ev => {
        const ck = map_control_key(ev.key);
        if (ck) {
            mctx.input_keydown(ck);
        } else if (ev.key.length == 1) {
            mctx.input_text(ev.key);
        }
    });
    document.body.addEventListener("keyup", ev => {
        const ck = map_control_key(ev.key);
        if (ck) {
            mctx.input_keyup(ck);
        }
    });

    setTimeout(() => window.requestAnimationFrame(draw), 0);
})

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

function mu_rect(x, y, w, h) {
    return { x, y, w, h };
}

// User code

const get_bg = function () {
    // float[3]
    let bg;

    return function () {
        if (bg === undefined) {
            bg = microui._malloc(3 * 4);
            microui.HEAPF32.set([90, 95, 100], bg / 4);
        }
        return bg;
    };
}();

function get_bg_color() {
    const bg = get_bg() / 4;
    return {
        r: microui.HEAPF32[bg] | 0,
        g: microui.HEAPF32[bg + 1] | 0,
        b: microui.HEAPF32[bg + 2] | 0,
        a: 255,
    };
}

function get_bg_color_str() {
    return color_to_hex(get_bg_color());
}

function draw() {
    process_frame(mctx);

    ctx2d.fillStyle = get_bg_color_str();
    ctx2d.fillRect(0, 0, canvas.width, canvas.height);

    process_commands(mctx, ctx2d);

    window.requestAnimationFrame(draw);
}

// demo code is from https://github.com/rxi/microui/blob/master/demo/main.c

let logbuf = "";
let logbuf_updated = false;
function write_log(text) {
    if (logbuf.length != 0)
        logbuf += "\n";
    logbuf += text;
    logbuf_updated = true;
}

// int[3]
let checks;

function test_window(ctx) {
    /* do window */
    if (ctx.begin_window("Demo Window", mu_rect(40, 40, 300, 450))) {
        const win = ctx.get_current_container();
        // WORKAROUND
        const rect = win.rect;
        rect.w = Math.max(rect.w, 240);
        rect.h = Math.max(rect.h, 300);
        win.rect = rect;

        /* window info */
        if (ctx.header("Window Info")) {
            const win = ctx.get_current_container();
            ctx.layout_row([54, -1], 0);
            ctx.label("Position:");
            ctx.label(`${win.rect.x}, ${win.rect.y}`);
            ctx.label("Size:");
            ctx.label(`${win.rect.w}, ${win.rect.h}`);
        }

        /* labels + buttons */
        if (ctx.header_ex("Test Buttons", microui.OPT_EXPANDED)) {
            ctx.layout_row([86, -110, -1], 0);
            ctx.label("Test buttons 1:");
            if (ctx.button("Button 1")) { write_log("Pressed button 1"); }
            if (ctx.button("Button 2")) { write_log("Pressed button 2"); }
            ctx.label("Test buttons 2:");
            if (ctx.button("Button 3")) { write_log("Pressed button 3"); }
            if (ctx.button("Popup")) { ctx.open_popup("Test Popup"); }
            if (ctx.begin_popup("Test Popup")) {
                ctx.button("Hello");
                ctx.button("World");
                ctx.end_popup();
            }
        }

        /* tree */
        if (ctx.header_ex("Tree and Text", microui.OPT_EXPANDED)) {
            ctx.layout_row([140, - 1], 0);
            ctx.layout_begin_column();
            if (ctx.begin_treenode("Test 1")) {
                if (ctx.begin_treenode("Test 1a")) {
                    ctx.label("Hello");
                    ctx.label("world");
                    ctx.end_treenode();
                }
                if (ctx.begin_treenode("Test 1b")) {
                    if (ctx.button("Button 1")) { write_log("Pressed button 1"); }
                    if (ctx.button("Button 2")) { write_log("Pressed button 2"); }
                    ctx.end_treenode();
                }
                ctx.end_treenode();
            }
            if (ctx.begin_treenode("Test 2")) {
                ctx.layout_row([54, 54], 0);
                if (ctx.button("Button 3")) { write_log("Pressed button 3"); }
                if (ctx.button("Button 4")) { write_log("Pressed button 4"); }
                if (ctx.button("Button 5")) { write_log("Pressed button 5"); }
                if (ctx.button("Button 6")) { write_log("Pressed button 6"); }
                ctx.end_treenode();
            }
            if (ctx.begin_treenode("Test 3")) {
                if (checks === undefined) {
                    checks = microui._malloc(3 * 4);
                    microui.HEAP32.set([1, 0, 1], checks / 4);
                }
                ctx.checkbox("Checkbox 1", checks);
                ctx.checkbox("Checkbox 2", checks + 4);
                ctx.checkbox("Checkbox 3", checks + 8);
                ctx.end_treenode();
            }
            ctx.layout_end_column();

            ctx.layout_begin_column();
            ctx.layout_row([-1], 0);
            ctx.text("Lorem ipsum dolor sit amet, consectetur adipiscing "
                + "elit. Maecenas lacinia, sem eu lacinia molestie, mi risus faucibus "
                + "ipsum, eu varius magna felis a nulla.");
            ctx.layout_end_column();
        }

        /* background color sliders */
        if (ctx.header_ex("Background Color", microui.OPT_EXPANDED)) {
            ctx.layout_row([-78, -1], 74);
            /* sliders */
            const bg = get_bg();
            ctx.layout_begin_column();
            ctx.layout_row([46, -1], 0);
            ctx.label("Red:"); ctx.slider(bg, 0, 255);
            ctx.label("Green:"); ctx.slider(bg + 4, 0, 255);
            ctx.label("Blue:"); ctx.slider(bg + 8, 0, 255);
            ctx.layout_end_column();
            /* color preview */
            const r = ctx.layout_next();
            ctx.draw_rect(r, get_bg_color());
            ctx.draw_control_text(get_bg_color_str(), r, microui.COLOR_TEXT, microui.OPT_ALIGNCENTER);
        }

        ctx.end_window();
    }
}

let buf;
function log_window(ctx) {
    if (ctx.begin_window("Log Window", mu_rect(350, 40, 300, 200))) {
        /* output text panel */
        ctx.layout_row([-1], -25);
        ctx.begin_panel("Log Output");
        const panel = ctx.get_current_container();
        ctx.layout_row([-1], -1);
        ctx.text(logbuf);
        ctx.end_panel();
        if (logbuf_updated) {
            // WORKAROUND
            panel.scroll = Object.assign(panel.scroll, { y: panel.content_size.y });
            logbuf_updated = 0;
        }

        /* input textbox + submit button */
        if (buf === undefined) {
            buf = microui._malloc(128);
            microui.HEAPU8.fill(0, buf, buf + 128);
        }
        let submitted = 0;
        ctx.layout_row([-70, -1], 0);
        if (ctx.textbox(buf, 128) & microui.RES_SUBMIT) {
            ctx.set_focus(ctx.last_id);
            submitted = 1;
        }
        if (ctx.button("Submit")) { submitted = 1; }
        if (submitted) {
            if (microui.HEAPU8[buf] != 0) {
                write_log(microui.UTF8ToString(buf));
                microui.HEAPU8[buf] = 0;
            }
        }

        ctx.end_window();
    }
}

let tmp;
function uint8_slider(ctx, u8ptr, low, high) {
    if (tmp === undefined) {
        tmp = microui._malloc(4);
    }
    ctx.push_id_ptr(u8ptr);
    microui.HEAPF32[tmp / 4] = microui.HEAPU8[u8ptr];
    let res = ctx.slider_ex(tmp, low, high, 0, "%.0f", microui.OPT_ALIGNCENTER);
    microui.HEAPU8[u8ptr] = microui.HEAPF32[tmp / 4] | 0;
    ctx.pop_id();
    return res;
}

let color_infos;
function style_window(ctx) {
    if (color_infos === undefined) {
        color_infos = [
            ["text:", microui.COLOR_TEXT],
            ["border:", microui.COLOR_BORDER],
            ["windowbg:", microui.COLOR_WINDOWBG],
            ["titlebg:", microui.COLOR_TITLEBG],
            ["titletext:", microui.COLOR_TITLETEXT],
            ["panelbg:", microui.COLOR_PANELBG],
            ["button:", microui.COLOR_BUTTON],
            ["buttonhover:", microui.COLOR_BUTTONHOVER],
            ["buttonfocus:", microui.COLOR_BUTTONFOCUS],
            ["base:", microui.COLOR_BASE],
            ["basehover:", microui.COLOR_BASEHOVER],
            ["basefocus:", microui.COLOR_BASEFOCUS],
            ["scrollbase:", microui.COLOR_SCROLLBASE],
            ["scrollthumb:", microui.COLOR_SCROLLTHUMB],
        ]
    }
    if (ctx.begin_window("Style Editor", mu_rect(350, 250, 300, 240))) {
        const sw = ctx.get_current_container().body.w * 0.14;
        ctx.layout_row([80, sw, sw, sw, sw, -1], 0);
        const base_addr = ctx.style_colors_addr();
        for (let i = 0; i < color_infos.length; ++i) {
            ctx.label(color_infos[i][0]);
            const color_addr = base_addr + i * 4;
            uint8_slider(ctx, color_addr, 0, 255);
            uint8_slider(ctx, color_addr + 1, 0, 255);
            uint8_slider(ctx, color_addr + 2, 0, 255);
            uint8_slider(ctx, color_addr + 3, 0, 255);
            const color = {
                r: microui.HEAPU8[color_addr],
                g: microui.HEAPU8[color_addr + 1],
                b: microui.HEAPU8[color_addr + 2],
                a: microui.HEAPU8[color_addr + 3],
            }
            ctx.draw_rect(ctx.layout_next(), color);
        }
        ctx.end_window();
    }
}

let count = 0;
function my_test_window(ctx) {
    if (ctx.begin_window("Test Window", mu_rect(670, 40, 120, 80))) {
        if (ctx.button("count")) {
            count += 1;
        }
        ctx.text(`count: ${count}`);
        ctx.end_window();
    }
}

function process_frame(ctx) {
    ctx.begin();
    test_window(ctx);
    log_window(ctx);
    style_window(ctx);
    my_test_window(ctx);
    ctx.end();
}
