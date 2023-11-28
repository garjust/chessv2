# chess engine

- `chess/` The chess game
  - `core/` The core chess logic. Supports functionality needed for humans to play a game of chess (move generation, move execution, board state)
  - `engine/` Search engine implementation
    - `algorithms/` Each individual algorithm and configuration
    - `lib/` Supporting code for the search engine
    - `workflow/` Workflow implementing UCI protocol for the search engine
  - `lib/` Reusable chess libraries across the whole application
  - `ui/` React UI for the chess game
    - `workflow/` The workflow which controls the game ui
  - `workers/` Scripts and loading logic for concurrency
- `lib/` Generic library code
- `rx-workflow/` Workflow core library
  - `react/` Integration of the core workflow library with react

## App control

The chess UI is a React application controlled by the UI workflow which embeds a chess core.

A chess engine can be loaded in two ways:
1. The JavaScript engine written here can be loaded in-browser and controlled via UCI
2. Other installed engine binaries that are running on the machine can be connected to via socket and controlled via UCI *TODO*

## TODO

- Pack castling availabiltiy into integer as a first foray into bit packing
  - move execution creates 3 objects for this every move

### Old thoughts

- Decrease weight of moves to squares attacked by pawns
- *Opening book* (Kevin will fried liver me)
- Evaluation like pawn cover for king
  - Maybe this means squares that attack the king are blocked or defended (knight attacks squares are defended against, rays to squares near king are blocked by pawns)
- Disable move ordering in quiescenceSearch
- Cut% is incorrect because v3 visits more nodes than there are moves
- *Zobrish hash en passant square*
- Evaluation function should be able to detect checkmate + draw, allowing mates to be found one-ply less in the search
  - Requires move generation at leaf nodes
- *TTable memory is crashing chrome.*
- *Support UCI*
  - Handle all extra commands to "go"
  - Handle setting hash size
  - Handle stopping search asap
  - Handle sending info
- *ELO the computers*

## Bug Positions
