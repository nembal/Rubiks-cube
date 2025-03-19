Getting Started with the Basics
To begin, you’ll set up a Next.js project with Tailwind CSS, ShadCN, and Three.js, focusing on the prototype phase. Here’s how:
1. Project Setup
bash

# Create a Next.js project
npx create-next-app@latest rubiks-cube-app --typescript --tailwind --eslint

# Navigate to the project directory
cd rubiks-cube-app

# Install ShadCN CLI
npx shadcn-ui@latest init

# Install Three.js
npm install three @types/three
2. Basic Structure
* Pages: Start with app/page.tsx for the main app.
* Components: Add a components/cube/Cube.tsx for the Three.js cube.
* Rules: Create .cursor/rules and add the rules above.
3. Prototype Focus
* Cube: Implement a simple Three.js cube with WASD (or arrows), B, Space controls, and mouse orbit navigation.
* UI: Use Tailwind and ShadCN for a basic layout (e.g., a header and cube container).
* Placeholder: Add a static "Learn to Cube" section.



Example: (do not Cube.tsx
tsx

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Cube = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current?.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Basic keyboard controls (expand later)
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'w': cube.rotation.x += 0.1; break;
        case 's': cube.rotation.x -= 0.1; break;
        case 'a': cube.rotation.y -= 0.1; break;
        case 'd': cube.rotation.y += 0.1; break;
        case 'b': cube.rotation.z += 0.1; break;
        case ' ': cube.rotation.z -= 0.1; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default Cube;
Next Steps
* Use the Cursor rules to enforce consistency as you code.
* Expand the cube with Rubik’s cube logic (e.g., 3x3 grid, face rotations).
* Iterate based on the phased plan, adding features incrementally.

This setup gives you everything to start building with Next.js, Tailwind, ShadCN, and Three.js, guided by Cursor rules. The iterative approach ensures you can adapt and refine as you go, aiming for an ultra-pretty, fast, and enjoyable final product! Let me know if you need help with any specific part as you begin.
