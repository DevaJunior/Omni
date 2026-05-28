const fs = require('fs');

function paginateProjectsTab() {
  let content = fs.readFileSync('renders/fragments/Community/ProjectsTab/index.tsx', 'utf8');
  
  content = content.replace(
    /const \[loading, setLoading\] = useState\(true\);/g,
    `const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);`
  );

  content = content.replace(
    /const fetchProjects = async \(\) => {[\s\S]*?finally {[\s\S]*?setLoading\(false\);[\s\S]*?}[\s\S]*?};/g,
    `const fetchProjects = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const response = await communityService.getProjectsPaginated(6, isLoadMore ? lastVisible : null);
      if (isLoadMore) {
        setProjects(prev => {
          const newItems = response.data.filter(p => !prev.find((ext: any) => ext.id === p.id));
          return [...prev, ...newItems] as any;
        });
      } else {
        setProjects(response.data as any);
      }
      
      setLastVisible(response.lastDoc);
      setHasMore(response.data.length === 6 && response.lastDoc !== null);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
    }
  };`
  );

  content = content.replace(
    /<\/div>\s*\{\s*filteredProjects\.length === 0/g,
    `</div>
      
      {hasMore && !searchQuery && (
        <button 
          className="btn-primary" 
          onClick={() => fetchProjects(true)}
          disabled={loadingMore}
          style={{ width: '100%', padding: '12px', marginTop: '16px', display: 'flex', justifyContent: 'center' }}
        >
          {loadingMore ? 'Carregando...' : 'Carregar Mais Projetos'}
        </button>
      )}
      
      {filteredProjects.length === 0`
  );
  
  fs.writeFileSync('renders/fragments/Community/ProjectsTab/index.tsx', content, 'utf8');
}

function paginateArticlesTab() {
  let content = fs.readFileSync('renders/fragments/Community/ArticlesTab/index.tsx', 'utf8');
  
  content = content.replace(
    /const \[loading, setLoading\] = useState\(true\);/g,
    `const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);`
  );

  content = content.replace(
    /const fetchArticles = async \(\) => {[\s\S]*?finally {[\s\S]*?setLoading\(false\);[\s\S]*?}[\s\S]*?};/g,
    `const fetchArticles = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const response = await communityService.getArticlesPaginated(6, isLoadMore ? lastVisible : null);
      if (isLoadMore) {
        setArticles(prev => {
          const newItems = response.data.filter(p => !prev.find((ext: any) => ext.id === p.id));
          return [...prev, ...newItems] as any;
        });
      } else {
        setArticles(response.data as any);
      }
      
      setLastVisible(response.lastDoc);
      setHasMore(response.data.length === 6 && response.lastDoc !== null);
    } catch (error) {
      console.error("Erro ao carregar artigos:", error);
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
    }
  };`
  );

  content = content.replace(
    /<\/div>\s*\{\s*filteredArticles\.length === 0/g,
    `</div>
      
      {hasMore && !searchQuery && (
        <button 
          className="btn-primary" 
          onClick={() => fetchArticles(true)}
          disabled={loadingMore}
          style={{ width: '100%', padding: '12px', marginTop: '16px', display: 'flex', justifyContent: 'center' }}
        >
          {loadingMore ? 'Carregando...' : 'Carregar Mais Artigos'}
        </button>
      )}
      
      {filteredArticles.length === 0`
  );
  
  fs.writeFileSync('renders/fragments/Community/ArticlesTab/index.tsx', content, 'utf8');
}

try {
  paginateProjectsTab();
  console.log('ProjectsTab paginated');
  paginateArticlesTab();
  console.log('ArticlesTab paginated');
} catch (e) {
  console.error(e);
}
