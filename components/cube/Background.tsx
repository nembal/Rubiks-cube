import React, { useRef, useEffect } from 'react';
import { Color, MeshBasicMaterial, Mesh, TextureLoader } from 'three';
import { useThree } from '@react-three/fiber';

interface BackgroundProps {
  planeSize?: number;
  shadowOpacity?: number;
}

const Background: React.FC<BackgroundProps> = ({
  planeSize = 200,
  shadowOpacity = 0.2,
}) => {
  const { scene, gl, size } = useThree();
  const gradientRef = useRef<Mesh>(null);

  // Create a radial gradient texture for the soft shadow
  useEffect(() => {
    if (!gradientRef.current) return;
    
    // Create a canvas for the gradient
    const canvas = document.createElement('canvas');
    canvas.width = 1024; // Higher resolution for better quality
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    
    if (context) {
      // Create a radial gradient
      const gradient = context.createRadialGradient(
        512, 512, 0,      // inner circle center and radius
        512, 512, 512     // outer circle center and radius
      );
      
      // Add color stops with darker values and smoother transition
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');    // Darker center
      gradient.addColorStop(0.2, 'rgba(0, 0, 0, 0.2)');  // Medium darkness
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');  // Light shadow
      gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.03)'); // Very light edge
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');      // Transparent edge
      
      // Fill the canvas with the gradient
      context.fillStyle = gradient;
      context.fillRect(0, 0, 1024, 1024);
      
      // Optional: Apply a slight blur for smoother edges
      try {
        context.filter = 'blur(8px)';
        context.drawImage(canvas, 0, 0, 1024, 1024);
      } catch {
        // Filter might not be supported in all browsers, fallback is no blur
      }
      
      // Create a texture from the canvas
      const texture = new TextureLoader().load(canvas.toDataURL());
      
      // Apply to our material
      if (gradientRef.current.material instanceof MeshBasicMaterial) {
        gradientRef.current.material.map = texture;
        gradientRef.current.material.transparent = true;
        gradientRef.current.material.needsUpdate = true;
      }
    }
  }, []);

  // Set scene background color to white
  React.useEffect(() => {
    // Set renderer clear color to white to match the site background
    gl.setClearColor('#ffffff', 1);
    scene.background = new Color('#ffffff');
    
    return () => {
      gl.setClearColor('#000000', 1);
    };
  }, [scene, gl]);

  // Calculate appropriate shadow size based on screen dimensions
  const screenSize = Math.max(size.width, size.height);
  const shadowSize = Math.max(12, screenSize / 100); // Responsive shadow size

  return (
    <>
      {/* Ambient light for overall brightness */}
      <ambientLight intensity={0.9} />
      
      {/* Main directional light for the shadow */}
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={100}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
        shadow-radius={20}
      />
      
      {/* Fill light to soften shadows */}
      <directionalLight 
        position={[-5, 3, -5]} 
        intensity={0.3} 
      />
      
      {/* Subtle top light for better highlights */}
      <directionalLight
        position={[0, 10, 0]}
        intensity={0.2}
      />
      
      {/* Subtle front light for viewer-facing details */}
      <directionalLight
        position={[0, 0, 10]}
        intensity={0.15}
      />
      
      {/* Shadow-only plane - invisible except for shadows */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -2, 0]} 
        receiveShadow
      >
        <planeGeometry args={[planeSize, planeSize]} />
        <shadowMaterial transparent opacity={shadowOpacity} />
      </mesh>

      {/* Enhanced circular gradient shadow directly under the cube */}
      <mesh
        ref={gradientRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.99, 0]} // Slightly above the shadow plane
      >
        <circleGeometry args={[shadowSize, 64]} />
        <meshBasicMaterial transparent opacity={1} />
      </mesh>
    </>
  );
};

export default Background; 