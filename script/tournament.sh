vendor/cutechess-cli \
  -engine name=stockfish cmd=stockfish tc=30+1 proto=uci \
  -engine name=justin cmd=./build/engine.mjs tc=30+1 proto=uci
