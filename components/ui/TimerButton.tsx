import React from 'react';
import clsx from 'clsx';

interface TimerButtonProps {
  isRunning: boolean;
  time: number;
  onClick?: () => void;
  className?: string;
}

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-12 h-12"
  >
    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
  </svg>
);

const TimerButton: React.FC<TimerButtonProps> = ({
  isRunning,
  time,
  onClick,
  className,
}) => {
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
    }
    onClick?.();
  };

  return (
    <div
      className={clsx(
        // Base styles
        'aspect-square',
        'min-h-[80px]',
        'flex flex-col items-center justify-center',
        'relative cursor-pointer select-none',
        'p-4',
        'backdrop-blur-sm',
        'border',
        'rounded-2xl',
        // Conditional styles based on running state
        !isRunning ? [
          'bg-orange-400',
          'border-orange-300',
          'text-gray-900',
          'hover:bg-orange-500',
        ] : [
          'bg-gray-100/95 dark:bg-gray-800/95',
          'border-gray-200 dark:border-gray-700',
          'hover:bg-gray-200/95 dark:hover:bg-gray-700/95',
        ],
        // Shadow for depth
        'shadow-sm',
        // Transition
        'transition-all duration-200',
        // Custom className
        className
      )}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      data-active={isRunning}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {!isRunning ? (
        // Play mode - large centered icon
        <div className="absolute inset-0 flex items-center justify-center -mt-2">
          <PlayIcon />
        </div>
      ) : (
        // Timer mode - centered timer display
        <div className="flex items-center justify-center h-full">
          <span className="text-2xl font-mono font-medium text-gray-500 dark:text-gray-300">
            {formatTime()}
          </span>
        </div>
      )}

      {/* Bottom area with LED and text */}
      <div className="absolute bottom-[0.93rem] left-0 right-0 flex items-center justify-between px-4">
        {/* LED Indicator */}
        <span
          className={clsx(
            'block w-2.5 h-2.5 rounded-full',
            'transition-all duration-200',
            isRunning
              ? 'bg-orange-400 shadow-sm'
              : 'bg-gray-900'
          )}
        />
        
        {/* Text right-justified - only show in play mode */}
        {!isRunning && (
          <span className="text-xs font-medium uppercase">
            Play
          </span>
        )}
      </div>
    </div>
  );
};

export default TimerButton; 