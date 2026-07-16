import React from 'react';

export interface FeaturedArticleData {
  id: string | number;
  image: string;
  category: string;
  title: string;
  desc: string;
}

interface CardFeaturedArticleProps {
  article: FeaturedArticleData;
  onReadMore: (id: string | number) => void;
}

const CardFeaturedArticle: React.FC<CardFeaturedArticleProps> = ({ article, onReadMore }) => {
  return (
    <article className="cmmt-visual-card">
      <div className="cmmt-visual-image">
        <img src={article.image} alt={article.title} />
        <span className="cmmt-visual-badge">{article.category}</span>
      </div>
      <div className="cmmt-visual-info">
        <h4>{article.title}</h4>
        <p>{article.desc}</p>
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

export default CardFeaturedArticle;
