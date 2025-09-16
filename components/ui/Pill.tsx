
import React from 'react';

interface PillProps {
  colorClass: string;
  children: React.ReactNode;
}

const Pill: React.FC<PillProps> = ({ colorClass, children }) => {
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colorClass}`}>
      {children}
    </span>
  );
};

export default Pill;
