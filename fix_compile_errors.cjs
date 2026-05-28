const fs = require('fs');

function fixProjectsTab() {
  let content = fs.readFileSync('renders/fragments/Community/ProjectsTab/index.tsx', 'utf8');
  content = content.replace(/setProjects\(/g, 'setProjectsList(');
  // Also we need to make sure the fetchProjects scope is correct and fetchProjects parameter has a type? Actually fetchProjects works since I just injected it.
  content = content.replace(/p =>/g, '(p: any) =>');
  content = content.replace(/ext =>/g, '(ext: any) =>');
  fs.writeFileSync('renders/fragments/Community/ProjectsTab/index.tsx', content, 'utf8');
}

function fixArticlesTab() {
  let content = fs.readFileSync('renders/fragments/Community/ArticlesTab/index.tsx', 'utf8');
  if (!content.includes('import { articleService }')) {
    content = content.replace(
      "import { communityService } from '../../../../src/services/communityService';",
      "import { communityService } from '../../../../src/services/communityService';\nimport { articleService } from '../../../../src/services/articleService';"
    );
  }
  content = content.replace(/setArticles\(/g, 'setArticlesList(');
  content = content.replace(/p =>/g, '(p: any) =>');
  content = content.replace(/ext =>/g, '(ext: any) =>');
  fs.writeFileSync('renders/fragments/Community/ArticlesTab/index.tsx', content, 'utf8');
}

function fixSearch() {
  let content = fs.readFileSync('renders/pages/Pages/Search/index.tsx', 'utf8');
  // I created `visibleCount` and used it in the render, but TS says it's never read.
  // Wait, I replaced something weird.
  // I'll leave `visibleCount` if it's there. Actually let me look at `renders/pages/Pages/Search/index.tsx`.
}

fixProjectsTab();
fixArticlesTab();
