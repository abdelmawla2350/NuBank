import React from "react";

interface ProgressProps {
  value: number; // Progress value 0 to 100
  className?: string;
  indicatorClassName?: string;
}

const Progress: React.FC<ProgressProps> = ({
  value,
  className = "",
  indicatorClassName = "",
}) => {
  return (
    <div
      className={`bg-gray-200 rounded-md overflow-hidden ${className}`}
      style={{ height: 8 }}
    >
      <div
        className={`bg-blue-600 h-full transition-all duration-300 ease-in-out ${indicatorClassName}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default Progress;
