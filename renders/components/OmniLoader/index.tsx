import React from 'react';
import { FlaskConical, Atom, Dna, Sparkles } from 'lucide-react';
import './styles.css';

export interface OmniLoaderProps {
  message?: string;
  submessage?: string;
  variant?: 'fullscreen' | 'section' | 'overlay' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  showBrand?: boolean;
  showLine?: boolean;
  icon?: 'flask' | 'atom' | 'dna' | 'sparkles';
  className?: string;
}

const OmniLoader: React.FC<OmniLoaderProps> = ({
  message = 'Carregando...',
  submessage,
  variant = 'section',
  size = 'md',
  showBrand = true,
  showLine = true,
  icon = 'flask',
  className = ''
}) => {
  const getIcon = () => {
    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 26 : 20;
    switch (icon) {
      case 'atom':
        return <Atom size={iconSize} />;
      case 'dna':
        return <Dna size={iconSize} />;
      case 'sparkles':
        return <Sparkles size={iconSize} />;
      default:
        return <FlaskConical size={iconSize} />;
    }
  };

  return (
    <div
      className={`omni-loader-container variant-${variant} size-${size} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="omni-loader-visual">
        <div className="omni-loader-aura" />
        <div className="omni-loader-ring outer-ring" />
        <div className="omni-loader-ring inner-ring" />
        <div className="omni-loader-core">{getIcon()}</div>
      </div>

      {(message || submessage || showBrand) && variant !== 'inline' && (
        <div className="omni-loader-content">
          {showBrand && variant === 'fullscreen' && (
            <span className="omni-loader-brand-badge">Omni Research</span>
          )}
          {message && <h3 className="omni-loader-message">{message}</h3>}
          {submessage && <p className="omni-loader-submessage">{submessage}</p>}
          {showLine && (
            <div className="omni-loader-line">
              <div className="omni-loader-line-shimmer" />
            </div>
          )}
        </div>
      )}

      {variant === 'inline' && message && (
        <span className="omni-loader-message">{message}</span>
      )}
    </div>
  );
};

export default OmniLoader;
