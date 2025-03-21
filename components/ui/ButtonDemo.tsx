import React, { useState } from 'react';
import FancyButton from './FancyButton';

const SparkleIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 0L7.854 4.146L12 6L7.854 7.854L6 12L4.146 7.854L0 6L4.146 4.146L6 0Z"
      fill="currentColor"
      className="text-white/40"
    />
  </svg>
);

const ButtonDemo = () => {
  const [activeButton, setActiveButton] = useState<string>('Coral');

  const buttons = [
    { label: 'Alloy', icon: <SparkleIcon /> },
    { label: 'Ash', icon: <SparkleIcon /> },
    { label: 'Ballad', icon: <SparkleIcon /> },
    { label: 'Coral', icon: <SparkleIcon /> },
    { label: 'Echo' },
    { label: 'Fable' },
  ];

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {buttons.map((button) => (
            <FancyButton
              key={button.label}
              label={button.label}
              isActive={activeButton === button.label}
              onClick={() => setActiveButton(button.label)}
              icon={button.icon}
              className="min-h-[80px] aspect-square"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ButtonDemo; 