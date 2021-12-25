# chess

- `ai/` Computer implementations, each will rely on a chess engines
- `engines/` Various chess engines. `default` is used by the game workflow
- `lib/` Reusable chess libraries across the whole application and multiple engines
- `ui/` React UI for the chess game
- `workers/` WebWorker scripts for multi-threading
- `workflow/` The workflow which controls the game

## TODO

- Refactor `ComputedPositionData.movesByPiece` to be an array since I basically always flatten it to one for iterating over
- Track king squares in computed data
- Change avaialble* in computed data to be `AttackObject[]`
- Track pins in computed data
