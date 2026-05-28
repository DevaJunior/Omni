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
          const newItems = response.data.filter(p => !prev.find(ext => ext.id === p.id));
          return [...prev, ...newItems];
        });
      } else {
        setProjects(response.data);
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

  // Add the button
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
      const response = await articleService.getArticlesPaginated(6, isLoadMore ? lastVisible : null);
      if (isLoadMore) {
        setArticles(prev => {
          const newItems = response.data.filter(p => !prev.find(ext => ext.id === p.id));
          return [...prev, ...newItems];
        });
      } else {
        setArticles(response.data);
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

  // Articles doesn't use communityService usually, but wait, `articleService.getArticlesPaginated`. It works.
  // Add the button
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

function paginateSearchPage() {
  let content = fs.readFileSync('renders/pages/Pages/Search/index.tsx', 'utf8');
  
  // Replace the render to slice based on visibleCount and add a Load More button
  content = content.replace(
    /const \[loading, setLoading\] = useState\(false\);/g,
    `const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);`
  );

  content = content.replace(
    /setResults\(data\);/g,
    `setResults(data);
      setVisibleCount(10);`
  );
  
  content = content.replace(
    /\{results\.map\(\(res/g,
    `{results.slice(0, visibleCount).map((res`
  );

  content = content.replace(
    /<\/div>\s*<\/div>\s*\)\s*}\s*<\/div>/g,
    `  </div>
            </div>
          )
        }
        
        {results.length > visibleCount && (
          <button 
            className="btn-secondary" 
            onClick={() => setVisibleCount(prev => prev + 10)}
            style={{ width: '100%', padding: '12px', marginTop: '24px', display: 'flex', justifyContent: 'center' }}
          >
            Carregar Mais Resultados
          </button>
        )}
      </div>`
  );

  fs.writeFileSync('renders/pages/Pages/Search/index.tsx', content, 'utf8');
}

try {
  paginateProjectsTab();
  console.log('ProjectsTab paginated');
  paginateArticlesTab();
  console.log('ArticlesTab paginated');
  paginateSearchPage();
  console.log('Search paginated');
} catch (e) {
  console.error(e);
}
