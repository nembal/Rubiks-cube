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
}

export default AnimationController; 