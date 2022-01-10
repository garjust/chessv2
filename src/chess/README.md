# chess

- `ai/` Computer implementations, each will rely on a chess engines
- `engines/` Various chess engines. `default` is used by the game workflow
- `lib/` Reusable chess libraries across the whole application and multiple engines
- `ui/` React UI for the chess game
- `workers/` WebWorker scripts for multi-threading
- `workflow/` The workflow which controls the game

## TODO

- Decrease weight of moves to squares attacked by pawns
- Profile attack-based move generaiton
- Add move ordering heuristics (killer move)
- v7 iterative deepening
- Transposition table
- Opening book (Kevin will fried liver me)
- Computers return the full line of chosen move
- Evaluation of checkmates (M1..N) and actually able to checkmate
