# microui-js

A WASM based JavaScript binding of [rxi/microui](https://github.com/rxi/microui) to javascript and wasm.

---

## Compile

run `npm run build`.

## Run the demo

Run `npm run demo` or `python3 -m http.server`, then visit <http://localhost:8000/demo/demo.html>.

## TODO

- [x] split canvas2d renderer
- [ ] WebGL renderer
- [ ] WebGPU renderer
- [ ] document about how to integrate into your project
- [ ] publish to npm
- [ ] use webpack and bable?

## Acknowledgment

`src/microui.h` and `src/microui.c` is copied from [microui](https://github.com/rxi/microui) under MIT License.
