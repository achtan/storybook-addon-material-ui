@echo off

setlocal enabledelayedexpansion

set GIT_URL_CMD=git config --get remote.github.url
for /F "usebackq delims=" %%v in (`%GIT_URL_CMD%`) do set GIT_URL=%%v

if %GIT_URL%=="" (
	echo This project is not configured with a remote git repo
	exit 1
)



git init
git config user.name "smARTLight Bot"
git config user.email "windows@ghbot.com"
git add . 
git commit -m "Publish example" 
git push --force --quiet  !GIT_URL! master:example_project


echo Storybook example published

endlocal