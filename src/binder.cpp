extern "C" {
#include "microui.h"
}

#include <cstdint>
#include <cstdlib>
#include <emscripten/bind.h>
#include <string>
#include <vector>

static mu_Context *my_new_mu_Context() {
    mu_Context *ctx = new mu_Context;
    mu_init(ctx);
    return ctx;
}

static std::vector<mu_Command *> my_mu_commands(mu_Context *ctx) {
    mu_Command *cmd = NULL;
    std::vector<mu_Command *> vec;
    while (mu_next_command(ctx, &cmd))
        vec.push_back(cmd);
    return vec;
}

static std::string my_mu_cmd_text_str(mu_Command *cmd) {
    return cmd->text.str;
}

static auto my_mu_button(mu_Context *ctx, const std::string& label) {
    return mu_button(ctx, label.c_str());
}

static auto my_mu_text(mu_Context *ctx, const std::string &text) {
    return mu_text(ctx, text.c_str());
}

static auto my_mu_begin_window(mu_Context *ctx, const std::string& title, mu_Rect rect) {
    return mu_begin_window(ctx, title.c_str(), rect);
}

static void my_set_text_width_callback(mu_Context *ctx, intptr_t callback) {
    ctx->text_width = (int (*)(mu_Font, const char *, int))callback;
}

static void my_set_text_height_callback(mu_Context *ctx, intptr_t callback) {
    ctx->text_height = (int (*)(mu_Font))callback;
}

static mu_Command *CommandList_at(std::vector<mu_Command *> &vec, size_t x) {
    return vec.at(x);
}

using namespace emscripten;

EMSCRIPTEN_BINDINGS(microui) {
    class_<mu_Context>("Context")
        .constructor(my_new_mu_Context, allow_raw_pointers())
        .function("begin", mu_begin, allow_raw_pointers())
        .function("end", mu_end, allow_raw_pointers())
        .function("set_focus", mu_set_focus, allow_raw_pointers())
        // need bind `void*`
        // .function("get_id", mu_get_id, allow_raw_pointers())
        // .function("push_id", mu_push_id, allow_raw_pointers())
        .function("pop_id", mu_pop_id, allow_raw_pointers())
        .function("push_clip_rect", mu_push_clip_rect, allow_raw_pointers())
        .function("pop_clip_rect", mu_pop_clip_rect, allow_raw_pointers())
        .function("get_clip_rect", mu_get_clip_rect, allow_raw_pointers())
        .function("check_clip", mu_check_clip, allow_raw_pointers())
        // need bind `mu_Container`
        // .function("get_current_container", mu_get_current_container, allow_raw_pointers())
        // .function("get_container", mu_get_container, allow_raw_pointers())
        // .function("bring_to_front", mu_bring_to_front, allow_raw_pointers())
        // need bind `mu_PoolItem`
        // .function("pool_init", mu_pool_init, allow_raw_pointers())
        // .function("pool_get", mu_pool_get, allow_raw_pointers())
        // .function("pool_update", mu_pool_update, allow_raw_pointers())
        .function("input_mousemove", mu_input_mousemove, allow_raw_pointers())
        .function("input_mousedown", mu_input_mousedown, allow_raw_pointers())
        .function("input_mouseup", mu_input_mouseup, allow_raw_pointers())
        .function("input_scroll", mu_input_scroll, allow_raw_pointers())
        .function("input_keydown", mu_input_keydown, allow_raw_pointers())
        .function("input_keyup", mu_input_keyup, allow_raw_pointers())
        // TODO: const char*
        // .function("input_text", mu_input_text, allow_raw_pointers())
        .function("push_command", mu_push_command, allow_raw_pointers())
        // .function("next_command", mu_next_command, allow_raw_pointers())
        .function("set_clip", mu_set_clip, allow_raw_pointers())
        .function("draw_rect", mu_draw_rect, allow_raw_pointers())
        .function("draw_box", mu_draw_box, allow_raw_pointers())
        // TODO: const char*
        // .function("draw_text", mu_draw_text, allow_raw_pointers())
        .function("draw_icon", mu_draw_icon, allow_raw_pointers())
        // .function("layout_row", mu_layout_row, allow_raw_pointers())
        .function("layout_width", mu_layout_width, allow_raw_pointers())
        .function("layout_height", mu_layout_height, allow_raw_pointers())
        .function("layout_begin_column", mu_layout_begin_column, allow_raw_pointers())
        .function("layout_end_column", mu_layout_end_column, allow_raw_pointers())
        .function("layout_set_next", mu_layout_set_next, allow_raw_pointers())
        .function("layout_next", mu_layout_next, allow_raw_pointers())
        // TODO: const char*
        // .function("draw_control_frame", mu_draw_control_frame, allow_raw_pointers())
        // .function("draw_control_text", mu_draw_control_text, allow_raw_pointers())
        .function("mouse_over", mu_mouse_over, allow_raw_pointers())
        .function("update_control", mu_update_control, allow_raw_pointers())
        // TODO: const char* or other pointer
        // .function("text", mu_text, allow_raw_pointers())
        // .function("label", mu_label, allow_raw_pointers())
        // .function("button_ex", mu_button_ex, allow_raw_pointers())
        // .function("checkbox", mu_checkbox, allow_raw_pointers())
        // .function("textbox_raw", mu_textbox_raw, allow_raw_pointers())
        // .function("textbox_ex", mu_textbox_ex, allow_raw_pointers())
        // .function("slider_ex", mu_slider_ex, allow_raw_pointers())
        // .function("number_ex", mu_number_ex, allow_raw_pointers())
        // .function("header_ex", mu_header_ex, allow_raw_pointers())
        // .function("begin_treenode_ex", mu_begin_treenode_ex, allow_raw_pointers())
        .function("end_treenode", mu_end_treenode, allow_raw_pointers())
        // TODO: const char*
        // .function("begin_window_ex", mu_begin_window_ex, allow_raw_pointers())
        .function("end_window", mu_end_window, allow_raw_pointers())
        // TODO: const char*
        // .function("open_popup", mu_open_popup, allow_raw_pointers())
        // .function("begin_popup", mu_begin_popup, allow_raw_pointers())
        .function("end_popup", mu_end_popup, allow_raw_pointers())
        // TODO: const char*
        // .function("begin_panel_ex", mu_begin_panel_ex, allow_raw_pointers())
        .function("end_panel", mu_end_panel, allow_raw_pointers())
        // macros
        // TODO: const char*
        // .function("button", static_mu_button, allow_raw_pointers())
        // .function("textbox", static_mu_textbox, allow_raw_pointers())
        // .function("slider", static_mu_slider, allow_raw_pointers())
        // .function("number", static_mu_number, allow_raw_pointers())
        // .function("header", static_mu_header, allow_raw_pointers())
        // .function("begin_treenode", static_mu_begin_treenode, allow_raw_pointers())
        // .function("begin_window", static_mu_begin_window, allow_raw_pointers())
        // .function("begin_panel", static_mu_begin_panel, allow_raw_pointers())
        // workaround
        .function("button", my_mu_button, allow_raw_pointers())
        .function("text", my_mu_text, allow_raw_pointers())
        .function("begin_window", my_mu_begin_window, allow_raw_pointers())
        .function("set_text_width_callback", my_set_text_width_callback, allow_raw_pointers())
        .function("set_text_height_callback", my_set_text_height_callback, allow_raw_pointers())
        .function("commands", my_mu_commands, allow_raw_pointers());

    class_<std::vector<mu_Command *>>("CommandList")
        .function("size", &std::vector<mu_Command *>::size)
        .function("at", CommandList_at, allow_raw_pointers());

    value_object<mu_Vec2>("Vec2").field("x", &mu_Vec2::x).field("y", &mu_Vec2::y);

    value_object<mu_Rect>("Rect")
        .field("x", &mu_Rect::x)
        .field("y", &mu_Rect::y)
        .field("w", &mu_Rect::w)
        .field("h", &mu_Rect::h);

    value_object<mu_Color>("Color")
        .field("r", &mu_Color::r)
        .field("g", &mu_Color::g)
        .field("b", &mu_Color::b)
        .field("a", &mu_Color::a);

    class_<mu_Command>("Command")
        .property("type", &mu_Command::type)
        .property("text", &mu_Command::text)
        .property("clip", &mu_Command::clip)
        .property("rect", &mu_Command::rect)
        .property("icon", &mu_Command::icon)
        .function("text_str", my_mu_cmd_text_str, allow_raw_pointers());

    class_<mu_TextCommand>("TextCommand")
        // .property("font", &mu_TextCommand::font)
        .property("pos", &mu_TextCommand::pos)
        .property("color", &mu_TextCommand::color);

    class_<mu_ClipCommand>("ClipCommand").property("rect", &mu_ClipCommand::rect);

    class_<mu_RectCommand>("RectCommand")
        .property("rect", &mu_RectCommand::rect)
        .property("color", &mu_RectCommand::color);

    class_<mu_IconCommand>("IconCommand")
        .property("id", &mu_IconCommand::id)
        .property("rect", &mu_IconCommand::rect)
        .property("color", &mu_IconCommand::color);

    constant<int>("COMMAND_CLIP", MU_COMMAND_CLIP);
    constant<int>("COMMAND_RECT", MU_COMMAND_RECT);
    constant<int>("COMMAND_TEXT", MU_COMMAND_TEXT);
    constant<int>("COMMAND_ICON", MU_COMMAND_ICON);

    constant<int>("COLOR_TEXT", MU_COLOR_TEXT);
    constant<int>("COLOR_BORDER", MU_COLOR_BORDER);
    constant<int>("COLOR_WINDOWBG", MU_COLOR_WINDOWBG);
    constant<int>("COLOR_TITLEBG", MU_COLOR_TITLEBG);
    constant<int>("COLOR_TITLETEXT", MU_COLOR_TITLETEXT);
    constant<int>("COLOR_PANELBG", MU_COLOR_PANELBG);
    constant<int>("COLOR_BUTTON", MU_COLOR_BUTTON);
    constant<int>("COLOR_BUTTONHOVER", MU_COLOR_BUTTONHOVER);
    constant<int>("COLOR_BUTTONFOCUS", MU_COLOR_BUTTONFOCUS);
    constant<int>("COLOR_BASE", MU_COLOR_BASE);
    constant<int>("COLOR_BASEHOVER", MU_COLOR_BASEHOVER);
    constant<int>("COLOR_BASEFOCUS", MU_COLOR_BASEFOCUS);
    constant<int>("COLOR_SCROLLBASE", MU_COLOR_SCROLLBASE);
    constant<int>("COLOR_SCROLLTHUMB", MU_COLOR_SCROLLTHUMB);

    constant<int>("ICON_CLOSE", MU_ICON_CLOSE);
    constant<int>("ICON_CHECK", MU_ICON_CHECK);
    constant<int>("ICON_COLLAPSED", MU_ICON_COLLAPSED);
    constant<int>("ICON_EXPANDED", MU_ICON_EXPANDED);

    constant<int>("OPT_ALIGNCENTER", MU_OPT_ALIGNCENTER);
    constant<int>("OPT_ALIGNRIGHT", MU_OPT_ALIGNRIGHT);
    constant<int>("OPT_NOINTERACT", MU_OPT_NOINTERACT);
    constant<int>("OPT_NOFRAME", MU_OPT_NOFRAME);
    constant<int>("OPT_NORESIZE", MU_OPT_NORESIZE);
    constant<int>("OPT_NOSCROLL", MU_OPT_NOSCROLL);
    constant<int>("OPT_NOCLOSE", MU_OPT_NOCLOSE);
    constant<int>("OPT_NOTITLE", MU_OPT_NOTITLE);
    constant<int>("OPT_HOLDFOCUS", MU_OPT_HOLDFOCUS);
    constant<int>("OPT_AUTOSIZE", MU_OPT_AUTOSIZE);
    constant<int>("OPT_POPUP", MU_OPT_POPUP);
    constant<int>("OPT_CLOSED", MU_OPT_CLOSED);
    constant<int>("OPT_EXPANDED", MU_OPT_EXPANDED);

    constant<int>("MOUSE_LEFT", MU_MOUSE_LEFT);
    constant<int>("MOUSE_RIGHT", MU_MOUSE_RIGHT);
    constant<int>("MOUSE_MIDDLE", MU_MOUSE_MIDDLE);

    constant<int>("KEY_SHIFT", MU_KEY_SHIFT);
    constant<int>("KEY_CTRL", MU_KEY_CTRL);
    constant<int>("KEY_ALT", MU_KEY_ALT);
    constant<int>("KEY_BACKSPACE", MU_KEY_BACKSPACE);
    constant<int>("KEY_RETURN", MU_KEY_RETURN);
}
