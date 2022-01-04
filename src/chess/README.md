# chess

- `ai/` Computer implementations, each will rely on a chess engines
- `engines/` Various chess engines. `default` is used by the game workflow
- `lib/` Reusable chess libraries across the whole application and multiple engines
- `ui/` React UI for the chess game
- `workers/` WebWorker scripts for multi-threading
- `workflow/` The workflow which controls the game

## TODO

- Decrease weight of moves to squares attacked by pawns

### Attack Maps

Note: calling `attacksOnSquare` between 1-9 times per move generation (once for checks, 0-8 for king moves)

> Can use the attack map to generate most moves
  > Need to prune moves leaving self in check and moves capturing own-pieces
  > Notable handles sliding moves really well which is slow.
