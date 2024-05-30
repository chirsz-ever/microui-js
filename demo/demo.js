
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
canvas.width = canvas.clientWidth * window.devicePixelRatio;
canvas.height = canvas.clientHeight * window.devicePixelRatio;

import { microui, Canvas2DRenderer } from "../src/index.mjs";

function mu_rect(x, y, w, h) {
    return { x, y, w, h };
}

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

function get_bg_color_str() {
    return color_to_hex(get_bg_color());
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

const renderer = new Canvas2DRenderer({ canvas });

function draw() {
    process_frame(renderer.microui_context());

    renderer.canvas2d_context().fillStyle = get_bg_color_str();
    renderer.canvas2d_context().fillRect(0, 0, canvas.width, canvas.height);

    renderer.render();

    window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);
