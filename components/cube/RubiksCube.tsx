"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  Clock,
} from 'three';
import clsx from 'clsx';

// Import our custom components
import CubeManager from './CubeManager';
import CubeRenderer from './CubeRenderer';
import CubeFace from './CubeFace';
import AnimationController from './AnimationController';
import InputHandler from './InputHandler';
import Background from './Background';
import FancyButton from '../ui/FancyButton';

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
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view on mount and on window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Standard breakpoint for mobile
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleClick = () => {
    if (!isRunning) {
      // Simulate 'W' keypress
      const event = new KeyboardEvent('keydown', {
        key: 'w',
        code: 'KeyW',
        keyCode: 87,
        which: 87,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(event);
      onReset();
    }
  };

  // Play icon
  const PlayIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className={clsx(
      "absolute z-20", 
      isMobile ? "top-10 right-2" : "top-20 right-4"
    )}>
      <FancyButton
        label={isRunning ? formatTime() : "Play"}
        variant="timer"
        icon={!isRunning ? <PlayIcon /> : undefined}
        iconSize="large"
        isMobile={isMobile}
        isActive={isRunning}
        isRunningTimer={isRunning}
        isMonospaceText={isRunning}
        onClick={!isRunning ? handleClick : undefined}
        className={isRunning ? "pointer-events-none" : ""}
      />
    </div>
  );
};

// Control buttons component
const ControlButtons: React.FC<{ 
  onUndo: () => void; 
  undoDisabled: boolean;
  isMobile: boolean;
}> = ({ onUndo, undoDisabled, isMobile }) => {
  // Undo icon
  const UndoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor"
    >
    <path fillRule="evenodd" d="M20.239 3.749a.75.75 0 0 0-.75.75V15H5.549l2.47-2.47a.75.75 0 0 0-1.06-1.06l-3.75 3.75a.75.75 0 0 0 0 1.06l3.75 3.75a.75.75 0 1 0 1.06-1.06L5.55 16.5h14.69a.75.75 0 0 0 .75-.75V4.5a.75.75 0 0 0-.75-.751Z" clipRule="evenodd" />
  </svg>
  );

  return (
    <div className={clsx(
      "absolute z-20", 
      isMobile ? "top-10 left-2" : "top-20 left-4"
    )}>
      <FancyButton
        label="Undo"
        variant="undo"
        onClick={undoDisabled ? undefined : onUndo}
        isActive={!undoDisabled}
        icon={<UndoIcon />}
        iconSize="large"
        isMobile={isMobile}
        className={undoDisabled ? 'opacity-50 cursor-not-allowed' : ''}
      />
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
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view on mount and on window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Standard breakpoint for mobile
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
  
  // Direction icons
  const ClockwiseIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path fillRule="evenodd" d="M14.47 2.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06l4.72-4.72H9a5.25 5.25 0 1 0 0 10.5h3a.75.75 0 0 1 0 1.5H9a6.75 6.75 0 0 1 0-13.5h10.19l-4.72-4.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
  
  const CounterClockwiseIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path fillRule="evenodd" d="M9.53 2.47a.75.75 0 0 1 0 1.06L4.81 8.25H15a6.75 6.75 0 0 1 0 13.5h-3a.75.75 0 0 1 0-1.5h3a5.25 5.25 0 1 0 0-10.5H4.81l4.72 4.72a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
    </svg>
  );
  
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
        isMobile={isMobile}
      />
      <Timer key={timerKey} isRunning={timerRunning} onReset={() => setTimerKey(prev => prev + 1)} />
      <div className={clsx(
        "absolute left-2 z-20",
        isMobile ? "bottom-1" : "bottom-4"
      )}>
        <FancyButton
          label={isClockwise ? 'Clockwise' : 'Counter'}
          variant="direction"
          icon={isClockwise ? <ClockwiseIcon /> : <CounterClockwiseIcon />}
          iconSize="large"
          isMobile={isMobile}
          isActive={true}
          onClick={() => {
            // Simulate spacebar press
            const event = new KeyboardEvent('keydown', {
              key: ' ',
              code: 'Space',
              keyCode: 32,
              which: 32,
              bubbles: true,
              cancelable: true
            });
            window.dispatchEvent(event);
            setIsClockwise(!isClockwise);
          }}
        />
      </div>
      
      {/* Keyboard Controls Info */}
      <div className={clsx(
        "absolute right-2 bg-black bg-opacity-50 text-white rounded-md",
        isMobile ? "bottom-1 p-1 text-[8px]" : "bottom-4 p-3 text-sm"
      )}>
        <h3 className="font-bold mb-0.5">Controls:</h3>
        <ul className="space-y-0.5">
          <li><span className="font-mono bg-gray-800 px-1 rounded">W</span> - Top face</li>
          <li><span className="font-mono bg-gray-800 px-1 rounded">A</span> - Left face</li>
          <li><span className="font-mono bg-gray-800 px-1 rounded">S</span> - Bottom face</li>
          <li><span className="font-mono bg-gray-800 px-1 rounded">D</span> - Right face</li>
          {!isMobile && (
            <>
              <li><span className="font-mono bg-gray-800 px-1 rounded">E</span> - Front face</li>
              <li><span className="font-mono bg-gray-800 px-1 rounded">Q</span> - Back face</li>
            </>
          )}
          <li><span className="font-mono bg-gray-800 px-1 rounded">Space</span> - Direction</li>
          <li><span className="font-mono bg-gray-800 px-1 rounded">Shift</span> - Undo move</li>
          {!isMobile && <li>Mouse drag - Orbit view</li>}
        </ul>
      </div>
    </div>
  );
};

export default RubiksCube;
