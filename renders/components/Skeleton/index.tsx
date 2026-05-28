import React from 'react';
import './styles.css';

interface SkeletonProps {
  type?: 'text' | 'title' | 'avatar' | 'card' | 'thumbnail';
  width?: string | number;
  height?: string | number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ type = 'text', width, height, className = '' }) => {
  const styles: React.CSSProperties = {
    width: width || (type === 'avatar' ? '48px' : type === 'title' ? '60%' : '100%'),
    height: height || (type === 'avatar' ? '48px' : type === 'title' ? '24px' : type === 'card' ? '200px' : type === 'thumbnail' ? '120px' : '16px')
  };

  return (
    <div 
      className={`skeleton-loader skeleton-${type} ${className}`} 
      style={styles}
    />
  );
};

export default Skeleton;
