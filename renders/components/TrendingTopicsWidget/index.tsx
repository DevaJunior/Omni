import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { communityService } from '../../../src/services/communityService';
import './styles.css';

interface TrendingTopicsWidgetProps {
  onTopicClick: (topic: string) => void;
  className?: string;
}

const TrendingTopicsWidget: React.FC<TrendingTopicsWidgetProps> = ({ onTopicClick, className }) => {
  const [trendingTopics, setTrendingTopics] = useState<string[]>(["Carregando..."]);

  useEffect(() => {
    communityService.getTrendingTopics(5).then(setTrendingTopics);
  }, []);

  return (
    <div className={`tt-sidebar-widget ${className || ''}`}>
      <div className="tt-widget-header">
        <TrendingUp size={20} className="tt-widget-icon" />
        <h2>Tópicos em Alta</h2>
      </div>
      <ul className="tt-trending-list">
        {trendingTopics.map((topic, index) => (
          <li key={index}>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              onTopicClick(topic);
            }}>#{topic}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrendingTopicsWidget;
