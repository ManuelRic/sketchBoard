# Plane whiteboard

A dependency-free web whiteboard. Source lives in `dist/`; no build step is required.

Run `npm run dev`, then open the printed local address. Run `npm run check` for syntax checks and the board-model tests.

## Controls

- **V** select and move objects. **H**, Space + drag, or middle mouse drag pans.
- **T** then click creates editable text. Double-click existing text to edit it. Ctrl/Command + Enter finishes; Escape cancels the edit.
- **I** imports images. Images can also be dropped or pasted onto the canvas.
- **A** then click two objects creates an attached arrow. Drag across empty space for a free arrow. Select an arrow and drag its endpoints to attach or detach them.
- **P** opens drawing controls. Choose Pencil, Ink pen, Ink brush, or Fountain pen, then set a palette/custom color, width, and smoothing (0–100%). Ink brush supports stylus pressure and simulated variation from mouse speed. Fountain pen uses an angled nib. Drawing controls can also change a selected existing drawing; raw samples are preserved for reversible smoothing. A tap creates a dot.
- Use the four edge **+** buttons to add space in any direction. Each click adds a strip and moves the view into it; existing object coordinates remain unchanged.
- Scroll pans; Ctrl/Command + scroll zooms. Shift + 1 fits the canvas.
- Delete removes the selection. Ctrl/Command + D duplicates it. Ctrl/Command + Z undoes; Ctrl/Command + Shift + Z redoes.
- Layers can be created, renamed, hidden, locked, deleted, and reordered. Drag object rows to reorder them or move them between unlocked, visible layers.

## Current scope

Boards live in page memory. Reloading or closing the page clears the board. This version has no saved boards, accounts, or collaboration. Imported images are kept in the browser, not uploaded to a server. The published site itself is private.

## Validation

Syntax checks and board-model tests cover coordinate preservation during expansion, connector movement, layer visibility and locking, dependent deletion, and undo/redo. Local HTTP entrypoint and assets are checked. Browser interaction and visual QA were not requested and have not been performed.

Optional feature-detected WebMCP tools (`read_board`, `add_texts`, `expand_canvas`, `connect_objects`) share the editor state and mutations. No supported WebMCP validation context was available in this task; those tool registrations and calls remain unverified.
