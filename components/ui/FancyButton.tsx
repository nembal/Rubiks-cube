import React from 'react';
import clsx from 'clsx';

interface FancyButtonProps {
  label: string;
  subtitle?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'neutral' | 'primary' | 'timer' | 'direction' | 'undo';
  icon?: React.ReactNode;
  iconSize?: 'small' | 'large';
  iconPosition?: 'bottom-right' | 'center';
  textPosition?: 'top-left' | 'bottom-right';
  isMobile?: boolean;
  size?: 'small' | 'medium' | 'large';
  isRunningTimer?: boolean;
  isMonospaceText?: boolean;
}

const FancyButton: React.FC<FancyButtonProps> = ({
  label,
  subtitle,
  isActive = false,
  onClick,
  className,
  variant = 'default',
  icon,
  iconSize = 'small',
  iconPosition = 'bottom-right',
  textPosition = 'top-left',
  isMobile = false,
  size = 'medium',
  isRunningTimer = false,
  isMonospaceText = false,
}) => {
  // When isMobile is true, we force small size
  const actualSize = isMobile ? 'small' : size;
  
  // Determine background color and styles based on variant
  const getBackgroundStyles = () => {
    if (variant === 'timer' && !isActive && !isRunningTimer) {
      return [
        'bg-orange-400',
        'border-orange-300',
        'hover:bg-orange-500',
      ];
    }
    
    return [
      'bg-gray-100/95 dark:bg-gray-800/95',
      'border-gray-200 dark:border-gray-700',
      'hover:bg-gray-200/95 dark:hover:bg-gray-700/95',
    ];
  };
  
  // Get icon color based on variant
  const getIconColor = () => {
    if (variant === 'timer' && !isActive && !isRunningTimer) {
      return 'text-gray-900'; // Black text on orange background
    }
    
    // For default, direction, undo and other variants - use the custom CSS variable
    return 'text-[--ui-text-primary]'; // Custom text color from globals.css
  };
  
  // Get the icon size based on props and size
  const getIconSizeClass = () => {
    if (actualSize === 'small') {
      return iconSize === 'large' ? 'w-4.5 h-4.5' : 'w-2.5 h-2.5';
    }
    
    if (actualSize === 'large') {
      return iconSize === 'large' ? 'w-14 h-14' : 'w-7 h-7';
    }
    
    // Medium size (default)
    return iconSize === 'large' ? 'w-12 h-12' : 'w-6 h-6';
  };
  
  // Set default icon and text position based on variant
  const getIconPosition = () => {
    if (variant === 'timer' || variant === 'direction' || variant === 'undo' || isRunningTimer) {
      return 'center';
    }
    return iconPosition;
  };
  
  const getTextPosition = () => {
    if (variant === 'timer' || variant === 'direction' || variant === 'undo' || isRunningTimer) {
      return 'bottom-right';
    }
    return textPosition;
  };
  
  // Get button dimensions based on size
  const getSizeClasses = () => {
    // Small size
    if (actualSize === 'small') {
      // Apply slightly larger height for running timer to ensure text fits
      if (isRunningTimer) {
        return [
          'min-h-[40px]',
          'p-1',
          'text-[10px]',
          'border',
        ];
      }
      
      return [
        'min-h-[40px]',
        'p-1',
        'text-[10px]',
        'border',
      ];
    }
    
    // Large size
    if (actualSize === 'large') {
      return [
        'min-h-[100px]',
        'p-5',
        'text-base',
        'border-2',
      ];
    }
    
    // Medium size (default)
    return [
      'min-h-[80px]',
      'p-4',
      'text-sm',
      'border',
    ];
  };
  
  // Get width based on size
  const getWidthClass = () => {
    if (!className?.includes('w-')) {
      if (actualSize === 'small') {
        // Slightly wider for timer display to fit the text
        if (isRunningTimer) {
          return 'w-[55px]';
        }
        return 'w-[45px]';
      }
      
      if (actualSize === 'large') {
        return 'w-[140px]';
      }
      
      return 'w-[120px]';
    }
    return '';
  };
  
  // Border radius based on size
  const getBorderRadius = () => {
    if (actualSize === 'small') {
      return 'rounded-lg';
    }
    
    if (actualSize === 'large') {
      return 'rounded-3xl';
    }
    
    return 'rounded-2xl';
  };
  
  // LED indicator size based on size
  const getLedSizeClass = () => {
    if (actualSize === 'small') {
      return 'w-1 h-1';
    }
    
    if (actualSize === 'large') {
      return 'w-3 h-3';
    }
    
    return 'w-2.5 h-2.5';
  };
  
  // LED positioning based on size
  const getLedPositioning = () => {
    if (actualSize === 'small') {
      return 'bottom-[0.15rem] px-1';
    }
    
    if (actualSize === 'large') {
      return 'bottom-[1.25rem] px-5';
    }
    
    return 'bottom-[0.93rem] px-4';
  };
  
  // Font size based on size
  const getFontSizeClass = () => {
    if (isRunningTimer) {
      return actualSize === 'small' ? 'text-[11px]' : 'text-2xl';
    }
    
    if (actualSize === 'small') {
      return 'text-[10px]';
    }
    
    if (actualSize === 'large') {
      return 'text-base';
    }
    
    return 'text-sm';
  };
  
  const actualIconPosition = getIconPosition();
  const actualTextPosition = getTextPosition();
  
  // Handle monospace text for timer
  const getTextStyles = () => {
    const baseStyles = "font-medium";
    
    // If running timer or monospace text is requested
    if (isRunningTimer || isMonospaceText) {
      return `${baseStyles} font-mono text-gray-500 dark:text-gray-300`;
    }
    
    return `${baseStyles} text-gray-500 dark:text-gray-300`;
  };
  
  // Determine if we should show the LED indicator
  const showLedIndicator = () => {
    // For small running timer, don't show LED to save space
    if (actualSize === 'small' && isRunningTimer) {
      return false;
    }
    return true;
  };
  
  return (
    <div
      className={clsx(
        // Base styles
        'aspect-square',
        ...getSizeClasses(),
        'relative cursor-pointer select-none',
        'backdrop-blur-sm',
        getBorderRadius(),
        // Background styles
        ...getBackgroundStyles(),
        // Shadow for depth
        'shadow-sm',
        // Transition
        'transition-all duration-200',
        // Width class based on size
        getWidthClass(),
        // Custom className
        className,
        // Group for hover effects
        'group'
      )}
      role="button"
      tabIndex={0}
      onClick={onClick}
      data-active={isActive}
      data-variant={variant}
      data-mobile={isMobile}
      data-size={actualSize}
      data-running-timer={isRunningTimer}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* For running timer, center text */}
      {isRunningTimer && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={clsx(
            getFontSizeClass(),
            getTextStyles()
          )}>
            {label}
          </span>
        </div>
      )}
      
      {/* Only render top-left text if that position is specified and not using small size and not running timer */}
      {actualTextPosition === 'top-left' && actualSize !== 'small' && !isRunningTimer && (
        <div className="flex flex-col gap-0.5">
          <span className={clsx(getFontSizeClass(), getTextStyles())}>
            {label}
          </span>
        </div>
      )}
      
      {/* For centered icon */}
      {actualIconPosition === 'center' && icon && !isRunningTimer && (
        <div className={clsx(
          "absolute inset-0 flex items-center justify-center",
          actualSize === 'small' ? "" : "-mt-2"
        )}>
          <div className={clsx(
            getIconSizeClass(),
            getIconColor()
          )}>
            {icon}
          </div>
        </div>
      )}
      
      {/* For bottom-right icon */}
      {actualIconPosition === 'bottom-right' && icon && !isRunningTimer && (
        <div className={clsx(
          "absolute",
          actualSize === 'small' ? "right-[4px] bottom-[4px]" : 
          actualSize === 'large' ? "right-[18px] bottom-[14px]" : "right-[13px] bottom-[10.5px]"
        )}>
          <div className={clsx(
            actualSize === 'small' ? 'w-3 h-3' : 
            actualSize === 'large' ? (iconSize === 'large' ? 'w-10 h-10' : 'w-7 h-7') :
            (iconSize === 'large' ? 'w-8 h-8' : 'w-6 h-6'),
            getIconColor()
          )}>
            {icon}
          </div>
        </div>
      )}

      {/* Bottom area with LED and optionally text */}
      {showLedIndicator() && (
        <div className={clsx(
          "absolute left-0 right-0 flex items-center justify-between",
          getLedPositioning()
        )}>
          {/* LED Indicator */}
          <span
            className={clsx(
              'block rounded-full',
              getLedSizeClass(),
              'transition-all duration-200',
              isActive || variant === 'direction' || isRunningTimer
                ? 'bg-orange-400 shadow-sm'
                : variant === 'timer' && !isActive 
                  ? 'bg-gray-900'
                  : 'bg-gray-300 dark:bg-gray-600'
            )}
          />
          
          {/* Text right-justified - only if not small size and not running timer */}
          {actualTextPosition === 'bottom-right' && actualSize !== 'small' && !isRunningTimer && (
            <span className={clsx(getFontSizeClass(), "font-medium text-gray-500 dark:text-gray-400")}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FancyButton; 