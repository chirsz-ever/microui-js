# microui-js

compile microui to javascript and wasm.

---

## Compile

run `make`.

## Run the demo

Run

```sh
python3 -m http.server
```

and visit <http://localhost:8000/demo/index.html>.

## TODO

- [ ] split canvas2d renderer
- [ ] WebGL renderer
- [ ] WebGPU renderer
- [ ] document about how to integrate into your project
- [ ] publish to npm

## Acknowledgment

`src/microui.h` and `src/microui.c` is copied from [microui](https://github.com/rxi/microui) under MIT License.
