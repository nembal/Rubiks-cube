import { Vector3 } from 'three';

// Define types for the cube and cubies
export type Cubie = {
  rubikPosition: Vector3; // Position in Rubik's Cube space (-1 to 1)
  originalPosition: Vector3; // Starting position for reference
  // For rendering purposes
  color: {
    right: string;
    left: string;
    top: string;
    bottom: string;
    front: string;
    back: string;
  };
};

export type Face = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
export type Axis = 'x' | 'y' | 'z';

export type CursorPosition = {
  row: number; // 0, 1, or 2
  col: number; // 0, 1, or 2
};

export type CubeState = {
  cubies: Cubie[];
  currentFace: Face;
  cursor: CursorPosition;
  isAnimating: boolean;
  isClockwise: boolean; // Added for rotation direction toggle
  moveHistory: { face: Face, clockwise: boolean }[]; // Track move history
};

class CubeManager {
  private state: CubeState;
  private readonly faceAxisMap: Record<Face, Axis> = {
    front: 'z',
    back: 'z',
    left: 'x',
    right: 'x',
    top: 'y',
    bottom: 'y',
  };
  
  private readonly faceValueMap: Record<Face, number> = {
    front: 1,
    back: -1,
    left: -1,
    right: 1,
    top: 1,
    bottom: -1,
  };

  constructor() {
    this.state = {
      cubies: this.initializeCubies(),
      currentFace: 'front',
      cursor: { row: 1, col: 1 }, // Start at center of front face
      isAnimating: false,
      isClockwise: true, // Default to clockwise rotation
      moveHistory: [], // Initialize empty move history
    };
  }

  private initializeCubies(): Cubie[] {
    const cubies: Cubie[] = [];
    // Colors for the solved cube
    const defaultColors = {
      right: 'red',
      left: 'orange',
      top: 'white',
      bottom: 'yellow',
      front: 'green',
      back: 'blue',
    };

    // Create all 26 cubies (excluding center piece)
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // Skip the center piece
          if (x === 0 && y === 0 && z === 0) continue;
          
          // Create a cubie with default colors
          const cubie: Cubie = {
            rubikPosition: new Vector3(x, y, z),
            originalPosition: new Vector3(x, y, z),
            color: {
              right: x === 1 ? defaultColors.right : 'black', 
              left: x === -1 ? defaultColors.left : 'black',
              top: y === 1 ? defaultColors.top : 'black',
              bottom: y === -1 ? defaultColors.bottom : 'black',
              front: z === 1 ? defaultColors.front : 'black',
              back: z === -1 ? defaultColors.back : 'black',
            },
          };
          
          cubies.push(cubie);
        }
      }
    }
    
    return cubies;
  }

  // Get the current state
  getState(): CubeState {
    return { ...this.state };
  }

  // Get all cubies
  getCubies(): Cubie[] {
    return [...this.state.cubies];
  }

  // Get cubie at specific position
  getCubieAt(x: number, y: number, z: number): Cubie | undefined {
    return this.state.cubies.find(cubie => 
      Math.abs(cubie.rubikPosition.x - x) < 0.1 && 
      Math.abs(cubie.rubikPosition.y - y) < 0.1 && 
      Math.abs(cubie.rubikPosition.z - z) < 0.1
    );
  }

  // Get the currently selected cubie based on cursor position and current face
  getSelectedCubie(): Cubie | undefined {
    const { cursor, currentFace } = this.state;
    const { row, col } = cursor;
    
    // Map the 2D cursor position to 3D based on the current face
    let x = 0, y = 0, z = 0;
    
    switch (currentFace) {
      case 'front': // z = 1
        x = col - 1;
        y = 1 - row;
        z = 1;
        break;
      case 'back': // z = -1
        x = 1 - col;
        y = 1 - row;
        z = -1;
        break;
      case 'left': // x = -1
        x = -1;
        y = 1 - row;
        z = col - 1;
        break;
      case 'right': // x = 1
        x = 1;
        y = 1 - row;
        z = 1 - col;
        break;
      case 'top': // y = 1
        x = col - 1;
        y = 1;
        z = 1 - row;
        break;
      case 'bottom': // y = -1
        x = col - 1;
        y = -1;
        z = row - 1;
        break;
    }
    
    return this.getCubieAt(x, y, z);
  }

  // Update cursor position
  moveCursor(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (this.state.isAnimating) return;
    
    const { cursor } = this.state;
    let { row, col } = cursor;
    
    switch (direction) {
      case 'up':
        row = Math.max(0, row - 1);
        break;
      case 'down':
        row = Math.min(2, row + 1);
        break;
      case 'left':
        col = Math.max(0, col - 1);
        break;
      case 'right':
        col = Math.min(2, col + 1);
        break;
    }
    
    this.state.cursor = { row, col };
  }
  
  // Set cursor position directly
  setCursorPosition(row: number, col: number): void {
    if (this.state.isAnimating) return;
    
    // Ensure values are within bounds
    row = Math.max(0, Math.min(2, row));
    col = Math.max(0, Math.min(2, col));
    
    this.state.cursor = { row, col };
  }

  // Switch to the next face
  switchFace(): void {
    if (this.state.isAnimating) return;
    
    const faceOrder: Face[] = ['front', 'right', 'back', 'left', 'top', 'bottom'];
    const currentIndex = faceOrder.indexOf(this.state.currentFace);
    const nextIndex = (currentIndex + 1) % faceOrder.length;
    
    this.state.currentFace = faceOrder[nextIndex];
    // Reset cursor to center of new face
    this.state.cursor = { row: 1, col: 1 };
  }

  // Get the cubies in a specific layer
  getCubiesInLayer(axis: Axis, value: number): Cubie[] {
    return this.state.cubies.filter(cubie => {
      const pos = cubie.rubikPosition;
      switch (axis) {
        case 'x': return Math.abs(pos.x - value) < 0.1;
        case 'y': return Math.abs(pos.y - value) < 0.1;
        case 'z': return Math.abs(pos.z - value) < 0.1;
      }
    });
  }

  // Toggle rotation direction
  toggleRotationDirection(): void {
    this.state.isClockwise = !this.state.isClockwise;
  }

  // Get current rotation direction
  isClockwise(): boolean {
    return this.state.isClockwise;
  }

  // Get move history
  getMoveHistory(): { face: Face, clockwise: boolean }[] {
    return [...this.state.moveHistory];
  }

  // Add move to history
  addMoveToHistory(face: Face, clockwise: boolean): void {
    this.state.moveHistory.push({ face, clockwise });
  }

  // Reset move history
  resetMoveHistory(): void {
    this.state.moveHistory = [];
  }
  
  // Get the last move from history
  getLastMove(): { face: Face, clockwise: boolean } | null {
    if (this.state.moveHistory.length === 0) return null;
    return this.state.moveHistory[this.state.moveHistory.length - 1];
  }
  
  // Undo the last move
  undoLastMove(): { success: boolean, layer: Cubie[], axis: Axis, value: number, direction: number, face: Face } | { success: boolean } {
    if (this.state.isAnimating || this.state.moveHistory.length === 0) return { success: false };
    
    // Get the last move
    const lastMove = this.state.moveHistory.pop();
    if (!lastMove) return { success: false };
    
    // Get the axis and value for the given face
    const axis = this.faceAxisMap[lastMove.face];
    const value = this.faceValueMap[lastMove.face];
    
    // Apply the inverse rotation (flip the clockwise direction)
    const direction = lastMove.clockwise ? -1 : 1;
    
    // Return the layer info for animation
    const layer = this.getCubiesInLayer(axis, value);
    this.state.isAnimating = true;
    
    return { success: true, layer, axis, value, direction, face: lastMove.face };
  }

  // Twist a layer of the cube with updated signature to record the move
  twistLayer(axis: Axis, value: number, direction: 1 | -1, face?: Face): { layer: Cubie[], axis: Axis, direction: 1 | -1 } {
    if (this.state.isAnimating) return { layer: [], axis, direction };
    
    this.state.isAnimating = true;
    
    // The actual rotation happens in AnimationController
    // Here we just mark which layer is being twisted
    const layer = this.getCubiesInLayer(axis, value);
    
    // Record the move in history if a face is provided
    if (face) {
      const isClockwise = direction === 1;
      this.addMoveToHistory(face, isClockwise);
    }
    
    // Return the layer and set isAnimating to true for animation handling
    return { layer, axis, direction };
  }

  // Update cubie positions after a twist
  updateCubiePositions(cubies: Cubie[], axis: Axis, angle: number): void {
    const sinAngle = Math.sin(angle);
    const cosAngle = Math.cos(angle);
    
    cubies.forEach(cubie => {
      const pos = cubie.rubikPosition.clone();
      
      switch (axis) {
        case 'x':
          // Rotate around x-axis
          const newY = pos.y * cosAngle - pos.z * sinAngle;
          const newZ = pos.y * sinAngle + pos.z * cosAngle;
          cubie.rubikPosition.set(pos.x, Math.round(newY), Math.round(newZ));
          break;
        case 'y':
          // Rotate around y-axis
          const newX = pos.x * cosAngle + pos.z * sinAngle;
          const newZy = -pos.x * sinAngle + pos.z * cosAngle;
          cubie.rubikPosition.set(Math.round(newX), pos.y, Math.round(newZy));
          break;
        case 'z':
          // Rotate around z-axis
          const newXz = pos.x * cosAngle - pos.y * sinAngle;
          const newYz = pos.x * sinAngle + pos.y * cosAngle;
          cubie.rubikPosition.set(Math.round(newXz), Math.round(newYz), pos.z);
          break;
      }
    });
  }

  // Set animation status
  setAnimating(isAnimating: boolean): void {
    this.state.isAnimating = isAnimating;
  }

  // Check if the cube is solved
  isSolved(): boolean {
    // Check each face to see if all cubies on that face have the same color
    const faces: Face[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];
    
    for (const face of faces) {
      const axis = this.faceAxisMap[face];
      const value = this.faceValueMap[face];
      
      // Get all cubies on this face
      const faceCubies = this.getCubiesInLayer(axis, value);
      
      // Get the color we expect for this face
      let expectedColor = '';
      switch (face) {
        case 'front': expectedColor = faceCubies[0]?.color.front || ''; break;
        case 'back': expectedColor = faceCubies[0]?.color.back || ''; break;
        case 'left': expectedColor = faceCubies[0]?.color.left || ''; break;
        case 'right': expectedColor = faceCubies[0]?.color.right || ''; break;
        case 'top': expectedColor = faceCubies[0]?.color.top || ''; break;
        case 'bottom': expectedColor = faceCubies[0]?.color.bottom || ''; break;
      }
      
      // Check if all cubies on this face have the same color
      for (const cubie of faceCubies) {
        let color = '';
        switch (face) {
          case 'front': color = cubie.color.front; break;
          case 'back': color = cubie.color.back; break;
          case 'left': color = cubie.color.left; break;
          case 'right': color = cubie.color.right; break;
          case 'top': color = cubie.color.top; break;
          case 'bottom': color = cubie.color.bottom; break;
        }
        
        // If any cubie has a different color, the cube is not solved
        if (color !== expectedColor) {
          return false;
        }
      }
    }
    
    // If we get here, all faces have cubies with the same color
    return true;
  }

  // Reset the cube to its solved state
  resetCube(): void {
    this.state.cubies = this.initializeCubies();
    this.resetMoveHistory();
    this.state.isAnimating = false;
  }

  // Shuffle the cube with a specified number of random moves
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shuffleCube(_moveCount: number = 25): void {
    if (this.state.isAnimating) return;
    
    // Reset the cube first to ensure we start from a solved state
    this.resetCube();
    
    // We'll implement the actual shuffle in the AnimationController
    // So we just mark that a shuffle is needed
    return;
  }
}

export default CubeManager; 