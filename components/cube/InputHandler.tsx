import CubeManager, { CubeState, Face, Axis } from './CubeManager';
import CubeFace from './CubeFace';
import AnimationController from './AnimationController';
import CubeRenderer from './CubeRenderer';
import { Camera, Vector2 } from 'three';

class InputHandler {
  private cubeManager: CubeManager;
  private cubeFace: CubeFace;
  private animationController: AnimationController;
  private cubeRenderer: CubeRenderer;
  private keydownListener: (event: KeyboardEvent) => void;
  private mouseDownListener: (event: MouseEvent) => void;
  private mouseMoveListener: (event: MouseEvent) => void;
  private mouseUpListener: (event: MouseEvent) => void;
  private mouseClickListener: (event: MouseEvent) => void;
  private contextMenuListener: (event: MouseEvent) => void;
  private touchStartListener: (event: TouchEvent) => void;
  private touchMoveListener: (event: TouchEvent) => void;
  private touchEndListener: (event: TouchEvent) => void;
  private camera: Camera | undefined;
  
  // Mouse drag state
  private isDragging: boolean = false;
  private isRightClickDragging: boolean = false;
  private dragStartPosition: Vector2 = new Vector2();
  private dragCurrentPosition: Vector2 = new Vector2();
  
  // Touch state
  private isTouchDragging: boolean = false;
  private lastTapTime: number = 0;
  private touchStartPosition: Vector2 = new Vector2();
  private touchCurrentPosition: Vector2 = new Vector2();
  
  // Callback for undo
  private onUndoCallback: (() => void) | null = null;
  // Callback for orbit controls
  private onOrbitCallback: ((enable: boolean) => void) | null = null;
  
  // For double-click detection
  private lastClickTime: number = 0;
  private lastClickPosition: Vector2 = new Vector2();
  
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
    this.mouseDownListener = this.handleMouseDown.bind(this);
    this.mouseMoveListener = this.handleMouseMove.bind(this);
    this.mouseUpListener = this.handleMouseUp.bind(this);
    this.mouseClickListener = this.handleClick.bind(this);
    this.contextMenuListener = this.handleContextMenu.bind(this);
    this.touchStartListener = this.handleTouchStart.bind(this);
    this.touchMoveListener = this.handleTouchMove.bind(this);
    this.touchEndListener = this.handleTouchEnd.bind(this);
  }
  
  // Set the camera reference for viewer-relative controls
  setCamera(camera: Camera): void {
    this.camera = camera;
  }
  
  // Set the undo callback
  setUndoCallback(callback: () => void): void {
    this.onUndoCallback = callback;
  }
  
  // Set orbit controls callback
  setOrbitControlsCallback(callback: (enable: boolean) => void): void {
    this.onOrbitCallback = callback;
  }
  
  // Start listening for keyboard and mouse events
  startListening(): void {
    window.addEventListener('keydown', this.keydownListener);
    window.addEventListener('mousedown', this.mouseDownListener);
    window.addEventListener('mousemove', this.mouseMoveListener);
    window.addEventListener('mouseup', this.mouseUpListener);
    window.addEventListener('click', this.mouseClickListener);
    window.addEventListener('contextmenu', this.contextMenuListener);
    
    // Add touch events for mobile
    window.addEventListener('touchstart', this.touchStartListener, { passive: false });
    window.addEventListener('touchmove', this.touchMoveListener, { passive: false });
    window.addEventListener('touchend', this.touchEndListener);
    
    // Enable orbit controls by default
    if (this.onOrbitCallback) {
      this.onOrbitCallback(true);
    }
  }
  
  // Stop listening for keyboard and mouse events
  stopListening(): void {
    window.removeEventListener('keydown', this.keydownListener);
    window.removeEventListener('mousedown', this.mouseDownListener);
    window.removeEventListener('mousemove', this.mouseMoveListener);
    window.removeEventListener('mouseup', this.mouseUpListener);
    window.removeEventListener('click', this.mouseClickListener);
    window.removeEventListener('contextmenu', this.contextMenuListener);
    
    // Remove touch events
    window.removeEventListener('touchstart', this.touchStartListener);
    window.removeEventListener('touchmove', this.touchMoveListener);
    window.removeEventListener('touchend', this.touchEndListener);
  }
  
  // Prevent context menu from showing
  private handleContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }
  
  // Handle mouse down event for cube rotation
  private handleMouseDown(event: MouseEvent): void {
    // Always enable orbit controls for any mouse button
    if (this.onOrbitCallback) {
      this.onOrbitCallback(true);
    }
    
    // Disable mouse drag for cube rotation for now
    this.isDragging = false;
    this.isRightClickDragging = false;
    
    // Cancel default behavior for right click
    if (event.button === 2) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  
  // Handle mouse move event for cube rotation
  private handleMouseMove(event: MouseEvent): void {
    // Disable mouse interaction with cube faces for now
    return;
  }
  
  // Handle mouse up event to complete cube rotation
  private handleMouseUp(event: MouseEvent): void {
    // Disable mouse interaction with cube faces for now
    return;
  }
  
  // Handle touch start event for mobile interactions
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault(); // Prevent default behavior like scrolling
    
    // Enhanced double-tap detection for undo
    const now = new Date().getTime();
    const timeSinceLastTap = now - this.lastTapTime;
    
    // Check for double-tap:
    // 1. It must happen within a short time (300ms)
    // 2. Must be a single finger
    // 3. Must be close to the last tap position
    if (event.touches.length === 1 && timeSinceLastTap > 0 && timeSinceLastTap < 300) {
      // Compare tap positions to ensure it's in the same area (increased to 50px for better detection)
      const tapX = event.touches[0].clientX;
      const tapY = event.touches[0].clientY;
      const dx = tapX - this.touchStartPosition.x;
      const dy = tapY - this.touchStartPosition.y;
      const tapDistance = Math.sqrt(dx * dx + dy * dy);
      
      console.log('Double-tap detection:', { timeSinceLastTap, tapDistance });
      
      if (tapDistance < 50) {
        console.log('Double-tap detected, triggering undo');
        // Double tap detected - trigger undo
        if (this.onUndoCallback) {
          this.onUndoCallback();
        }
        // Reset timer to prevent triple-tap triggering as a double-tap
        this.lastTapTime = 0;
        return;
      }
    }
    
    // Single tap - record position and time
    this.lastTapTime = now;
    this.touchStartPosition.set(event.touches[0].clientX, event.touches[0].clientY);
    
    // Always enable orbit controls for touch gestures
    if (this.onOrbitCallback) {
      this.onOrbitCallback(true);
    }
    
    // Disable touch dragging for cube rotation
    this.isTouchDragging = false;
  }
  
  // Handle touch move event
  private handleTouchMove(event: TouchEvent): void {
    // Disable touch interaction with cube faces
    return;
  }
  
  // Handle touch end event
  private handleTouchEnd(event: TouchEvent): void {
    // Disable touch interaction with cube faces
    return;
  }
  
  // Handle keyboard events with new key mappings
  private handleKeyDown(event: KeyboardEvent): void {
    // If animation is in progress, ignore inputs
    if (this.animationController.isAnimating()) return;
    
    const { key, shiftKey, code } = event;
    const isClockwise = this.cubeManager.isClockwise();
    
    // Handle undo with any shift key press
    // Use key === 'Shift' for initial press and code for specific left/right shift keys
    if (key === 'Shift' || code === 'ShiftLeft' || code === 'ShiftRight') {
      console.log('Shift key pressed, triggering undo');
      event.preventDefault();
      if (this.onUndoCallback) {
        this.onUndoCallback();
      }
      return;
    }
    
    // If shift is pressed with other keys, don't process the other key
    if (shiftKey) return;
    
    switch (key.toLowerCase()) {
      // WASD keys and E for face rotation
      case 'w':
        this.rotateFace('top', isClockwise ? 1 : -1);
        break;
      case 'a':
        this.rotateFace('left', isClockwise ? 1 : -1);
        break;
      case 's':
        this.rotateFace('bottom', isClockwise ? 1 : -1);
        break;
      case 'd':
        this.rotateFace('right', isClockwise ? 1 : -1);
        break;
      case 'e':
        this.rotateFace('front', isClockwise ? 1 : -1);
        break;
      case 'q':
        this.rotateFace('back', isClockwise ? 1 : -1);
        break;
      
      // Spacebar for toggling rotation direction
      case ' ':
        this.cubeManager.toggleRotationDirection();
        break;
      
      // Old arrow keys for backward compatibility
      case 'arrowup':
      case 'arrowdown':
      case 'arrowleft':
      case 'arrowright':
        this.handleArrowKeys(key);
        break;
    }
    
    // Update the highlighted cubie
    this.cubeRenderer.highlightSelected();
  }
  
  // Legacy method for arrow key handling
  private handleArrowKeys(key: string): void {
    const state = this.cubeManager.getState();
    switch (key) {
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
    }
  }
  
  // Perform an undo action
  performUndo(): void {
    console.log('InputHandler.performUndo called');
    
    if (this.animationController.isAnimating()) {
      console.log('Animation in progress, cannot undo now');
      return;
    }
    
    const undoResult = this.cubeManager.undoLastMove();
    console.log('Undo result:', undoResult);
    
    if (undoResult.success && 'layer' in undoResult) {
      console.log('Starting undo animation');
      const { layer, axis, value } = undoResult;
      // Cast direction to 1 | -1 since we know it's either 1 or -1
      const direction = undoResult.direction as 1 | -1;
      
      // Get the corresponding meshes
      const meshes = this.cubeRenderer.getCubieMeshesInLayer(axis, value);
      
      // Start the animation
      this.animationController.startTwist(layer, meshes, axis, direction, () => {
        // On animation complete
        console.log('Undo animation complete');
        this.cubeManager.setAnimating(false);
        this.cubeRenderer.updatePositions();
      });
    } else {
      console.log('Nothing to undo or undo failed');
    }
  }
  
  // New method to rotate a specific face
  private rotateFace(face: Face, direction: 1 | -1): void {
    // Get the axis and value for the given face
    const axis = this.cubeFace.getFaceAxis(face);
    const value = this.cubeFace.getFaceValue(face);
    
    // Get cubies in the layer
    const twistResult = this.cubeManager.twistLayer(axis, value, direction, face);
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
  
  // Handle mouse click event for double-click detection
  private handleClick(event: MouseEvent): void {
    if (this.animationController.isAnimating()) return;
    
    // Only process left clicks
    if (event.button !== 0) return;
    
    const now = new Date().getTime();
    const timeSinceLastClick = now - this.lastClickTime;
    
    // Check for double-click (within 300ms and 50px)
    if (timeSinceLastClick > 0 && timeSinceLastClick < 300) {
      const clickX = event.clientX;
      const clickY = event.clientY;
      const dx = clickX - this.lastClickPosition.x;
      const dy = clickY - this.lastClickPosition.y;
      const clickDistance = Math.sqrt(dx * dx + dy * dy);
      
      console.log('Double-click detection:', { timeSinceLastClick, clickDistance });
      
      if (clickDistance < 50) {
        console.log('Double-click detected, triggering undo');
        // Double click detected - trigger undo
        if (this.onUndoCallback) {
          this.onUndoCallback();
        }
        // Reset timer to prevent triple-click
        this.lastClickTime = 0;
        return;
      }
    }
    
    // Store click info for potential double-click detection
    this.lastClickTime = now;
    this.lastClickPosition.set(event.clientX, event.clientY);
  }
}

export default InputHandler; 