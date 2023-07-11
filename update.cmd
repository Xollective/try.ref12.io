cd %~dp0
robocopy C:\Code\NuCodex\src\Codex.Web.Wasm\bin\Debug\net7.0\browser-wasm\AppBundle %~dp0\docs /MIR

git reset HEAD~1
git add -A
git commit -m "Add files"
git push --force