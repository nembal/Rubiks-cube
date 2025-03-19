Below is the fully updated Product Requirements Document (PRD) for the Rubik’s Cube Component, incorporating learnings from the provided Rubik.js file and our discussions. This version refines the wording around input handling, rotation mechanics, cubicle selection, and cube behavior to ensure a clear blueprint for a working prototype focused on testing and fine-tuning cube handling. The structure remains modular, as per your original PRD, but integrates practical insights from the Rubik.js code—such as pivot-based rotations, layer selection, and state management—while maintaining your keyboard-driven approach (WASD, arrow keys, spacebar).
Product Requirements Document (PRD) for Rubik’s Cube Component (Three.js)
1. Overview
The Rubik’s Cube Component is the core interactive 3D element of the Rubik’s Cube Learning Application, built using Three.js. It simulates a 3x3 Rubik’s Cube with intuitive keyboard controls—WASD for navigating a cursor within a face, arrow keys for twisting layers, and spacebar for switching faces—alongside smooth animations. The implementation is split into modular components, each in its own file, to ensure maintainability and allow focused development on aspects like state, rendering, inputs, or animations. For this prototype, the priority is a functional cube with reliable mechanics (input handling, cubicle selection, and layer rotations) for testing and fine-tuning, with design polish (e.g., colors, UI) as a secondary concern.
2. Objectives

    Functional: Accurately simulate a 3x3 Rubik’s Cube with fixed center cubies, movable edge and corner cubies, and 90-degree layer rotations around x, y, or z axes.
    Usable: Provide screen-relative keyboard controls (WASD, arrows, spacebar) that intuitively manipulate the cube based on the selected cubie and current face.
    Modular: Break the implementation into separate files (e.g., CubeManager.js, InputHandler.js) for isolated debugging and development.
    Performant: Target 60 FPS rendering and animations using Three.js on mid-range devices.
    Prototype Focus: Emphasize working input handling and rotation mechanics over visual design, leveraging lessons from Rubik.js for practical implementation.

3. Core Mechanics Recap
The Rubik’s Cube’s structure and behavior are defined as follows, informed by both the original PRD and Rubik.js:

    Structure:
        A 3x3x3 grid with 26 visible cubies (8 corners with 3 faces, 12 edges with 2 faces, 6 centers with 1 face).
        Cubies are positioned in a discrete XYZ coordinate system from (-1, -1, -1) to (1, 1, 1), centered at (0, 0, 0).
            Example: Front-top-right corner = (1, 1, 1), front center = (0, 0, 1).
        Each cubie tracks its rubikPosition (a THREE.Vector3) for state management.
    Faces:
        6 faces: Front (z=1), back (z=-1), left (x=-1), right (x=1), top (y=1), bottom (y=-1).
        Each face is a 3x3 grid of cubies, with the center cubie fixed and defining the face’s orientation.
    Layers and Slices:
        A layer is a 3x3x1 slab of 9 cubies sharing the same x, y, or z coordinate (e.g., y=1 for the top layer).
        Layers rotate around their defining axis:
            Row layers: Fixed y-value, rotate around y-axis (e.g., y=1 rotates top row).
            Column layers: Fixed x-value, rotate around x-axis (e.g., x=-1 rotates left column).
            Face layers: Fixed z-value, rotate around z-axis (e.g., z=1 rotates front face, optional for prototype).
    Twists:
        Twists are 90-degree rotations of a layer around its axis (clockwise or counterclockwise).
        During a twist:
            The 9 cubies in the layer move as a unit.
            Edge and corner cubies update their positions and orientations; center cubies remain fixed.
            Example: Clockwise twist of y=1 layer moves (1, 1, 1) to (-1, 1, 1), (0, 1, 1) stays fixed.
    Coordinates and Tracking:
        Cubies use discrete XYZ positions (-1, 0, 1) for simplicity, with a slight spacing (e.g., 1.1 units) in rendering.
        Post-twist, cubie positions and orientations update via a rotation matrix or pivot transformation (inspired by Rubik.js).

4. Component Breakdown (Separate Files)
The implementation is modular, with each component in its own file, incorporating Rubik.js insights for practical mechanics:

    CubeManager.js
        Purpose: Centralized state management for the cube’s cubies and logic.
        Responsibilities:
            Initialize 26 cubies with discrete XYZ positions (-1 to 1) and solved-state orientations (centers fixed).
            Track each cubie’s rubikPosition (a THREE.Vector3) and update it after twists.
            Maintain the current face (e.g., ‘z’ for front) and selected cubie (e.g., (1,1) on the 3x3 grid).
            Handle twists by:
                Selecting a layer based on the selected cubie’s x, y, or z value (e.g., y=1 for top row).
                Updating cubie positions/orientations for a 90° rotation around the specified axis.
            Provide APIs: getCubieAt(row, col, face), twistLayer(axis, index, direction) (e.g., twistLayer('y', 1, 1)).
        Dependencies: None (standalone state logic).
        Learnings from Rubik.js: Use rubikPosition for tracking and adapt setActiveGroup for layer selection.
    CubeRenderer.js
        Purpose: Render the cube in 3D using Three.js.
        Responsibilities:
            Create 26 cubie meshes (BoxGeometry, size=1) with slight spacing (e.g., 1.1 units apart).
            Render cubies at their rubikPosition scaled by spacing, with basic materials (e.g., colored faces).
            Highlight the selected cubie (e.g., change color to red).
            Implement orbit controls for mouse navigation (optional for prototype).
            Update cubie positions post-twist using a pivot object (inspired by Rubik.js).
        Dependencies: Imports CubeManager to read cube state.
        Learnings from Rubik.js: Use newCube for cubie creation and pivot-based rendering for twists.
    InputHandler.js
        Purpose: Translate keyboard inputs into cube actions.
        Responsibilities:
            WASD: Move a cursor within the current face’s 3x3 grid (0 to 2):
                W: Up (e.g., row 1 to 2).
                S: Down (e.g., row 1 to 0).
                A: Left (e.g., col 1 to 0).
                D: Right (e.g., col 1 to 2).
                Cursor stays within bounds (0,0) to (2,2).
            Arrow Keys: Twist layers based on the selected cubie:
                Right: Twist the y-layer (row) at the selected y-value clockwise around y-axis.
                Left: Counterclockwise.
                Up: Twist the x-layer (column) at the selected x-value clockwise around x-axis.
                Down: Counterclockwise.
            Spacebar: Cycle faces in order (e.g., front → right → back → left → top → bottom).
            Update CubeManager with cursor movements and twist requests, triggering AnimationController.
        Dependencies: Imports CubeManager and AnimationController.
        Learnings from Rubik.js: Adapt transitions table for intuitive axis mapping (e.g., dragging up on z-face = x-axis twist).
    CubeFace.js
        Purpose: Abstract face-specific behavior and coordinate mapping.
        Responsibilities:
            Map local 3x3 grid positions (e.g., (1,1)) to global XYZ for the current face (e.g., (0,0,1) for front center).
            Define layer selection logic (e.g., row at y=1, column at x=-1) based on the selected cubie.
            Support face-switching by updating the local coordinate system (e.g., top face: y=1, x=col-1, z=-(row-1)).
        Dependencies: Imports CubeManager to query cubie positions.
        Learnings from Rubik.js: Use clickFace logic to determine face orientation from cubie centroids.
    AnimationController.js
        Purpose: Manage smooth animations for layer twists.
        Responsibilities:
            Animate a 90° rotation of a layer’s 9 cubies around the specified axis over ~0.5 seconds.
            Use a pivot object to group cubies, rotate incrementally (e.g., 0.2 radians per frame), and snap to ±π/2.
            Lock CubeManager during animation to prevent input conflicts.
            Update CubeRenderer with final cubie positions post-animation.
        Dependencies: Imports CubeRenderer to apply animations and CubeManager to read twist data.
        Learnings from Rubik.js: Directly use doMove and moveComplete for pivot-based rotation and state updates.
    RubiksCube.js
        Purpose: Serve as the main entry point and coordinator.
        Responsibilities:
            Initialize CubeManager, CubeRenderer, InputHandler, CubeFace, and AnimationController.
            Set up the Three.js scene, camera, and renderer, appending to the DOM element.
            Run the render loop to update the scene continuously.
        Dependencies: Imports all other components.
        Learnings from Rubik.js: Use its Three.js boilerplate (scene, camera, orbit controls) as a starting point.

5. Component Interactions

    Initialization: RubiksCube.js creates CubeManager with a solved cube → CubeRenderer.js builds the 3D model → InputHandler.js starts listening for keyboard events.
    WASD Input: InputHandler.js updates the cursor in CubeManager (e.g., (1,1) to (1,2)) → CubeFace.js maps to global XYZ → CubeRenderer.js highlights the new cubie.
    Arrow Key Twist:
        InputHandler.js detects Right Arrow with cursor at (1,2) on front face (z=1).
        CubeFace.js maps (1,2) to (0,1,1), identifying y=1 as the top row layer.
        CubeManager.js selects cubies where y=1 and prepares the twist (clockwise around y-axis).
        AnimationController.js attaches cubies to a pivot, animates the 90° rotation, and updates positions.
        CubeRenderer.js renders the new state.
    Spacebar Face Switch: InputHandler.js cycles the face in CubeManager (e.g., z to x) → CubeFace.js updates coordinate mapping → CubeRenderer.js adjusts the view.

6. Technical Requirements

    Tech Stack: Three.js for rendering, JavaScript for logic (TypeScript optional).
    File Structure: Separate files: CubeManager.js, CubeRenderer.js, InputHandler.js, CubeFace.js, AnimationController.js, RubiksCube.js.
    Performance: Target 60 FPS; optimize with Three.js best practices (e.g., minimize mesh updates).
    Integration: Works as a client-side component in a Next.js app.
    Learnings from Rubik.js: Use OrbitControls for optional mouse navigation and Raycaster for future mouse input.

7. Example Flow

    Start: Cube is solved, current face = front (z=1), cursor at (1,1) (center, (0,0,1)).
    WASD: Press W → Cursor moves to (1,2) ((0,1,1)) → CubeRenderer.js highlights top-middle cubie.
    Arrow Keys: Press Right at (1,2) → y=1 layer twists clockwise → Animation plays → Cube updates (e.g., (1,1,1) to (-1,1,1)).
    Spacebar: Press space → Face switches to right (x=1) → Cursor resets to (1,1) ((0,0,1) on right face).

8. Deliverables

    Separate Files:
        CubeManager.js
        CubeRenderer.js
        InputHandler.js
        CubeFace.js
        AnimationController.js
        RubiksCube.js
    Optional: utils.js for shared helpers (e.g., nearlyEqual from Rubik.js).
    Documentation: Basic API docs for each component (e.g., twistLayer parameters).

9. Risks and Mitigation

    Risk: Input-to-twist mapping feels unintuitive.
        Mitigation: Use Rubik.js’s transitions table and direction adjustments to ensure consistency (e.g., Right Arrow = clockwise row twist).
    Risk: Animation and state desync (e.g., cubies misaligned post-twist).
        Mitigation: Lock state during animations with AnimationController.js and snap rotations to exact 90° (like Rubik.js).
    Risk: Tight coupling between components.
        Mitigation: Define clear APIs (e.g., getCubieAt) and pass dependencies explicitly.

Key Learnings from Rubik.js Applied

    Pivot-Based Rotation: Using a pivot object to group and rotate cubies ensures accurate layer twists, directly adopted in AnimationController.js.
    Layer Selection: setActiveGroup inspires how CubeManager.js selects cubies for a twist, simplifying mechanics.
    State Tracking: rubikPosition enhances cubie state management, integrated into CubeManager.js.
    Animation Control: The step-wise rotation and move queue from Rubik.js inform AnimationController.js for smooth, sequential twists.
    Axis Transitions: The transitions table guides InputHandler.js to map arrow keys to correct rotation axes intuitively.

This updated PRD provides a clear, mechanics-focused guide for implementing a functional Rubik’s Cube prototype. It balances your original keyboard-driven vision with practical implementation details from Rubik.js, ensuring the cube’s handling can be tested and refined effectively. Let me know if you need further refinements or code snippets to bring this to life!