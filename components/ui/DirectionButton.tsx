import React from 'react';
import clsx from 'clsx';

interface DirectionButtonProps {
  isClockwise: boolean;
  onClick?: () => void;
  className?: string;
}

const DirectionButton: React.FC<DirectionButtonProps> = ({
  isClockwise,
  onClick,
  className,
}) => {
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
        // Glass effect matching FancyButton
        'bg-gray-100/95 dark:bg-gray-800/95',
        'border-gray-200 dark:border-gray-700',
        'hover:bg-gray-200/95 dark:hover:bg-gray-700/95',
        // Shadow for depth
        'shadow-sm',
        // Transition
        'transition-all duration-200',
        // Custom className
        className,
        // Group for hover effects
        'group'
      )}
      role="button"
      tabIndex={0}
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
        onClick?.();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Centered icon - with no text underneath */}
      <div className="absolute inset-0 flex items-center justify-center -mt-2">
        {isClockwise ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-12 h-12 text-gray-900 dark:text-gray-200"
          >
            <path
              fillRule="evenodd"
              d="M14.47 2.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06l4.72-4.72H9a5.25 5.25 0 1 0 0 10.5h3a.75.75 0 0 1 0 1.5H9a6.75 6.75 0 0 1 0-13.5h10.19l-4.72-4.72a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-12 h-12 text-gray-900 dark:text-gray-200"
          >
            <path
              fillRule="evenodd"
              d="M9.53 2.47a.75.75 0 0 1 0 1.06L4.81 8.25H15a6.75 6.75 0 0 1 0 13.5h-3a.75.75 0 0 1 0-1.5h3a5.25 5.25 0 1 0 0-10.5H4.81l4.72 4.72a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      {/* Bottom area with LED and text */}
      <div className="absolute bottom-[0.93rem] left-0 right-0 flex items-center justify-between px-4">
        {/* LED Indicator */}
        <span className="block w-2.5 h-2.5 rounded-full bg-orange-400 shadow-sm" />
        
        {/* Text right-justified */}
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {isClockwise ? 'Clockwise' : 'Counter'}
        </span>
      </div>
    </div>
  );
};

export default DirectionButton; 