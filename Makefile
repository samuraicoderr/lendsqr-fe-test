.DEFAULT_GOAL := runserver

install:
	@echo "Installing the application..."
	npm install

runserver:
	npm run dev

build:
	npm run build


lint:
	npm run lint

lint-scss:
	npm run lint:scss


diff-staged:
	git diff --cached > ./a.diff
	code ./a.diff
	rm ./a.diff

diff+: diff-staged


diff-unstaged:
	git diff > ./a.diff
	code ./a.diff
	rm ./a.diff

diff: diff-unstaged
