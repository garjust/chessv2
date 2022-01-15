# chess

- `ai/` Computer implementations, each will rely on a chess engines
- `engines/` Various chess engines. `default` is used by the game workflow
- `lib/` Reusable chess libraries across the whole application and multiple engines
- `ui/` React UI for the chess game
- `workers/` WebWorker scripts for multi-threading
- `workflow/` The workflow which controls the game

## TODO

- King pinned to square behind it, now allowing king to move to square being x-ray attacked by checking piece with attack moves scheme
`rnbqk1nr/pppp1ppp/8/4p3/1b1P4/8/PPPKPPPP/RNBQ1BNR/ w kQ - 2 3`
- Decrease weight of moves to squares attacked by pawns
- Profile attack-based move generation
- Transposition table
- Opening book (Kevin will fried liver me)
- Evaluation of checkmates (M1..N) and actually able to checkmate
- Evaluation likes pawn cover for king
  - Maybe this means squares that attack the king are blocked or defended (knight attacks squares are defended against, rays to squares near king are blocked by pawns)
- Disable move ordering in quiescenceSearch

- PVTable final PV is incorrect
- Enable PVTable lookup for move ordering


On PV Tables
- I am storing them incorrectly
- When a new alpha is set I need to copy the entire PV of the new alpha move into the current depth's PV
- In this sense the PV at max depth is a single move.
  When a new alpha occurs at max depth minus one the new PV is two moves long, and therefore the two moves must be copied over

After a search to depth N I should have the following PV table/matrix:
[a, b, c, ...N]
[a, b, c, ...N-1]
...
[y, z]
[z]

Array at the top of the matrix is the full PV which should be reused for the next iteration
