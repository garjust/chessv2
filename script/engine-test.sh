PGN_OUT=./vendor/engine-build/engine-results.pgn

rm $PGN_OUT

if [ -z "$1" ]; then
  echo "No name for primary engine to test"
fi
if [ -z "$2" ]; then
  echo "No name for secondary engine to test"
fi

vendor/cutechess-cli \
  -engine name=$1 cmd=./vendor/engine-builds/$1/engine.mjs \
  -engine name=$2 cmd=./vendor/engine-builds/$2/engine.mjs \
  -each st=0.5 timemargin=50 proto=uci \
  -rounds 50 -games 2 \
  -repeat 2 \
  -outcomeinterval 1 \
  -concurrency 4 \
  -openings file=./vendor/silver-50.pgn \
  -pgnout $PGN_OUT min
