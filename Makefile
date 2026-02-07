.PHONY: start setup restart clean test test-ui build

start:
	bun start

setup:
	bun run setup

restart:
	bun run restart

clean:
	bun run clean

test:
	bun test

test-ui:
	bun run test:ui

build:
	bun run build
