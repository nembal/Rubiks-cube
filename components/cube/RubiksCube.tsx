"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  Scene,
  PerspectiveCamera,
  Clock,
  Vector3,
  Group
} from 'three';

// Import our custom components
import CubeManager from './CubeManager';
import CubeRenderer from './CubeRenderer';
import CubeFace from './CubeFace';
import AnimationController from './AnimationController';
import InputHandler from './InputHandler';

// Define highlight mode options - only cubicle mode now
export type HighlightMode = 'cubicle';

// UI variables for highlighting
export interface HighlightOptions {
  mode: HighlightMode;
  color: string;
  opacity: number;
}

// Scene component that contains all the 3D elements
const CubeScene: React.FC<{ highlightOptions: HighlightOptions }> = ({ highlightOptions }) => {
  const { scene, camera } = useThree();
  const clockRef = useRef(new Clock());
  const pivotRef = useRef(new Group());
  
  // Refs for our custom components
  const cubeManagerRef = useRef<CubeManager | undefined>(undefined);
  const cubeRendererRef = useRef<CubeRenderer | undefined>(undefined);
  const cubeFaceRef = useRef<CubeFace | undefined>(undefined);
  const animationControllerRef = useRef<AnimationController | undefined>(undefined);
  const inputHandlerRef = useRef<InputHandler | undefined>(undefined);
  
  // Initialize our components
  useEffect(() => {
    // Initialize components
    const cubeManager = new CubeManager();
    const cubeRenderer = new CubeRenderer(cubeManager, scene, highlightOptions);
    const cubeFace = new CubeFace(cubeManager);
    const animationController = new AnimationController(cubeManager, cubeRenderer);
    const inputHandler = new InputHandler(cubeManager, cubeFace, animationController, cubeRenderer);
    
    // Set the camera reference for viewer-relative controls
    inputHandler.setCamera(camera);
    
    // Add the animation pivot to the scene
    scene.add(animationController.getPivot());
    
    // Start listening for keyboard input
    inputHandler.startListening();
    
    // Highlight the initial selected cubie
    cubeRenderer.highlightSelected();
    
    // Store references
    cubeManagerRef.current = cubeManager;
    cubeRendererRef.current = cubeRenderer;
    cubeFaceRef.current = cubeFace;
    animationControllerRef.current = animationController;
    inputHandlerRef.current = inputHandler;
    
    // Cleanup function
    return () => {
      if (inputHandlerRef.current) {
        inputHandlerRef.current.stopListening();
      }
    };
  }, [scene, highlightOptions, camera]);
  
  // Update camera reference when it changes
  useEffect(() => {
    if (inputHandlerRef.current) {
      inputHandlerRef.current.setCamera(camera);
    }
  }, [camera]);
  
  // Update highlight options when they change
  useEffect(() => {
    if (cubeRendererRef.current) {
      cubeRendererRef.current.updateHighlightOptions(highlightOptions);
      cubeRendererRef.current.highlightSelected();
    }
  }, [highlightOptions]);
  
  // Animation frame loop
  useFrame(() => {
    if (animationControllerRef.current && clockRef.current) {
      const deltaTime = clockRef.current.getDelta();
      animationControllerRef.current.update(deltaTime);
    }
  });
  
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 7]} intensity={0.8} />
      
      {/* OrbitControls for camera manipulation */}
      <OrbitControls enableDamping dampingFactor={0.1} />
      
      {/* This is where our cubies will be rendered by CubeRenderer */}
    </>
  );
};

// Main RubiksCube component
const RubiksCube: React.FC = () => {
  // Default highlight options - only cubicle mode
  const [highlightOptions] = useState<HighlightOptions>({
    mode: 'cubicle', // Only available mode
    color: '#ff00ff', // Pink color
    opacity: 1.0, // Fully opaque
  });
  
  return (
    <div className="w-full aspect-square">
      <Canvas camera={{ position: [5, 5, 5], fov: 75 }}>
        <CubeScene highlightOptions={highlightOptions} />
      </Canvas>
      
      {/* No UI buttons needed since there's only one mode */}
    </div>
  );
};

export default RubiksCube;
