dist/microui.mjs: src/microui.c src/binder.cpp
	emcc -lembind \
		-sALLOW_TABLE_GROWTH \
		-sALLOW_MEMORY_GROWTH \
		-sEXPORTED_FUNCTIONS=_malloc \
		-sEXPORTED_RUNTIME_METHODS=addFunction,UTF8ToString \
		-g \
		-o $@ \
		$(filter %.cpp,$^) $(filter %.c,$^) \
		--emit-tsd microui.d.ts

dist/microui.mjs: Makefile

.PHONY: clean
clean:
	-rm dist/*
