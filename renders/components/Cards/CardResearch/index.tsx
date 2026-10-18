import React from 'react';
import './styles.css';
import { normalizeImageUrl, handleImageError, DEFAULT_IMAGES } from '../../../../src/utils/imageUtils';

export interface FeaturedArticleData {
  id: string | number;
  image: string;
  category: string;
  title: string;
  desc: string;
}

interface CardResearchProps {
  article: FeaturedArticleData;
  onReadMore: (id: string | number) => void;
  style?: React.CSSProperties;
  maxLines?: number;
}

const CardResearch: React.FC<CardResearchProps> = ({ article, onReadMore, style, maxLines = 4 }) => {
  const imageUrl = normalizeImageUrl(article.image, DEFAULT_IMAGES.research);

  return (
    <article className="cmmt-visual-card" style={style}>
      <div className="cmmt-visual-image">
        <img
          src={imageUrl}
          alt={article.title}
          loading="lazy"
          onError={(e) => handleImageError(e, DEFAULT_IMAGES.researchFallback)}
        />
        <span className="cmmt-visual-badge">{article.category}</span>
      </div>
      <div className="cmmt-visual-info">
        <h4>{article.title}</h4>
        <p style={{ WebkitLineClamp: maxLines }}>{article.desc}</p>
        <button
          className="cmmt-btn-read-more"
          onClick={() => onReadMore(article.id)}
        >
          Leia mais &rarr;
        </button>
      </div>
    </article>
  );
};

export default CardResearch;
