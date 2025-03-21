# Rubik’s Cube App Upgrade Guide

This guide outlines a detailed plan to upgrade your existing Rubik’s Cube application. It includes a new interaction model for desktop and mobile, state management, and features like a random shuffle button, timer, and clue system. Additionally, it provides a roadmap to level up your app by supporting larger cube sizes (3x3, 4x4, 5x5), adding visual highlights and effects, and introducing customizable themes. The steps are designed to integrate seamlessly with your current modular codebase, allowing you to build and test incrementally.

---

## Table of Contents

- [Interaction Model](#interaction-model)  
  - [Desktop Controls](#desktop-controls)  
  - [Mobile Controls](#mobile-controls)  
  - [Visual Feedback](#visual-feedback)  
- [State Management](#state-management)  
- [Feature Implementation](#feature-implementation)  
  - [Random Shuffle Button](#random-shuffle-button)  
  - [Timer](#timer)  
  - [Clue (Help Me) Feature](#clue-help-me-feature)  
- [Development Steps](#development-steps)  
- [Plan to Level Up Your Cube](#plan-to-level-up-your-cube)  
  - [Support for Larger Cubes (3x3, 4x4, 5x5)](#support-for-larger-cubes-3x3-4x4-5x5)  
  - [Add Highlights and Effects](#add-highlights-and-effects)  
  - [Introduce Visual Themes](#introduce-visual-themes)  
  - [Upgrade Input Handling](#upgrade-input-handling)  
  - [Performance Optimization](#performance-optimization)  

---

## Interaction Model

### Desktop Controls

- `W` Key: Rotate the up face (U) clockwise by default.  
- `A` Key: Rotate the left face (L) clockwise by default.  
- `S` Key: Rotate the down face (D) clockwise by default.  
- `D` Key: Rotate the right face (R) clockwise by default.  
- `E` Key: Rotate the front face (F) clockwise by default.  
- `Spacebar`: Toggle rotation direction for all keys.  
- **Mouse Drag**: Drag to rotate the front face. Right/up for clockwise, left/down for counterclockwise. Snaps to 90°.

### Mobile Controls

- Tap above cube: Rotate U face clockwise.  
- Tap left/right/below cube: Rotate L, R, D faces.  
- Drag on cube: Rotate F face. Direction based on drag gesture.  
- Double-tap: Toggle rotation direction.

### Visual Feedback

- **Direction Indicator**: Small arrow near cube showing current rotation direction.  
- **Face Highlight**: Brief visual cue (flash or opacity change) on rotated face.

---

## State Management

- **Cube State**: Track cubicle positions and colors in a 3x3x3 grid.  
- **Move History**: Store all face rotations and directions.  
- **Direction State**: `isClockwise` variable (default: `true`), toggled via spacebar or double-tap.

---

## Feature Implementation

### Random Shuffle Button

- **Function**: Button labeled "Shuffle" that applies 20–30 random moves.  
- **Behavior**: Resets and starts the timer.

### Timer

- **Start**: On first user move after shuffling.  
- **Stop**: When cube is solved.  
- **Display**: Minutes and seconds (e.g., `02:34`).

### Clue (Help Me) Feature

- **Function**: Button labeled "Clue" that suggests the next move.  
- **Output**: Text like `"Rotate U clockwise"`.  
- **Logic**: Analyzes cube state and move history.

---

## Development Steps

1. **Set Up the Project**
   - Ensure modular structure (e.g., `CubeManager.tsx`, `CubeRenderer.tsx`) is working.
   - Position cube centrally with room for UI.

2. **Implement State Management**
   - Define a 3D grid in `CubeManager.tsx`.
   - Add move history list.
   - Initialize `isClockwise`.

3. **Add Desktop Controls**
   - Map `W`, `A`, `S`, `D`, `E` using `isClockwise`.
   - Toggle direction with `Spacebar`.
   - Implement mouse drag for rotating F.

4. **Add Mobile Controls**
   - Define tap zones around cube.
   - Use `isClockwise` for direction.
   - Add drag and double-tap logic.

5. **Create Visual Feedback**
   - Add arrow icon near cube to show direction.
   - Highlight face on each rotation.

6. **Build the Random Shuffle Button**
   - Create "Shuffle" button.
   - Apply 20–30 random moves and reset timer.

7. **Implement the Timer**
   - Display near cube.
   - Start on first move, stop on solve.
   - Show minutes/seconds in real-time.

8. **Develop the Clue Feature**
   - Add "Clue" button.
   - Suggest next move based on state + history.

9. **Test and Polish**
   - Verify desktop/mobile responsiveness.
   - Test all features.
   - Fine-tune UI/UX and visual cues.

---

## Plan to Level Up Your Cube

### Support for Larger Cubes (3x3, 4x4, 5x5)

- In `CubeManager.tsx`:  
  - Use a `cubeSize` variable.  
  - Initialize grid dynamically.

- In `CubeRenderer.tsx`:  
  - Adjust rendering to reflect `cubeSize`.

- In `AnimationController.tsx`:  
  - Generalize twist logic to handle middle layers.

### Add Highlights and Effects

- In `CubeRenderer.tsx`:  
  - Add glow/outline highlights.  
  - Optionally use post-processing effects (bloom, neon).  
  - Start with simple color effects first.

### Introduce Visual Themes

- Create `ThemeManager.tsx`:  
  - Define themes (e.g., "standard", "neon").  
  - Add UI for theme switching.

- In `CubeRenderer.tsx`:  
  - Apply new materials on theme change.

### Upgrade Input Handling

- In `InputHandler.tsx`:  
  - Add mouse-based rotation (e.g., drag specific faces).  
  - Ensure input logic works across cube sizes.  
  - Test edge cases like multi-layer rotations.

### Performance Optimization

- For 4x4 and 5x5 cubes:  
  - Use instanced meshes in `CubeRenderer.tsx`.  
  - Streamline animations in `AnimationController.tsx`.

- General Tips:  
  - Use browser dev tools to profile performance.  
  - Prioritize mobile optimization.

---

## Final Notes

This guide is designed to work with your existing modular codebase, allowing you to enhance your Rubik’s Cube app step-by-step. Start with core features (shuffle, timer, clue), then expand to larger cubes, visual polish, and performance. Each section is modular and incremental to help you build confidently and maintain stability throughout.

Happy coding! 🎉
