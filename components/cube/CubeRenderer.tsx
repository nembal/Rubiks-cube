import { 
  Scene, 
  BoxGeometry, 
  Mesh, 
  MeshStandardMaterial,
  Group
} from 'three';
import CubeManager, { Cubie } from './CubeManager';
import { HighlightOptions } from './RubiksCube';

class CubeRenderer {
  private cubeManager: CubeManager;
  private scene: Scene;
  private cubeMeshes: Mesh[] = [];
  private cubeGroup: Group;
  private spacing: number = 1.05; // Spacing between cubies
  private selectedMaterial: MeshStandardMaterial;
  private defaultMaterials: Record<string, MeshStandardMaterial>;
  private highlightOptions: HighlightOptions;
  private highlightedObjects: Mesh[] = []; // Track highlighted objects for removal
  
  constructor(cubeManager: CubeManager, scene: Scene, highlightOptions: HighlightOptions) {
    this.cubeManager = cubeManager;
    this.scene = scene;
    this.cubeGroup = new Group();
    this.scene.add(this.cubeGroup);
    this.highlightOptions = highlightOptions;
    
    // Create materials
    this.defaultMaterials = {
      right: new MeshStandardMaterial({ color: 0xff0000, roughness: 0.3, metalness: 0 }), // Red
      left: new MeshStandardMaterial({ color: 0xff8000, roughness: 0.3, metalness: 0 }),  // Orange
      top: new MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0 }),   // White
      bottom: new MeshStandardMaterial({ color: 0xffff00, roughness: 0.3, metalness: 0 }), // Yellow
      front: new MeshStandardMaterial({ color: 0x00ff00, roughness: 0.3, metalness: 0 }),  // Green
      back: new MeshStandardMaterial({ color: 0x0000ff, roughness: 0.3, metalness: 0 }),   // Blue
      black: new MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0 }),  // Black for inner faces
    };
    
    this.selectedMaterial = new MeshStandardMaterial({ 
      color: parseInt(this.highlightOptions.color.replace('#', '0x')), 
      transparent: true,
      opacity: this.highlightOptions.opacity,
      roughness: 0.3,
      metalness: 0
    });
    
    // Initialize highlight materials
    this.updateHighlightMaterials();
    
    // Initialize cube
    this.createCubeMeshes();
  }
  
  // Update highlight options
  updateHighlightOptions(options: HighlightOptions): void {
    this.highlightOptions = options;
    this.updateHighlightMaterials();
  }
  
  // Update highlight materials based on current options
  private updateHighlightMaterials(): void {
    const color = this.highlightOptions.color;
    const opacity = this.highlightOptions.opacity;
    
    // Update selected material with new options
    this.selectedMaterial.color.set(color);
    this.selectedMaterial.opacity = opacity;
    this.selectedMaterial.transparent = opacity < 1;
  }
  
  // Create mesh for each cubie
  private createCubeMeshes(): void {
    const cubies = this.cubeManager.getCubies();
    const cubeSize = 1; // Unit size for each cubie
    
    // Create a geometry for cubies
    const geometry = new BoxGeometry(cubeSize, cubeSize, cubeSize);
    
    // Create a mesh for each cubie
    cubies.forEach(cubie => {
      // Create materials array for the 6 faces of the cube
      const materials = [
        cubie.color.right !== 'black' ? this.defaultMaterials.right : this.defaultMaterials.black,  // right face (+x)
        cubie.color.left !== 'black' ? this.defaultMaterials.left : this.defaultMaterials.black,    // left face (-x)
        cubie.color.top !== 'black' ? this.defaultMaterials.top : this.defaultMaterials.black,      // top face (+y)
        cubie.color.bottom !== 'black' ? this.defaultMaterials.bottom : this.defaultMaterials.black, // bottom face (-y)
        cubie.color.front !== 'black' ? this.defaultMaterials.front : this.defaultMaterials.black,   // front face (+z)
        cubie.color.back !== 'black' ? this.defaultMaterials.back : this.defaultMaterials.black,     // back face (-z)
      ];
      
      // Create mesh with geometry and materials
      const mesh = new Mesh(geometry, materials);
      
      // Position the mesh
      const pos = cubie.rubikPosition.clone().multiplyScalar(this.spacing);
      mesh.position.copy(pos);
      
      // Enable shadow casting
      mesh.castShadow = true;
      
      // Add to the group
      this.cubeGroup.add(mesh);
      
      // Store the mesh
      this.cubeMeshes.push(mesh);
      
      // Associate mesh with cubie for easier reference
      mesh.userData.cubie = cubie;
    });
  }
  
  // Update mesh positions based on cube state
  updatePositions(): void {
    this.cubeMeshes.forEach(mesh => {
      const cubie = mesh.userData.cubie as Cubie;
      if (cubie) {
        const pos = cubie.rubikPosition.clone().multiplyScalar(this.spacing);
        mesh.position.copy(pos);
      }
    });
  }
  
  // Get all cubies on the current face
  private getCubiesOnCurrentFace(): Mesh[] {
    const state = this.cubeManager.getState();
    const currentFace = state.currentFace;
    let axis: 'x' | 'y' | 'z';
    let value: number;
    
    switch (currentFace) {
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
    
    return this.cubeMeshes.filter(mesh => {
      const cubie = mesh.userData.cubie as Cubie;
      if (!cubie) return false;
      
      switch (axis) {
        case 'x': return Math.abs(cubie.rubikPosition.x - value) < 0.1;
        case 'y': return Math.abs(cubie.rubikPosition.y - value) < 0.1;
        case 'z': return Math.abs(cubie.rubikPosition.z - value) < 0.1;
      }
    });
  }
  
  // Highlight selected cubie
  highlightSelected(): void {
    // Remove previous highlights
    this.resetHighlights();
    
    // Get the currently selected cubie
    const selectedCubie = this.cubeManager.getSelectedCubie();
    if (!selectedCubie) return;
    
    // Highlight the cubicle
    this.highlightCubicle(selectedCubie);
  }
  
  // Highlight the entire cubicle
  private highlightCubicle(selectedCubie: Cubie): void {
    const selectedMesh = this.findMeshForCubie(selectedCubie);
    
    if (selectedMesh) {
      // Store original materials for when we deselect
      selectedMesh.userData.originalMaterials = selectedMesh.material;
      
      // Create new materials array filled with highlight material
      const highlightMaterials = Array(6).fill(this.selectedMaterial);
      selectedMesh.material = highlightMaterials;
      
      // Add to highlighted objects
      this.highlightedObjects.push(selectedMesh);
    }
  }
  
  // Find the mesh for a given cubie
  private findMeshForCubie(cubie: Cubie): Mesh | undefined {
    return this.cubeMeshes.find(mesh => {
      const meshCubie = mesh.userData.cubie as Cubie;
      return meshCubie && 
        Math.abs(meshCubie.rubikPosition.x - cubie.rubikPosition.x) < 0.1 &&
        Math.abs(meshCubie.rubikPosition.y - cubie.rubikPosition.y) < 0.1 &&
        Math.abs(meshCubie.rubikPosition.z - cubie.rubikPosition.z) < 0.1;
    });
  }
  
  // Reset all highlights
  resetHighlights(): void {
    // Restore original materials for all meshes
    this.cubeMeshes.forEach(mesh => {
      if (mesh.userData.originalMaterials) {
        mesh.material = mesh.userData.originalMaterials;
        delete mesh.userData.originalMaterials;
      }
    });
    
    // Clear tracking
    this.highlightedObjects = [];
  }
  
  // Get all cubies in a layer
  getCubieMeshesInLayer(axis: string, value: number): Mesh[] {
    return this.cubeMeshes.filter(mesh => {
      const cubie = mesh.userData.cubie as Cubie;
      if (!cubie) return false;
      
      switch (axis) {
        case 'x': return Math.abs(cubie.rubikPosition.x - value) < 0.1;
        case 'y': return Math.abs(cubie.rubikPosition.y - value) < 0.1;
        case 'z': return Math.abs(cubie.rubikPosition.z - value) < 0.1;
        default: return false;
      }
    });
  }
  
  // Return all cube meshes
  getCubieMeshes(): Mesh[] {
    return this.cubeMeshes;
  }
}

export default CubeRenderer; 