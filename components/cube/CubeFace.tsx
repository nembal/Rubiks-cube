import { Vector3 } from 'three';
import CubeManager, { Face, Axis } from './CubeManager';

class CubeFace {
  private cubeManager: CubeManager;
  
  constructor(cubeManager: CubeManager) {
    this.cubeManager = cubeManager;
  }
  
  // Map local grid position (row, col) to global XYZ for the current face
  mapGridToWorld(row: number, col: number, face: Face): Vector3 {
    let x = 0, y = 0, z = 0;
    
    switch (face) {
      case 'front': // z = 1
        x = col - 1;   // -1, 0, 1 for col = 0, 1, 2
        y = 1 - row;   // 1, 0, -1 for row = 0, 1, 2
        z = 1;
        break;
      case 'back': // z = -1
        x = 1 - col;   // 1, 0, -1 for col = 0, 1, 2
        y = 1 - row;   // 1, 0, -1 for row = 0, 1, 2
        z = -1;
        break;
      case 'left': // x = -1
        x = -1;
        y = 1 - row;   // 1, 0, -1 for row = 0, 1, 2
        z = col - 1;   // -1, 0, 1 for col = 0, 1, 2
        break;
      case 'right': // x = 1
        x = 1;
        y = 1 - row;   // 1, 0, -1 for row = 0, 1, 2
        z = 1 - col;   // 1, 0, -1 for col = 0, 1, 2
        break;
      case 'top': // y = 1
        x = col - 1;   // -1, 0, 1 for col = 0, 1, 2
        y = 1;
        z = 1 - row;   // 1, 0, -1 for row = 0, 1, 2
        break;
      case 'bottom': // y = -1
        x = col - 1;   // -1, 0, 1 for col = 0, 1, 2
        y = -1;
        z = row - 1;   // -1, 0, 1 for row = 0, 1, 2
        break;
    }
    
    return new Vector3(x, y, z);
  }
  
  // Get the axis for the current face
  getFaceAxis(face: Face): Axis {
    switch (face) {
      case 'front':
      case 'back':
        return 'z';
      case 'left':
      case 'right':
        return 'x';
      case 'top':
      case 'bottom':
        return 'y';
    }
  }
  
  // Get the value for the current face
  getFaceValue(face: Face): number {
    switch (face) {
      case 'front':
      case 'right':
      case 'top':
        return 1;
      case 'back':
      case 'left':
      case 'bottom':
        return -1;
    }
  }
  
  // Map a rotation axis based on the current face and arrow key
  // This is used to determine which layer to rotate when an arrow key is pressed
  mapArrowToRotation(arrow: 'up' | 'down' | 'left' | 'right', face: Face): { axis: Axis, direction: 1 | -1 } {
    // This mapping uses a "screen-relative" approach - arrow directions are relative to the visible face
    switch (face) {
      case 'front':
        switch (arrow) {
          case 'up': return { axis: 'x', direction: 1 };     // Rotate column up (clockwise around x-axis)
          case 'down': return { axis: 'x', direction: -1 };  // Rotate column down (counter-clockwise around x-axis)
          case 'left': return { axis: 'y', direction: -1 };  // Rotate row left (counter-clockwise around y-axis)
          case 'right': return { axis: 'y', direction: 1 };  // Rotate row right (clockwise around y-axis)
        }
        break;
      case 'back':
        switch (arrow) {
          case 'up': return { axis: 'x', direction: -1 };
          case 'down': return { axis: 'x', direction: 1 };
          case 'left': return { axis: 'y', direction: 1 };
          case 'right': return { axis: 'y', direction: -1 };
        }
        break;
      case 'left':
        switch (arrow) {
          case 'up': return { axis: 'z', direction: -1 };
          case 'down': return { axis: 'z', direction: 1 };
          case 'left': return { axis: 'y', direction: -1 };
          case 'right': return { axis: 'y', direction: 1 };
        }
        break;
      case 'right':
        switch (arrow) {
          case 'up': return { axis: 'z', direction: 1 };
          case 'down': return { axis: 'z', direction: -1 };
          case 'left': return { axis: 'y', direction: -1 };
          case 'right': return { axis: 'y', direction: 1 };
        }
        break;
      case 'top':
        switch (arrow) {
          case 'up': return { axis: 'z', direction: -1 };
          case 'down': return { axis: 'z', direction: 1 };
          case 'left': return { axis: 'x', direction: -1 };
          case 'right': return { axis: 'x', direction: 1 };
        }
        break;
      case 'bottom':
        switch (arrow) {
          case 'up': return { axis: 'z', direction: 1 };
          case 'down': return { axis: 'z', direction: -1 };
          case 'left': return { axis: 'x', direction: -1 };
          case 'right': return { axis: 'x', direction: 1 };
        }
        break;
    }
    
    // Default fallback if somehow we get an unexpected combination
    return { axis: 'y', direction: 1 };
  }
  
  // Get the layer value (coordinate) for the current cursor and face
  getLayerValue(arrow: 'up' | 'down' | 'left' | 'right', cursorRow: number, cursorCol: number, face: Face): number {
    // We determine which layer to rotate based on the cursor position and the face
    const { axis } = this.mapArrowToRotation(arrow, face);
    
    // Map from cursor position to the layer value based on the face and rotation axis
    switch (face) {
      case 'front':
        if (axis === 'x') return cursorCol - 1;  // Column layer
        if (axis === 'y') return 1 - cursorRow;  // Row layer
        return 1;  // Front face layer
      case 'back':
        if (axis === 'x') return 1 - cursorCol;  // Column layer
        if (axis === 'y') return 1 - cursorRow;  // Row layer
        return -1;  // Back face layer
      case 'left':
        if (axis === 'z') return cursorCol - 1;  // Face-parallel layer
        if (axis === 'y') return 1 - cursorRow;  // Row layer
        return -1;  // Left face layer
      case 'right':
        if (axis === 'z') return 1 - cursorCol;  // Face-parallel layer
        if (axis === 'y') return 1 - cursorRow;  // Row layer
        return 1;  // Right face layer
      case 'top':
        if (axis === 'x') return cursorCol - 1;  // Column layer
        if (axis === 'z') return 1 - cursorRow;  // Face-parallel layer
        return 1;  // Top face layer
      case 'bottom':
        if (axis === 'x') return cursorCol - 1;  // Column layer
        if (axis === 'z') return cursorRow - 1;  // Face-parallel layer
        return -1;  // Bottom face layer
    }
    
    // Default fallback
    return 0;
  }
}

export default CubeFace; 