"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  Clock,
} from 'three';

// Import our custom components
import CubeManager from './CubeManager';
import CubeRenderer from './CubeRenderer';
import CubeFace from './CubeFace';
import AnimationController from './AnimationController';
import InputHandler from './InputHandler';
import Background from './Background';

// Define highlight mode options - only cubicle mode now
export type HighlightMode = 'cubicle';

// UI variables for highlighting
export interface HighlightOptions {
  mode: HighlightMode;
  color: string;
  opacity: number;
}

// Timer component
const Timer: React.FC<{ isRunning: boolean; onReset: () => void }> = ({ isRunning, onReset }) => {
  const [time, setTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    setTime(0);
  }, [onReset]);

  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-20 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-md text-2xl font-mono z-20">
      {formatTime()}
    </div>
  );
};

// Direction indicator component
const DirectionIndicator: React.FC<{ isClockwise: boolean }> = ({ isClockwise }) => {
  return (
    <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md">
      <span className="font-bold mr-2">Direction:</span>
      <span className="font-mono">{isClockwise ? 'Clockwise ⟳' : 'Counterclockwise ⟲'}</span>
    </div>
  );
};

// Control buttons component
const ControlButtons: React.FC<{ 
  onUndo: () => void; 
  undoDisabled: boolean; 
}> = ({ onUndo, undoDisabled }) => {
  return (
    <div className="absolute top-20 left-4 flex flex-col gap-2 z-20">
      <button
        onClick={onUndo}
        disabled={undoDisabled}
        className={`bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md ${
          undoDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Undo
      </button>
    </div>
  );
};

// Scene component that contains all the 3D elements
const CubeScene: React.FC<{ 
  highlightOptions: HighlightOptions;
  onCubeStateChange: (isClockwise: boolean, isSolved: boolean, canUndo: boolean) => void;
  onUndo: () => void;
  setInputHandlerRef: (handler: InputHandler) => void;
}> = ({ highlightOptions, onCubeStateChange, onUndo, setInputHandlerRef }) => {
  const { scene, camera } = useThree();
  const clockRef = useRef(new Clock());
  const orbitControlsRef = useRef<any>(null);
  
  // Refs for our custom components
  const cubeManagerRef = useRef<CubeManager | undefined>(undefined);
  const cubeRendererRef = useRef<CubeRenderer | undefined>(undefined);
  const cubeFaceRef = useRef<CubeFace | undefined>(undefined);
  const animationControllerRef = useRef<AnimationController | undefined>(undefined);
  const inputHandlerRef = useRef<InputHandler | null>(null);
  
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
    
    // Set the undo callback to our internal handleUndo method
    inputHandler.setUndoCallback(() => {
      console.log('Undo callback triggered from InputHandler');
      // Call the onUndo prop directly (which points to onUndoAction in parent)
      onUndo();
    });
    
    // Set the orbit controls callback but always force to true
    inputHandler.setOrbitControlsCallback((enable: boolean) => {
      if (orbitControlsRef.current) {
        // Always enable orbit controls regardless of the parameter
        orbitControlsRef.current.enabled = true;
      }
    });
    
    // Ensure orbit controls are enabled right away
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
    }
    
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
    
    // Pass the inputHandler reference back to the parent component
    setInputHandlerRef(inputHandler);
    
    // Cleanup function
    return () => {
      if (inputHandlerRef.current) {
        inputHandlerRef.current.stopListening();
      }
    };
  }, [scene, highlightOptions, camera, onUndo, setInputHandlerRef]);
  
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
  
  // Update cube state (direction and solved state)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (cubeManagerRef.current) {
        const isClockwise = cubeManagerRef.current.isClockwise();
        const isSolved = cubeManagerRef.current.isSolved();
        const moveHistory = cubeManagerRef.current.getMoveHistory();
        const canUndo = moveHistory.length > 0;
        onCubeStateChange(isClockwise, isSolved, canUndo);
      }
    }, 200);
    
    return () => clearInterval(intervalId);
  }, [onCubeStateChange]);
  
  // Animation frame loop
  useFrame(() => {
    if (animationControllerRef.current && clockRef.current) {
      const deltaTime = clockRef.current.getDelta();
      animationControllerRef.current.update(deltaTime);
    }
  });
  
  return (
    <>
      {/* Background and lighting */}
      <Background planeSize={200} shadowOpacity={0.3} />
      
      {/* OrbitControls for camera manipulation */}
      <OrbitControls 
        ref={orbitControlsRef}
        enableDamping 
        dampingFactor={0.08} 
        enableZoom={true}
        zoomSpeed={0.5}
        enableRotate={true}
        rotateSpeed={0.7}
        minDistance={6}
        maxDistance={20}
        enablePan={false}
      />
      
      {/* This is where our cubies will be rendered by CubeRenderer */}
    </>
  );
};

// Main RubiksCube component
const RubiksCube: React.FC = () => {
  // Create a ref to store the InputHandler
  const inputHandlerRef = useRef<InputHandler | null>(null);

  // Default highlight options - only cubicle mode
  const [highlightOptions] = useState<HighlightOptions>({
    mode: 'cubicle', // Only available mode
    color: '#ff00ff', // Pink color
    opacity: 1.0, // Fully opaque
  });
  
  // State for UI and game logic
  const [isClockwise, setIsClockwise] = useState(true);
  const [isSolved, setIsSolved] = useState(true);
  const [canUndo, setCanUndo] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  
  // Shared undo action function to reuse for button and CubeScene
  const onUndoAction = useCallback(() => {
    console.log('Undo action triggered from RubiksCube component');
    // This is passed to CubeScene as the onUndo prop and will be called by:
    // 1. The undo button in the UI
    // 2. The Shift key handler in InputHandler
    // 3. Double-tap/click detection in InputHandler
    
    // Directly trigger the performUndo method if inputHandler is available
    if (inputHandlerRef.current) {
      console.log('Directly calling performUndo from RubiksCube component');
      inputHandlerRef.current.performUndo();
    } else {
      console.error('InputHandler not available');
    }
  }, []);
  
  // Callback for cube state changes
  const handleCubeStateChange = useCallback((clockwise: boolean, solved: boolean, hasUndo: boolean) => {
    setIsClockwise(clockwise);
    setCanUndo(hasUndo);
    
    // Start timer on first move when the cube becomes unsolved
    if (isSolved && !solved && !timerRunning) {
      setTimerRunning(true);
    }
    
    // If the cube was unsolved and is now solved, stop the timer
    if (!isSolved && solved) {
      setTimerRunning(false);
    }
    
    setIsSolved(solved);
  }, [isSolved, timerRunning]);
  
  // Function to receive and store the InputHandler reference
  const setInputHandlerRef = useCallback((handler: InputHandler) => {
    console.log('Storing InputHandler reference in parent');
    inputHandlerRef.current = handler;
  }, []);
  
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas 
        camera={{ position: [7, 5, 7], fov: 45 }}
        shadows
        dpr={[1, 2]} // Responsive pixel ratio for better performance
      >
        <CubeScene 
          highlightOptions={highlightOptions} 
          onCubeStateChange={handleCubeStateChange}
          onUndo={onUndoAction}
          setInputHandlerRef={setInputHandlerRef}
        />
      </Canvas>
      
      {/* UI Elements */}
      <ControlButtons 
        onUndo={onUndoAction}
        undoDisabled={!canUndo} 
      />
      <DirectionIndicator isClockwise={isClockwise} />
      <Timer key={timerKey} isRunning={timerRunning} onReset={() => setTimerKey(prev => prev + 1)} />
      
      {/* Keyboard Controls Info */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-md text-sm">
        <h3 className="font-bold mb-1">Controls:</h3>
        <ul className="space-y-1">
          <li><span className="font-mono bg-gray-800 px-1 rounded">W</span> - Rotate top face</li>
          <li><span className="font-mono bg-gray-800 px-1 rounded">A</span> - Rotate left face</li>
          <li><span className="font-mono bg-gray-800 px-1 rounded">S</span> - Rotate bottom face</li>
          <li><span className="font-mono bg-gray-800 px-1 rounded">D</span> - Rotate right face</li>
          <li><span className="font-mono bg-gray-800 px-1 rounded">E</span> - Rotate front face</li>
          <li><span className="font-mono bg-gray-800 px-1 rounded">Q</span> - Rotate back face</li>
          <li><span className="font-mono bg-gray-800 px-1 rounded">Space</span> - Toggle direction</li>
          <li><span className="font-mono bg-gray-800 px-1 rounded">Shift</span> - Undo last move</li>
          <li>Mouse drag - Orbit view</li>
        </ul>
      </div>
    </div>
  );
};

export default RubiksCube;
