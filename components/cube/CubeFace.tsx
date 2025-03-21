import { Vector3, Camera } from 'three';
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
  
  // Determine which side of the cube the camera is primarily viewing from
  determineCameraFace(camera: Camera): Face {
    // Get camera position
    const cameraPos = camera.position.clone().normalize();
    
    // Find which axis has the largest absolute value
    const absX = Math.abs(cameraPos.x);
    const absY = Math.abs(cameraPos.y);
    const absZ = Math.abs(cameraPos.z);
    
    // Determine the dominant axis and its sign
    if (absX >= absY && absX >= absZ) {
      return cameraPos.x > 0 ? 'right' : 'left';
    } else if (absY >= absX && absY >= absZ) {
      return cameraPos.y > 0 ? 'top' : 'bottom';
    } else {
      return cameraPos.z > 0 ? 'front' : 'back';
    }
  }
  
  // Determine the exact face layout based on camera position
  determineTopBottomFaceLayout(camera: Camera, face: Face): {
    forward: Face,
    backward: Face,
    left: Face,
    right: Face
  } {
    // Determine the camera's primary viewing face (excluding top/bottom)
    const primaryFace = this.determineCameraFace(camera);
    
    // For a camera positioned primarily on the front face
    if (primaryFace === 'front') {
      if (face === 'top') {
        return {
          forward: 'back',
          backward: 'front',
          left: 'left',
          right: 'right'
        };
      } else { // bottom
        return {
          forward: 'front',
          backward: 'back',
          left: 'left',
          right: 'right'
        };
      }
    }
    // For a camera positioned primarily on the back face
    else if (primaryFace === 'back') {
      if (face === 'top') {
        return {
          forward: 'front',
          backward: 'back',
          left: 'right',
          right: 'left'
        };
      } else { // bottom
        return {
          forward: 'back',
          backward: 'front',
          left: 'right',
          right: 'left'
        };
      }
    }
    // For a camera positioned primarily on the left face
    else if (primaryFace === 'left') {
      if (face === 'top') {
        return {
          forward: 'right',
          backward: 'left',
          left: 'back',
          right: 'front'
        };
      } else { // bottom
        return {
          forward: 'left',
          backward: 'right',
          left: 'back',
          right: 'front'
        };
      }
    }
    // For a camera positioned primarily on the right face
    else if (primaryFace === 'right') {
      if (face === 'top') {
        return {
          forward: 'left',
          backward: 'right',
          left: 'front',
          right: 'back'
        };
      } else { // bottom
        return {
          forward: 'right',
          backward: 'left',
          left: 'front',
          right: 'back'
        };
      }
    }
    // Default orientation (should not reach here)
    return {
      forward: 'front',
      backward: 'back',
      left: 'left',
      right: 'right'
    };
  }
  
  // Convert viewer-relative cursor movement to grid changes for top/bottom faces
  mapCursorMovementToGrid(
    direction: 'up' | 'down' | 'left' | 'right',
    camera: Camera,
    face: Face,
    currentRow: number,
    currentCol: number
  ): { row: number, col: number } {
    let newRow = currentRow;
    let newCol = currentCol;
    
    // Only apply viewer-relative mapping for top and bottom faces
    if (face !== 'top' && face !== 'bottom') {
      // Use the original mappings for vertical faces
      switch (direction) {
        case 'up':
          newRow = Math.max(0, currentRow - 1);
          break;
        case 'down':
          newRow = Math.min(2, currentRow + 1);
          break;
        case 'left':
          newCol = Math.max(0, currentCol - 1);
          break;
        case 'right':
          newCol = Math.min(2, currentCol + 1);
          break;
      }
      return { row: newRow, col: newCol };
    }
    
    // Get face layout based on camera position
    const layout = this.determineTopBottomFaceLayout(camera, face);
    
    // Map WASD to the appropriate directions based on the layout
    // This follows the diagrams exactly
    if (face === 'top') {
      switch (direction) {
        case 'up': // W - Move toward the top of screen
          if (layout.forward === 'front') {
            newRow = Math.max(0, currentRow - 1); // Move toward front face
          } else if (layout.forward === 'back') {
            newRow = Math.min(2, currentRow + 1); // Move toward back face
          } else if (layout.forward === 'left') {
            newCol = Math.max(0, currentCol - 1); // Move toward left face
          } else if (layout.forward === 'right') {
            newCol = Math.min(2, currentCol + 1); // Move toward right face
          }
          break;
        case 'down': // S - Move toward the bottom of screen
          if (layout.backward === 'front') {
            newRow = Math.max(0, currentRow - 1); // Move toward front face
          } else if (layout.backward === 'back') {
            newRow = Math.min(2, currentRow + 1); // Move toward back face
          } else if (layout.backward === 'left') {
            newCol = Math.max(0, currentCol - 1); // Move toward left face
          } else if (layout.backward === 'right') {
            newCol = Math.min(2, currentCol + 1); // Move toward right face
          }
          break;
        case 'left': // A - Move toward the left of screen
          if (layout.left === 'front') {
            newRow = Math.max(0, currentRow - 1); // Move toward front face
          } else if (layout.left === 'back') {
            newRow = Math.min(2, currentRow + 1); // Move toward back face
          } else if (layout.left === 'left') {
            newCol = Math.max(0, currentCol - 1); // Move toward left face
          } else if (layout.left === 'right') {
            newCol = Math.min(2, currentCol + 1); // Move toward right face
          }
          break;
        case 'right': // D - Move toward the right of screen
          if (layout.right === 'front') {
            newRow = Math.max(0, currentRow - 1); // Move toward front face
          } else if (layout.right === 'back') {
            newRow = Math.min(2, currentRow + 1); // Move toward back face
          } else if (layout.right === 'left') {
            newCol = Math.max(0, currentCol - 1); // Move toward left face
          } else if (layout.right === 'right') {
            newCol = Math.min(2, currentCol + 1); // Move toward right face
          }
          break;
      }
    } else { // Bottom face
      switch (direction) {
        case 'up': // W - Move toward the top of screen
          if (layout.forward === 'front') {
            newRow = Math.min(2, currentRow + 1); // Move toward front face
          } else if (layout.forward === 'back') {
            newRow = Math.max(0, currentRow - 1); // Move toward back face
          } else if (layout.forward === 'left') {
            newCol = Math.max(0, currentCol - 1); // Move toward left face
          } else if (layout.forward === 'right') {
            newCol = Math.min(2, currentCol + 1); // Move toward right face
          }
          break;
        case 'down': // S - Move toward the bottom of screen
          if (layout.backward === 'front') {
            newRow = Math.min(2, currentRow + 1); // Move toward front face
          } else if (layout.backward === 'back') {
            newRow = Math.max(0, currentRow - 1); // Move toward back face
          } else if (layout.backward === 'left') {
            newCol = Math.max(0, currentCol - 1); // Move toward left face
          } else if (layout.backward === 'right') {
            newCol = Math.min(2, currentCol + 1); // Move toward right face
          }
          break;
        case 'left': // A - Move toward the left of screen
          if (layout.left === 'front') {
            newRow = Math.min(2, currentRow + 1); // Move toward front face
          } else if (layout.left === 'back') {
            newRow = Math.max(0, currentRow - 1); // Move toward back face
          } else if (layout.left === 'left') {
            newCol = Math.max(0, currentCol - 1); // Move toward left face
          } else if (layout.left === 'right') {
            newCol = Math.min(2, currentCol + 1); // Move toward right face
          }
          break;
        case 'right': // D - Move toward the right of screen
          if (layout.right === 'front') {
            newRow = Math.min(2, currentRow + 1); // Move toward front face
          } else if (layout.right === 'back') {
            newRow = Math.max(0, currentRow - 1); // Move toward back face
          } else if (layout.right === 'left') {
            newCol = Math.max(0, currentCol - 1); // Move toward left face
          } else if (layout.right === 'right') {
            newCol = Math.min(2, currentCol + 1); // Move toward right face
          }
          break;
      }
    }
    
    return { row: newRow, col: newCol };
  }
  
  // Map a rotation axis based on the current face and arrow key from viewer perspective
  mapArrowToRotation(
    arrow: 'up' | 'down' | 'left' | 'right', 
    face: Face,
    camera?: Camera
  ): { axis: Axis, direction: 1 | -1 } {
    // We'll use the WASD logic to determine where the cursor would move
    // and then map that to rotation directions
    
    // First, find what grid movement would happen with corresponding WASD key
    // We'll use a dummy cursor position (1,1) - center of face
    const currentRow = 1;
    const currentCol = 1;
    
    // Map arrow keys to the corresponding WASD movement direction
    const wasdDirection = 
      arrow === 'up' ? 'up' :      // Up arrow → W key (up)
      arrow === 'down' ? 'down' :  // Down arrow → S key (down)
      arrow === 'left' ? 'left' :  // Left arrow → A key (left)
      'right';                     // Right arrow → D key (right)
    
    // Calculate where the cursor would move using the existing mapCursorMovementToGrid
    const { row: newRow, col: newCol } = this.mapCursorMovementToGrid(
      wasdDirection, 
      camera || null as unknown as Camera, 
      face, 
      currentRow, 
      currentCol
    );
    
    // Now determine which axis and direction the rotation should have
    // based on how the cursor would move
    
    // For vertical faces (front, back, left, right)
    if (face !== 'top' && face !== 'bottom') {
      switch (face) {
        case 'front':
          if (newRow !== currentRow) { // Changed row (up/down movement)
            return { axis: 'x', direction: newRow < currentRow ? 1 : -1 };
          } else { // Changed column (left/right movement)
            return { axis: 'y', direction: newCol > currentCol ? 1 : -1 };
          }
        case 'back':
          if (newRow !== currentRow) { // Changed row (up/down movement)
            return { axis: 'x', direction: newRow < currentRow ? -1 : 1 };
          } else { // Changed column (left/right movement)
            return { axis: 'y', direction: newCol > currentCol ? -1 : 1 };
          }
        case 'left':
          if (newRow !== currentRow) { // Changed row (up/down movement)
            return { axis: 'z', direction: newRow < currentRow ? -1 : 1 };
          } else { // Changed column (left/right movement)
            return { axis: 'y', direction: newCol > currentCol ? 1 : -1 };
          }
        case 'right':
          if (newRow !== currentRow) { // Changed row (up/down movement)
            return { axis: 'z', direction: newRow < currentRow ? 1 : -1 };
          } else { // Changed column (left/right movement)
            return { axis: 'y', direction: newCol > currentCol ? 1 : -1 };
          }
      }
    }
    
    // For horizontal faces (top, bottom)
    // These are the trickier ones that need to account for camera position
    if (face === 'top' || face === 'bottom') {
      // Determine which way the cursor moved
      const rowDiff = newRow - currentRow;
      const colDiff = newCol - currentCol;
      
      if (colDiff !== 0) {
        // Horizontal movement (left/right cursor movement)
        return { 
          axis: 'x', 
          direction: colDiff > 0 ? 1 : -1 
        };
      } else if (rowDiff !== 0) {
        // Vertical movement (up/down cursor movement)
        if (face === 'top') {
          return { 
            axis: 'z', 
            direction: rowDiff < 0 ? -1 : 1 
          };
        } else { // bottom
          return { 
            axis: 'z', 
            direction: rowDiff > 0 ? 1 : -1 
          };
        }
      }
    }
    
    // Fallback (shouldn't get here in normal operation)
    return { axis: 'y', direction: 1 };
  }
  
  // Get the layer value (coordinate) for the current cursor and face
  getLayerValue(
    arrow: 'up' | 'down' | 'left' | 'right', 
    cursorRow: number, 
    cursorCol: number, 
    face: Face,
    camera?: Camera
  ): number {
    // We determine which layer to rotate based on the cursor position and the face
    const { axis } = this.mapArrowToRotation(arrow, face, camera);
    
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