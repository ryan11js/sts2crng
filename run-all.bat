@echo off
setlocal
cd /d "%~dp0"

echo STS2 CRNG Lab - local simulation pipeline
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node was not found on PATH.
  echo Install Node or add portable Node to this folder before running the pipeline.
  pause
  exit /b 1
)

if not exist "generated\v0.107.0\single" mkdir "generated\v0.107.0\single"
if not exist "imports\discord" mkdir "imports\discord"
if not exist "data" mkdir "data"

echo [1/8] Validating legacy .NET Random...
node scripts\validate-rng.mjs || goto fail

echo.
echo [2/8] Validating article baseline pack...
node scripts\validate-article-pack.mjs || goto fail

echo.
echo [3/8] Running single-player seed sweep...
node scripts\generate-pack.mjs --version v0.107.0 --mode single --samples 1000000 --out generated\v0.107.0\single\generated-pack.json || goto fail

echo.
echo [4/8] Comparing generated pack to article baseline...
node scripts\compare-generated-pack.mjs --version v0.107.0 --generated generated\v0.107.0\single\generated-pack.json --tolerance 0.25 --allow-pending --out generated\v0.107.0\single\parity-report.json || goto fail

echo.
echo [5/8] Importing Discord run JSON files...
node scripts\collect\import-runs.mjs --input imports\discord --out data\runs.jsonl || goto fail

echo.
echo [6/8] Summarizing run data...
node scripts\collect\summarize-runs.mjs --input data\runs.jsonl || goto fail

echo.
echo [7/8] Writing co-op calibration reports...
node scripts\sim\calibrate-coop-offsets.mjs --input data\runs.jsonl --out generated\v0.107.0\coop || goto fail

echo.
echo [8/8] Suggesting next observations...
node scripts\sim\suggest-next-observations.mjs --runs data\runs.jsonl || goto fail

echo.
echo Done. Reports are in generated\v0.107.0.
pause
exit /b 0

:fail
echo.
echo Pipeline failed. Check the message above.
pause
exit /b 1
