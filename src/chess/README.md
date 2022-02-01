# chess engine

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
- *Opening book* (Kevin will fried liver me)
- Evaluation likes pawn cover for king
  - Maybe this means squares that attack the king are blocked or defended (knight attacks squares are defended against, rays to squares near king are blocked by pawns)
- Disable move ordering in quiescenceSearch
- Cut% is incorrect because v3 visits more nodes than there are moves
- *Zobrish hash en passant square*
- Evaluation function should be able to detect checkmate + draw, allowing mates to be found one-ply less in the search
  - Requires move generation at leaf nodes
- *TTable memory is crashing chrome.*
- *Support common chess computer API*
- *ELO the computers*

## Bug Positions
