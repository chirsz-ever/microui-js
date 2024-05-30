OUTPUT_DIR = ../dist

$(OUTPUT_DIR)/microui.mjs $(OUTPUT_DIR)/microui.wasm: microui.c binder.cpp
	@mkdir -p $(OUTPUT_DIR)
	emcc -lembind \
		-sALLOW_TABLE_GROWTH \
		-sALLOW_MEMORY_GROWTH \
		-sEXPORTED_FUNCTIONS=_malloc \
		-sEXPORTED_RUNTIME_METHODS=addFunction,UTF8ToString \
		-g \
		-o $@ \
		$(filter %.cpp,$^) $(filter %.c,$^) \
		--emit-tsd microui.d.ts

$(OUTPUT_DIR)/microui.mjs $(OUTPUT_DIR)/microui.wasm: Makefile

.PHONY: clean
clean:
	-rm $(OUTPUT_DIR)/*
