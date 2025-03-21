import { Object3D, Mesh, Vector3 } from 'three';
import CubeManager, { Axis, Cubie, Face } from './CubeManager';
import CubeRenderer from './CubeRenderer';

class AnimationController {
  private cubeManager: CubeManager;
  private cubeRenderer: CubeRenderer;
  private animating: boolean = false;
  private pivot: Object3D;
  private rotationAxis: Vector3 = new Vector3();
  private targetAngle: number = 0;
  private currentAngle: number = 0;
  private direction: 1 | -1 = 1;
  private cubies: Cubie[] = [];
  private cubieMeshes: Mesh[] = [];
  private onAnimationComplete: () => void = () => {};
  
  constructor(cubeManager: CubeManager, cubeRenderer: CubeRenderer) {
    this.cubeManager = cubeManager;
    this.cubeRenderer = cubeRenderer;
    this.pivot = new Object3D();
    
    // Make sure the pivot and its children cast shadows
    this.pivot.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
      }
    });
    
    this.reset();
  }
  
  // Reset animation state
  reset(): void {
    this.animating = false;
    this.pivot.rotation.set(0, 0, 0);
    this.pivot.clear();
    this.rotationAxis.set(0, 0, 0);
    this.targetAngle = 0;
    this.currentAngle = 0;
    this.direction = 1;
    this.cubies = [];
    this.cubieMeshes = [];
  }
  
  // Start animation for layer twist
  startTwist(cubies: Cubie[], cubieMeshes: Mesh[], axis: Axis, direction: 1 | -1, onComplete: () => void): void {
    if (this.animating) return;
    
    this.reset();
    this.animating = true;
    this.cubies = cubies;
    this.cubieMeshes = cubieMeshes;
    this.direction = direction;
    this.onAnimationComplete = onComplete;
    
    // Set rotation axis
    switch (axis) {
      case 'x':
        this.rotationAxis.set(1, 0, 0);
        break;
      case 'y':
        this.rotationAxis.set(0, 1, 0);
        break;
      case 'z':
        this.rotationAxis.set(0, 0, 1);
        break;
    }
    
    // Set target angle (90 degrees in radians)
    this.targetAngle = (Math.PI / 2) * direction;
    
    // Attach cubies to the pivot
    this.attachCubiesToPivot();
  }
  
  // Attach cubie meshes to the pivot for rotation
  private attachCubiesToPivot(): void {
    this.pivot.rotation.set(0, 0, 0);
    
    // Add each mesh to the pivot
    this.cubieMeshes.forEach(mesh => {
      // Store original parent and position
      const originalParent = mesh.parent;
      const originalPosition = mesh.position.clone();
      
      // Ensure the mesh casts shadows
      mesh.castShadow = true;
      
      // Add to pivot
      this.pivot.attach(mesh);
      
      // Store reference for detaching later
      mesh.userData.originalParent = originalParent;
      mesh.userData.originalPosition = originalPosition;
    });
  }
  
  // Detach cubie meshes from pivot after animation
  private detachCubiesFromPivot(): void {
    this.cubieMeshes.forEach(mesh => {
      const originalParent = mesh.userData.originalParent as Object3D;
      const originalPosition = mesh.userData.originalPosition as Vector3;
      
      if (originalParent) {
        // Detach from pivot and reattach to original parent
        originalParent.attach(mesh);
        
        // Restore position
        if (originalPosition) {
          mesh.position.copy(originalPosition);
        }
      }
    });
    
    this.pivot.clear();
  }
  
  // Update animation for each frame
  update(deltaTime: number): void {
    if (!this.animating) return;
    
    // Animation speed (radians per second)
    const rotationSpeed = Math.PI; // 180 degrees per second
    
    // Calculate step for this frame
    const step = rotationSpeed * deltaTime;
    
    // Apply rotation step to pivot
    if (this.rotationAxis.x) {
      this.pivot.rotateX(step * this.direction);
      this.currentAngle += step;
    } else if (this.rotationAxis.y) {
      this.pivot.rotateY(step * this.direction);
      this.currentAngle += step;
    } else if (this.rotationAxis.z) {
      this.pivot.rotateZ(step * this.direction);
      this.currentAngle += step;
    }
    
    // Check if we've reached or passed the target angle
    if (this.currentAngle >= Math.abs(this.targetAngle)) {
      // Snap to exact angle
      this.snapToTargetAngle();
      
      // Complete the animation
      this.completeAnimation();
    }
  }
  
  // Snap to exact 90-degree angle
  private snapToTargetAngle(): void {
    if (this.rotationAxis.x) {
      this.pivot.rotation.x = this.targetAngle;
    } else if (this.rotationAxis.y) {
      this.pivot.rotation.y = this.targetAngle;
    } else if (this.rotationAxis.z) {
      this.pivot.rotation.z = this.targetAngle;
    }
  }
  
  // Complete the animation
  private completeAnimation(): void {
    // Update cubie positions in the model
    const axis = this.getAxisFromVector();
    this.cubeManager.updateCubiePositions(this.cubies, axis, this.targetAngle);
    
    // Detach cubies from pivot
    this.detachCubiesFromPivot();
    
    // Mark animation as complete
    this.animating = false;
    
    // Re-highlight the selected cubie based on cursor position
    // This ensures the highlight "jumps back" to the cursor position
    // rather than following the rotated cubie
    this.cubeRenderer.highlightSelected();
    
    // Call the completion callback
    if (this.onAnimationComplete) {
      this.onAnimationComplete();
    }
  }
  
  // Get the axis from the rotation vector
  private getAxisFromVector(): Axis {
    if (this.rotationAxis.x) return 'x';
    if (this.rotationAxis.y) return 'y';
    return 'z';
  }
  
  // Get the pivot object
  getPivot(): Object3D {
    return this.pivot;
  }
  
  // Check if animation is in progress
  isAnimating(): boolean {
    return this.animating;
  }
  
  // Shuffle the cube with random moves
  shuffleCube(moveCount: number = 25, onComplete: () => void = () => {}): void {
    if (this.animating) return;
    
    // Available faces to randomly rotate
    const faces: Face[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];
    
    // Counter for tracking completed moves
    let completedMoves = 0;
    
    // Function to perform a random move
    const performRandomMove = () => {
      if (completedMoves >= moveCount) {
        onComplete();
        return;
      }
      
      // Pick a random face
      const randomFaceIndex = Math.floor(Math.random() * faces.length);
      const face = faces[randomFaceIndex];
      
      // Pick a random direction (1 or -1)
      const direction = Math.random() < 0.5 ? 1 : -1;
      
      // Get the axis and value for the given face
      let axis: Axis = 'x';  // Default initialization
      let value: number = 0; // Default initialization
      
      switch (face) {
        case 'front':
          axis = 'z';
          value = 1;
          break;
        case 'back':
          axis = 'z';
          value = -1;
          break;
        case 'left':
          axis = 'x';
          value = -1;
          break;
        case 'right':
          axis = 'x';
          value = 1;
          break;
        case 'top':
          axis = 'y';
          value = 1;
          break;
        case 'bottom':
          axis = 'y';
          value = -1;
          break;
      }
      
      // Get cubies in the layer
      const { layer } = this.cubeManager.twistLayer(axis, value, direction, face);
      
      // Get the corresponding meshes
      const meshes = this.cubeRenderer.getCubieMeshesInLayer(axis, value);
      
      // Start the animation for this move
      this.startTwist(layer, meshes, axis, direction, () => {
        // Update cube state
        this.cubeManager.setAnimating(false);
        this.cubeRenderer.updatePositions();
        
        // Increment the counter
        completedMoves++;
        
        // Perform the next move
        performRandomMove();
      });
    };
    
    // Start the shuffle process
    performRandomMove();
  }
}

export default AnimationController; 