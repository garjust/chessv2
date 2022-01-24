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
- Don't recalculate all rays for tracking attacked squares, this should make it fast enough and then check state is instant for evaluation
- Opening book (Kevin will fried liver me)
- Evaluation of checkmates (M1..N) and actually able to checkmate
- Evaluation likes pawn cover for king
  - Maybe this means squares that attack the king are blocked or defended (knight attacks squares are defended against, rays to squares near king are blocked by pawns)
- Disable move ordering in quiescenceSearch
- Cut% is incorrect because v3 visits more nodes than there are moves
- Zobrish hash en passant square
- Evaluation function should be able to detect checkmate + draw, allowing mates to be found one-ply less in the search
- TTable memory is crashing chrome.

## Bug Positions

### `rnbqk1nr/pppp1ppp/8/4p3/1b1P4/8/PPPKPPPP/RNBQ1BNR/ w kQ - 2 3`
King pinned to square behind it, now allowing king to move to square being x-ray attacked by checking piece with *attack moves* scheme

- Store set of squares attacking each square
  - Simplifies updating the square control map: instead of iterating all pieces on the board iterate the pieces/squares attacking move from/to
  - The stored "squares" attacking each square can be attack objects with sliding information, finally eliminating outdated check finding code.
  - The square control map can become a true MoveWithExtraData map containing fully correct pseudo-legal moves including attack data
  - Need fast add+removal, iteration, and len value of the new map values replacing the count map
    - Set?
    - Square-wise sparse array?
    - Another map?
    - Map<Square, Map<Square, MoveWithExtraData>>
    - Am I just storing "Control objects" (now full move data) in two distinct ways for efficiency?
      - Square-wise for source of moves
      - Square-wise for destination of moves
