import React, { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import './styles.css';

export interface CardOption {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
}

interface CardButtonOptionsProps {
  options: CardOption[];
}

const CardButtonOptions: React.FC<CardButtonOptionsProps> = ({ options }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (!options || options.length === 0) return null;

  return (
    <div className="card-btn-options-wrapper" ref={menuRef}>
      <button 
        className="card-btn-options-trigger" 
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }} 
      > 
        <MoreVertical size={20} /> 
      </button>

      {open && (
        <div className="card-btn-options-dropdown">
          {options.map((option, index) => (
            <button 
              key={index} 
              className={`card-btn-options-item ${option.danger ? 'danger' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                option.onClick();
              }}
            >
              {option.icon && <span className="card-btn-options-icon">{option.icon}</span>}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardButtonOptions;
