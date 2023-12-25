vendor/cutechess-cli \
  -engine name=alphabeta cmd=./vendor/engine-builds/alphabeta.v0/engine.mjs st=1 proto=uci \
  -engine name=iterative cmd=./vendor/engine-builds/iterative.v0/engine.mjs st=1 proto=uci \
  -rounds 2 -games 2 \
  -outcomeinterval 1 \
  -openings file=./vendor/silver-50.pgn -debug
