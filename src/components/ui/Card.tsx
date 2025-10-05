import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  hover = false, 
  padding = 'md' 
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div 
      className={cn(
        'bg-white rounded-xl shadow-md',
        hover && 'hover:shadow-lg transition-shadow duration-300',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;