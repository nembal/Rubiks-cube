import CubeManager, { CubeState } from './CubeManager';
import CubeFace from './CubeFace';
import AnimationController from './AnimationController';
import CubeRenderer from './CubeRenderer';
import { Camera } from 'three';

class InputHandler {
  private cubeManager: CubeManager;
  private cubeFace: CubeFace;
  private animationController: AnimationController;
  private cubeRenderer: CubeRenderer;
  private keydownListener: (event: KeyboardEvent) => void;
  private camera: Camera | undefined;
  
  constructor(
    cubeManager: CubeManager, 
    cubeFace: CubeFace, 
    animationController: AnimationController,
    cubeRenderer: CubeRenderer
  ) {
    this.cubeManager = cubeManager;
    this.cubeFace = cubeFace;
    this.animationController = animationController;
    this.cubeRenderer = cubeRenderer;
    
    this.keydownListener = this.handleKeyDown.bind(this);
  }
  
  // Set the camera reference for viewer-relative controls
  setCamera(camera: Camera): void {
    this.camera = camera;
  }
  
  // Start listening for keyboard events
  startListening(): void {
    window.addEventListener('keydown', this.keydownListener);
  }
  
  // Stop listening for keyboard events
  stopListening(): void {
    window.removeEventListener('keydown', this.keydownListener);
  }
  
  // Handle keyboard events
  private handleKeyDown(event: KeyboardEvent): void {
    // If animation is in progress, ignore inputs
    if (this.animationController.isAnimating()) return;
    
    const { key } = event;
    const state = this.cubeManager.getState();
    
    switch (key.toLowerCase()) {
      // WASD keys for cursor movement
      case 'w':
        this.moveCursor('up', state);
        break;
      case 'a':
        this.moveCursor('left', state);
        break;
      case 's':
        this.moveCursor('down', state);
        break;
      case 'd':
        this.moveCursor('right', state);
        break;
      
      // Arrow keys for layer rotation
      case 'arrowup':
        this.rotateLayer('up', state);
        break;
      case 'arrowdown':
        this.rotateLayer('down', state);
        break;
      case 'arrowleft':
        this.rotateLayer('left', state);
        break;
      case 'arrowright':
        this.rotateLayer('right', state);
        break;
      
      // Spacebar for switching faces
      case ' ':
        this.switchFace();
        break;
    }
    
    // Update the highlighted cubie
    this.cubeRenderer.highlightSelected();
  }
  
  // Move the cursor on the current face with viewer-relative controls for top/bottom
  private moveCursor(direction: 'up' | 'down' | 'left' | 'right', state: CubeState): void {
    const { currentFace, cursor } = state;
    const { row, col } = cursor;
    
    // Check if we need viewer-relative controls (top/bottom face)
    if ((currentFace === 'top' || currentFace === 'bottom') && this.camera) {
      // Use viewer-relative mapping for top/bottom faces
      const newPosition = this.cubeFace.mapCursorMovementToGrid(
        direction,
        this.camera,
        currentFace,
        row,
        col
      );
      
      // Update cursor position
      this.cubeManager.setCursorPosition(newPosition.row, newPosition.col);
    } else {
      // Use standard movement for vertical faces
      this.cubeManager.moveCursor(direction);
    }
  }
  
  // Switch to the next face
  private switchFace(): void {
    this.cubeManager.switchFace();
  }
  
  // Rotate a layer based on arrow key and current state, using viewer-relative controls
  private rotateLayer(arrow: 'up' | 'down' | 'left' | 'right', state: CubeState): void {
    const { currentFace, cursor } = state;
    const { row, col } = cursor;
    
    // Determine which layer to rotate and in which direction, using camera for top/bottom
    const { axis, direction } = this.cubeFace.mapArrowToRotation(
      arrow, 
      currentFace,
      (currentFace === 'top' || currentFace === 'bottom') ? this.camera : undefined
    );
    
    // Determine the value (coordinate) of the layer to rotate
    const value = this.cubeFace.getLayerValue(
      arrow, 
      row, 
      col, 
      currentFace,
      (currentFace === 'top' || currentFace === 'bottom') ? this.camera : undefined
    );
    
    // Get cubies in the layer
    const twistResult = this.cubeManager.twistLayer(axis, value, direction);
    const { layer } = twistResult;
    
    // Get the corresponding meshes
    const meshes = this.cubeRenderer.getCubieMeshesInLayer(axis, value);
    
    // Start the animation
    this.animationController.startTwist(layer, meshes, axis, direction, () => {
      // On animation complete
      this.cubeManager.setAnimating(false);
      this.cubeRenderer.updatePositions();
    });
  }
}

export default InputHandler; 