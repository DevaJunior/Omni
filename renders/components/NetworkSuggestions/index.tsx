import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityService } from '../../../src/services/communityService';
import { useAuth } from '../../../src/contexts/AuthContext';
import './styles.css';

interface NetworkSuggestionsProps {
  isMobile?: boolean;
  onFollowSuccess?: (message: string) => void;
}

const NetworkSuggestions: React.FC<NetworkSuggestionsProps> = ({ isMobile = false, onFollowSuccess }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser) {
      communityService.getSuggestedUsers(currentUser.uid).then(setSuggestedUsers);
    }
  }, [currentUser]);

  const handleFollow = async (userId: string) => {
    if (!currentUser) return;
    const success = await communityService.followUser(currentUser.uid, userId);
    if (success) {
      setSuggestedUsers(prev => prev.filter(u => u.id !== userId));
      if (onFollowSuccess) {
        onFollowSuccess("Você começou a seguir este pesquisador!");
      }
    }
  };

  return (
    <div className={`frag_sugestnetowrk-sidebar-widget ${isMobile ? 'frag_sugestnetowrk-mobile' : 'frag_sugestnetowrk-desktop'}`}>
      <div className="frag_sugestnetowrk-widget-header">
        <h2>Sugestões de Rede</h2>
      </div>
      <p className="frag_sugestnetowrk-widget-subtitle">Conecte-se com pares da sua área de pesquisa.</p>
      <div className="frag_sugestnetowrk-suggested-users">
        {suggestedUsers.length > 0 ? (
          suggestedUsers.map(user => (
            <div
              key={user.id}
              className="frag_sugestnetowrk-user-item"
              onClick={() => navigate(`/profile/${user.id}`)}
              style={{ cursor: 'pointer' }}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name || 'User'} className="frag_sugestnetowrk-user-avatar-img" />
              ) : (
                <div className="frag_sugestnetowrk-user-avatar-placeholder">
                  {user.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                </div>
              )}
              <div className="frag_sugestnetowrk-user-details">
                <p>{user.name || 'Usuário Sem Nome'}</p>
                <span>{user.headline ? user.headline.split('|')[0] : ''}</span>
              </div>
              <button
                className="frag_sugestnetowrk-btn-follow"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollow(user.id);
                }}
              >
                Seguir
              </button>
            </div>
          ))
        ) : (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Você já segue todos ou a rede está pequena.</span>
        )}
      </div>
    </div>
  );
};

export default NetworkSuggestions;