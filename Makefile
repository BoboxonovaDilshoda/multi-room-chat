APP_PORT ?= 5000

install:
	npm install

run:
	npm start

dev:
	npm run dev

demo:
	@echo "1) make install"
	@echo "2) make run"
	@echo "3) Open http://localhost:$(APP_PORT) in two or more browser windows"
	@echo "4) Set nicknames, join the same room, and exchange messages/replies/reactions"


