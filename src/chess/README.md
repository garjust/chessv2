# chess engine

- `chess/` The chess game
  - `core/` The core chess logic. Supports functionality needed for humans to play a game of chess (move generation, move execution, board state)
    - `lookup/` Precomputed data available for lookup
  - `engine/` Search engine implementation
    - `algorithms/` Each individual algorithm and configuration
    - `lib/` Supporting code for the search engine
    - `workflow/` Workflow implementing UCI protocol for the search engine
  - `lib/` Reusable chess libraries across the whole application
    `zobrist/` Interface and implementation of zobrist numbers
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

- Using WASM means getting into TypedArrays. What if I just implmenet a HashMap
  for the TTable by hand backed by a block of memory via TypedArray? This could be as fast as WASM (faster?).
    - How is concurrency impacted if trying to make a concurrent safe TTable?
  - Keys into the map are going to be 32bits or less because of memory. Therefore I just need a hashing function to convert the key tuple [32bit, 32bit] into a single 32bit number
  - Indeed the current WASM TTable is using a std collection HashMap which is likely really poor (it grows and stuff)
  1. Work on the TTable entry representation getting it packed into bits the way
  it needs to be for the WASM TTable. Then getting an entry that can go into WASM will be the same as getting an entry into a homerolled TypedArray.
  2. Implement a hashing function for the key tuple given a memory size.
  3. Combine and profit.

- Return beta when doing a cut in queisence search?


### Old thoughts

- Decrease weight of moves to squares attacked by pawns
- *Opening book* (Kevin will fried liver me)
- Evaluation like pawn cover for king
  - Maybe this means squares that attack the king are blocked or defended (knight attacks squares are defended against, rays to squares near king are blocked by pawns)
- Disable move ordering in quiescenceSearch
- Cut% is incorrect because v3 visits more nodes than there are moves
- Evaluation function should be able to detect checkmate + draw, allowing mates to be found one-ply less in the search
  - Requires move generation at leaf nodes
- *Support UCI*
  - Handle setting hash size
  - Handle stopping search asap

## Bug Positions
