import CubeManager, { CubeState, Face, Axis } from './CubeManager';
import CubeFace from './CubeFace';
import AnimationController from './AnimationController';
import CubeRenderer from './CubeRenderer';

class InputHandler {
  private cubeManager: CubeManager;
  private cubeFace: CubeFace;
  private animationController: AnimationController;
  private cubeRenderer: CubeRenderer;
  private keydownListener: (event: KeyboardEvent) => void;
  
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
  
  // Move the cursor on the current face
  private moveCursor(direction: 'up' | 'down' | 'left' | 'right', state: CubeState): void {
    this.cubeManager.moveCursor(direction);
  }
  
  // Switch to the next face
  private switchFace(): void {
    this.cubeManager.switchFace();
  }
  
  // Rotate a layer based on arrow key and current state
  private rotateLayer(arrow: 'up' | 'down' | 'left' | 'right', state: CubeState): void {
    const { currentFace, cursor } = state;
    const { row, col } = cursor;
    
    // Determine which layer to rotate and in which direction
    const { axis, direction } = this.cubeFace.mapArrowToRotation(arrow, currentFace);
    
    // Determine the value (coordinate) of the layer to rotate
    const value = this.cubeFace.getLayerValue(arrow, row, col, currentFace);
    
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