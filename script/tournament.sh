vendor/cutechess-cli \
  -engine name=iterative-weak cmd=./vendor/engine-builds/iterative-weak.v0/engine.mjs st=0.5 timemargin=50 proto=uci \
  -engine name=iterative cmd=./vendor/engine-builds/iterative.v0/engine.mjs st=0.5 timemargin=50 proto=uci \
  -rounds 2 -games 2 \
  -outcomeinterval 1 \
  -concurrency 4 \
  -openings file=./vendor/silver-50.pgn
