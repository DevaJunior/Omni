const fs = require('fs');

function paginateFeedTab() {
  let content = fs.readFileSync('renders/fragments/Community/FeedTab/index.tsx', 'utf8');
  
  // Add state variables
  content = content.replace(
    /const \[loading, setLoading\] = useState\(true\);/g,
    `const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);`
  );

  // Update fetchDiscussions
  content = content.replace(
    /const fetchDiscussions = async \(\) => {[\s\S]*?finally {[\s\S]*?setLoading\(false\);[\s\S]*?}[\s\S]*?};/g,
    `const fetchDiscussions = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const response = await communityService.getDiscussionsPaginated(5, isLoadMore ? lastVisible : null);
      if (isLoadMore) {
        setPosts(prev => {
          const newPosts = response.data.filter(p => !prev.find(ext => ext.id === p.id));
          return [...prev, ...newPosts];
        });
      } else {
        setPosts(response.data);
      }
      
      setLastVisible(response.lastDoc);
      setHasMore(response.data.length === 5 && response.lastDoc !== null);
    } catch (error) {
      console.error("Erro ao carregar feed:", error);
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
    }
  };`
  );

  // Add Load More button
  content = content.replace(
    /\{filteredPosts\.length === 0 \? \([\s\S]*?\) : \([\s\S]*?<\/div>[\s\S]*?\)\}/g,
    `{filteredPosts.length === 0 ? (
          <EmptyStateSearch />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredPosts.map(p => (
              <div key={p.id}>{/* placeholder para n quebrar regex */}</div>
            )).slice(0,0)}
            {filteredPosts.map((post) => (
              <div key={post.id} className="feed-post-card">
                <div className="post-header">
                  <img 
                    src={(post as any).avatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent((post as any).author || 'User')}\`} 
                    alt={(post as any).author} 
                    className="post-avatar"
                    onClick={() => handleOpenThread(post.id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div className="post-meta">
                    <h3 onClick={() => handleOpenThread(post.id)} style={{ cursor: 'pointer' }}>
                      {(post as any).author}
                      <span className="post-role"> • {(post as any).role}</span>
                    </h3>
                    <span className="post-time">{formatTimeAgo((post as any).date)}</span>
                  </div>
                  <ShareMenu
                    title={(post as any).title || "Discussão na Comunidade Omni"}
                    text={(post as any).content}
                    url={\`\${window.location.origin}/discussion/\${post.id}\`}
                  />
                </div>
                <div className="post-content" onClick={() => handleOpenThread(post.id)}>
                  {(post as any).title && <h4>{(post as any).title}</h4>}
                  <p>{(post as any).content}</p>
                  
                  {((post as any).tags?.some || (() => false)) && (post as any).tags.length > 0 && (
                    <div className="post-tags">
                      {(post as any).tags.map((tag: string, i: number) => (
                        <span key={i} className="post-tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="post-actions">
                  <button 
                    className={\`action-btn \${(post as any).likedBy?.includes(currentUser?.uid) ? 'liked' : ''}\`}
                    onClick={() => handleVote(post.id)}
                  >
                    <Heart size={18} className={(post as any).likedBy?.includes(currentUser?.uid) ? 'fill-current' : ''} />
                    <span>{(post as any).likes || 0}</span>
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => handleOpenThread(post.id)}
                  >
                    <MessageSquare size={18} />
                    <span>{(post as any).comments || 0}</span>
                  </button>
                  {currentUser?.uid === (post as any).authorId && (
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => confirmDelete(post.id)}
                      title="Excluir postagem"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {hasMore && !searchQuery && (
              <button 
                onClick={() => fetchDiscussions(true)} 
                disabled={loadingMore}
                className="btn-primary"
                style={{ alignSelf: 'center', marginTop: '16px' }}
              >
                {loadingMore ? 'Carregando...' : 'Carregar mais'}
              </button>
            )}
          </div>
        )}`
  );
  
  fs.writeFileSync('renders/fragments/Community/FeedTab/index.tsx', content, 'utf8');
}

try {
  paginateFeedTab();
  console.log('FeedTab paginated');
} catch (e) {
  console.error(e);
}
