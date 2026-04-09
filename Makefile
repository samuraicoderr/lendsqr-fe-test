.DEFAULT_GOAL := runserver

install:
	@echo "Installing the application..."
	npm install

runserver:
	npm run dev

build:
	npm run build


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