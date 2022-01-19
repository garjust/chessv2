# chess

- `chess/` The chess game
  - `ai/` Search algorithm implementations
    - `algorithms/` Each individual algorithm and configuration
    - `search/` The actual search function and supporting code
  - `engine/` The core chess engine. Supports functionality needed for humans to play a game of chess (move gen, move execution)
  - `lib/` Reusable chess libraries across the whole application
  - `ui/` React UI for the chess game
  - `workers/` WebWorker scripts for multi-threading
  - `workflow/` The state workflow which controls the game ui
- `lib/`
  - `workflow/` Workflow core library
  - `workflow-react/` Integration of the core workflow library with react

## TODO

- Decrease weight of moves to squares attacked by pawns
- Implement attack-based move generation as an option (instead of commenting code repeatedly)
- Opening book (Kevin will fried liver me)
- Evaluation of checkmates (M1..N) and actually able to checkmate
- Evaluation likes pawn cover for king
  - Maybe this means squares that attack the king are blocked or defended (knight attacks squares are defended against, rays to squares near king are blocked by pawns)
- Disable move ordering in quiescenceSearch
- Cut% is incorrect because v3 visits more nodes than there are moves
- Debug black mate position, engine should find it at depth 5
- Zobrish hash en passant square

## Bug Positions

### `rnbqk1nr/pppp1ppp/8/4p3/1b1P4/8/PPPKPPPP/RNBQ1BNR/ w kQ - 2 3`
King pinned to square behind it, now allowing king to move to square being x-ray attacked by checking piece with *attack moves* scheme
