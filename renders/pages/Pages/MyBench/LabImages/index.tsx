import React from 'react';
import './styles.css';

export interface LabImage {
  id: string;
  url: string;
  alt: string;
}

interface LabImagesProps {
  images?: LabImage[];
  totalImagesCount?: number;
  onViewAllImages?: () => void;
  onViewImage?: (id: string) => void;
}

const defaultImages: LabImage[] = [
  {
    id: '1',
    url: '/src/assets/wallapapers/wpp_cience_000.png',
    alt: 'Cells'
  }
];

const LabImages: React.FC<LabImagesProps> = ({
  images = defaultImages,
  totalImagesCount = 14,
  onViewAllImages,
  onViewImage
}) => {
  // Only display up to 2 images directly
  const displayImages = images.slice(0, 2);
  // Calculate remaining count (assuming the API returns a total count)
  const remainingCount = totalImagesCount > 2 ? totalImagesCount - 2 : 0;

  return (
    <section className="mybench-section">
      <div className="mybench-section-header">
        <h2>Imagens do Lab</h2>
      </div>
      <div className="mybench-images-grid">
        {displayImages.map(img => (
          <div 
            key={img.id} 
            className="lab-image-box"
            onClick={() => onViewImage?.(img.id)}
            style={{ cursor: onViewImage ? 'pointer' : 'default' }}
          >
            <img src={img.url} alt={img.alt} />
          </div>
        ))}
        
        {/* Placeholder if there is less than 2 images and we want to keep the grid layout */}
        {displayImages.length < 2 && (
          <div className="lab-image-box">
            <div className="lab-image-placeholder"></div>
          </div>
        )}

        {/* More photos box */}
        <div 
          className="lab-image-box lab-image-more"
          onClick={onViewAllImages}
          style={{ cursor: onViewAllImages ? 'pointer' : 'default' }}
        >
          <span>+{remainingCount} Fotos</span>
        </div>
      </div>
    </section>
  );
};

export default LabImages;
