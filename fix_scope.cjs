const fs = require('fs');

function fixProjects() {
  let content = fs.readFileSync('renders/fragments/Community/ProjectsTab/index.tsx', 'utf8');

  // Remove fetchProjects from useEffect
  content = content.replace(/useEffect\(\(\) => \{\s*const fetchProjects = async[\s\S]*?fetchProjects\(\);\s*\}, \[\]\);/g, 
    `const fetchProjects = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const response = await communityService.getProjectsPaginated(6, isLoadMore ? lastVisible : null);
      if (isLoadMore) {
        setProjectsList(prev => {
          const newItems = response.data.filter(p => !prev.find((ext: any) => ext.id === p.id));
          return [...prev, ...newItems].map(p => ({ ...p, icon: getIconForProjectType(p.type) })) as any;
        });
      } else {
        setProjectsList(response.data.map((p: any) => ({ ...p, icon: getIconForProjectType(p.type) })) as any);
      }
      
      setLastVisible(response.lastDoc);
      setHasMore(response.data.length === 6 && response.lastDoc !== null);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);`
  );

  fs.writeFileSync('renders/fragments/Community/ProjectsTab/index.tsx', content, 'utf8');
}

function fixArticles() {
  let content = fs.readFileSync('renders/fragments/Community/ArticlesTab/index.tsx', 'utf8');

  // Remove fetchArticles from useEffect
  content = content.replace(/useEffect\(\(\) => \{\s*const fetchArticles = async[\s\S]*?fetchArticles\(\);\s*\}, \[\]\);/g, 
    `const fetchArticles = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const response = await communityService.getArticlesPaginated(6, isLoadMore ? lastVisible : null);
      if (isLoadMore) {
        setArticlesList(prev => {
          const newItems = response.data.filter(p => !prev.find((ext: any) => ext.id === p.id));
          return [...prev, ...newItems] as any;
        });
      } else {
        setArticlesList(response.data as any);
      }
      
      setLastVisible(response.lastDoc);
      setHasMore(response.data.length === 6 && response.lastDoc !== null);
    } catch (error) {
      console.error("Erro ao carregar artigos:", error);
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);`
  );

  fs.writeFileSync('renders/fragments/Community/ArticlesTab/index.tsx', content, 'utf8');
}

try {
  fixProjects();
  fixArticles();
} catch(e) {
  console.error(e);
}
