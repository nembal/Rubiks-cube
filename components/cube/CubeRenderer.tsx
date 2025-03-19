import { 
  Scene, 
  BoxGeometry, 
  Mesh, 
  MeshLambertMaterial,
  MeshBasicMaterial,
  Vector3, 
  Group,
  EdgesGeometry,
  LineSegments,
  LineBasicMaterial
} from 'three';
import CubeManager, { Cubie, Face } from './CubeManager';
import { HighlightMode, HighlightOptions } from './RubiksCube';

class CubeRenderer {
  private cubeManager: CubeManager;
  private scene: Scene;
  private cubeMeshes: Mesh[] = [];
  private cubeGroup: Group;
  private spacing: number = 1.05; // Spacing between cubies
  private selectedMaterial: MeshLambertMaterial;
  private edgeMaterial: LineBasicMaterial = new LineBasicMaterial({ color: 0xff00ff });
  private defaultMaterials: Record<string, MeshLambertMaterial>;
  private highlightOptions: HighlightOptions;
  private highlightedObjects: (Mesh | LineSegments)[] = []; // Track highlighted objects for removal
  private edgesMeshes: Map<Mesh, LineSegments> = new Map();
  
  constructor(cubeManager: CubeManager, scene: Scene, highlightOptions: HighlightOptions) {
    this.cubeManager = cubeManager;
    this.scene = scene;
    this.cubeGroup = new Group();
    this.scene.add(this.cubeGroup);
    this.highlightOptions = highlightOptions;
    
    // Create materials
    this.defaultMaterials = {
      right: new MeshLambertMaterial({ color: 0xff0000 }), // Red
      left: new MeshLambertMaterial({ color: 0xff8000 }),  // Orange
      top: new MeshLambertMaterial({ color: 0xffffff }),   // White
      bottom: new MeshLambertMaterial({ color: 0xffff00 }), // Yellow
      front: new MeshLambertMaterial({ color: 0x00ff00 }),  // Green
      back: new MeshLambertMaterial({ color: 0x0000ff }),   // Blue
      black: new MeshLambertMaterial({ color: 0x333333 }),  // Black for inner faces
    };
    
    this.selectedMaterial = new MeshLambertMaterial({ 
      color: parseInt(this.highlightOptions.color.replace('#', '0x')), 
      transparent: true,
      opacity: this.highlightOptions.opacity
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
    
    // Create edge material for outlining
    this.edgeMaterial = new LineBasicMaterial({ 
      color: color,
      linewidth: 2 
    });
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
      
      // Add to the group
      this.cubeGroup.add(mesh);
      
      // Store the mesh
      this.cubeMeshes.push(mesh);
      
      // Associate mesh with cubie for easier reference
      (mesh as any).cubie = cubie;
      
      // Create edges geometry for edge highlighting
      const edgesGeometry = new EdgesGeometry(geometry);
      const edgesMaterial = new LineBasicMaterial({ 
        color: parseInt(this.highlightOptions.color.replace('#', '0x')),
        transparent: true,
        opacity: this.highlightOptions.opacity
      });
      const edges = new LineSegments(edgesGeometry, edgesMaterial);
      mesh.add(edges);
      edges.visible = false;
      
      // Store edges for later reference
      this.edgesMeshes.set(mesh, edges);
    });
  }
  
  // Update mesh positions based on cube state
  updatePositions(): void {
    this.cubeMeshes.forEach(mesh => {
      const cubie = (mesh as any).cubie as Cubie;
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
      const cubie = (mesh as any).cubie as Cubie;
      if (!cubie) return false;
      
      switch (axis) {
        case 'x': return Math.abs(cubie.rubikPosition.x - value) < 0.1;
        case 'y': return Math.abs(cubie.rubikPosition.y - value) < 0.1;
        case 'z': return Math.abs(cubie.rubikPosition.z - value) < 0.1;
      }
    });
  }
  
  // Get edge cubies on the current face (exclude center)
  private getEdgeCubiesOnCurrentFace(): Mesh[] {
    const state = this.cubeManager.getState();
    const currentFace = state.currentFace;
    const faceCubies = this.getCubiesOnCurrentFace();
    
    return faceCubies.filter(mesh => {
      const cubie = (mesh as any).cubie as Cubie;
      if (!cubie) return false;
      
      // Count how many coordinates are 0 (center of a face)
      const zeroCount = [
        Math.abs(cubie.rubikPosition.x) < 0.1 ? 1 : 0,
        Math.abs(cubie.rubikPosition.y) < 0.1 ? 1 : 0,
        Math.abs(cubie.rubikPosition.z) < 0.1 ? 1 : 0,
      ].reduce((a, b) => a + b, 0);
      
      // Edge cubies have at most one 0 coordinate
      return zeroCount < 2;
    });
  }
  
  // Highlight selected cubie or face based on mode
  highlightSelected(): void {
    // Remove previous highlights
    this.resetHighlights();
    
    // Get the currently selected cubie
    const selectedCubie = this.cubeManager.getSelectedCubie();
    if (!selectedCubie) return;
    
    switch (this.highlightOptions.mode) {
      case 'cubicle':
        this.highlightCubicle(selectedCubie);
        break;
      case 'cubicle-edges':
        this.highlightCubicleEdges(selectedCubie);
        break;
      case 'face':
        this.highlightFace();
        break;
      case 'face-edges':
        this.highlightFaceEdges();
        break;
    }
  }
  
  // Highlight the entire cubicle
  private highlightCubicle(selectedCubie: Cubie): void {
    const selectedMesh = this.findMeshForCubie(selectedCubie);
    
    if (selectedMesh) {
      // Store original materials for when we deselect
      (selectedMesh as any).originalMaterials = selectedMesh.material;
      
      // Create new materials array filled with highlight material
      const highlightMaterials = Array(6).fill(this.selectedMaterial);
      selectedMesh.material = highlightMaterials;
      
      // Add to highlighted objects
      this.highlightedObjects.push(selectedMesh);
    }
  }
  
  // Highlight just the edges of the cubicle
  private highlightCubicleEdges(selectedCubie: Cubie): void {
    const selectedMesh = this.findMeshForCubie(selectedCubie);
    
    if (selectedMesh) {
      // Get the edges LineSegments
      const edges = this.edgesMeshes.get(selectedMesh);
      if (edges) {
        // Update the edge material color and opacity
        (edges.material as LineBasicMaterial).color.set(this.highlightOptions.color);
        (edges.material as LineBasicMaterial).opacity = this.highlightOptions.opacity;
        // Make edges visible
        edges.visible = true;
      }
    }
  }
  
  // Highlight the entire face
  private highlightFace(): void {
    const faceCubies = this.getCubiesOnCurrentFace();
    
    faceCubies.forEach(mesh => {
      // Store original materials
      (mesh as any).originalMaterials = mesh.material;
      
      // Create new materials array filled with highlight material
      const highlightMaterials = Array(6).fill(this.selectedMaterial);
      mesh.material = highlightMaterials;
      
      // Add to highlighted objects
      this.highlightedObjects.push(mesh);
    });
  }
  
  // Highlight the edges of the face
  private highlightFaceEdges(): void {
    const edgeCubies = this.getEdgeCubiesOnCurrentFace();
    
    edgeCubies.forEach(mesh => {
      // Store original materials
      (mesh as any).originalMaterials = mesh.material;
      
      // Create new materials array filled with highlight material
      const highlightMaterials = Array(6).fill(this.selectedMaterial);
      mesh.material = highlightMaterials;
      
      // Add to highlighted objects
      this.highlightedObjects.push(mesh);
    });
  }
  
  // Find mesh corresponding to a cubie
  private findMeshForCubie(cubie: Cubie): Mesh | undefined {
    return this.cubeMeshes.find(mesh => {
      const meshCubie = (mesh as any).cubie as Cubie;
      if (!meshCubie) return false;
      
      return (
        Math.abs(meshCubie.rubikPosition.x - cubie.rubikPosition.x) < 0.1 &&
        Math.abs(meshCubie.rubikPosition.y - cubie.rubikPosition.y) < 0.1 &&
        Math.abs(meshCubie.rubikPosition.z - cubie.rubikPosition.z) < 0.1
      );
    });
  }
  
  // Reset all highlights
  resetHighlights(): void {
    // Restore original materials for all meshes
    this.cubeMeshes.forEach(mesh => {
      if ((mesh as any).originalMaterials) {
        mesh.material = (mesh as any).originalMaterials;
        delete (mesh as any).originalMaterials;
      }
      
      // Hide edges
      const edges = this.edgesMeshes.get(mesh);
      if (edges) {
        edges.visible = false;
      }
    });
    
    // Remove any added edge highlights
    this.highlightedObjects.forEach(obj => {
      if (obj instanceof LineSegments) {
        this.cubeGroup.remove(obj);
        obj.geometry.dispose();
        (obj.material as LineBasicMaterial).dispose();
      }
    });
    
    // Clear the highlighted objects array
    this.highlightedObjects = [];
  }
  
  // Get cubie meshes for a specific layer
  getCubieMeshesInLayer(axis: string, value: number): Mesh[] {
    return this.cubeMeshes.filter(mesh => {
      const cubie = (mesh as any).cubie as Cubie;
      if (!cubie) return false;
      
      switch (axis) {
        case 'x': return Math.abs(cubie.rubikPosition.x - value) < 0.1;
        case 'y': return Math.abs(cubie.rubikPosition.y - value) < 0.1;
        case 'z': return Math.abs(cubie.rubikPosition.z - value) < 0.1;
        default: return false;
      }
    });
  }
  
  // Get all cubie meshes
  getCubieMeshes(): Mesh[] {
    return [...this.cubeMeshes];
  }
}

export default CubeRenderer; 