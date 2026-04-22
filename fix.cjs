const fs = require('fs');

const files = [
  'renders/fragments/Community/ArticlesTab/index.tsx',
  'renders/fragments/Community/FeedTab/index.tsx',
  'renders/fragments/Community/ProjectsTab/index.tsx',
  'renders/pages/Init/UserProfile/index.tsx',
  'renders/pages/Pages/Community/ArticleDetail/index.tsx',
  'renders/pages/Pages/Community/DiscussionDetail/index.tsx',
  'renders/pages/Pages/Community/ProjectDetail/index.tsx',
  'renders/pages/Pages/Lab/Lab/index.tsx',
  'renders/pages/Pages/Learn/Learn/index.tsx',
  'renders/pages/Pages/Learn/NoteDetail/index.tsx',
  'renders/widgets/Inventory/index.tsx',
  'src/lib/firebase/seed.ts'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');

  // Types
  content = content.replace(/\.map\(tag =>/g, '.map((tag: any) =>');
  content = content.replace(/\.map\(skill =>/g, '.map((skill: any) =>');
  content = content.replace(/\.map\(project =>/g, '.map((project: any) =>');
  content = content.replace(/\.map\(reply =>/g, '.map((reply: any) =>');
  content = content.replace(/\.map\(\(req, index\)/g, '.map((req: any, index: number)');
  content = content.replace(/\.map\(\(resp, index\)/g, '.map((resp: any, index: number)');
  content = content.replace(/\.map\(\(paragraph, idx\)/g, '.map((paragraph: any, idx: number)');

  // React imports fix
  if (content.includes('useEffect') || content.includes('useState')) {
    content = content.replace(/import React(?:, \{[^}]*\})? from 'react';/, "import React, { useState, useEffect } from 'react';");
    content = content.replace(/import React from 'react';/, "import React, { useState, useEffect } from 'react';");
  }

  // Unused Loading fixes
  if (f.includes('ArticlesTab') && content.includes('const [loading')) {
    content = content.replace(/(const \[loading, setLoading\] = useState\(true\);)/, "$1\n  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando Artigos...</div>;");
  }
  if (f.includes('Lab/Lab/index.tsx') && content.includes('const [loading')) {
    content = content.replace(/(const \[loading, setLoading\] = useState\(true\);)/, "$1\n  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando Bancada...</div>;");
  }
  if (f.includes('Learn/Learn/index.tsx') && content.includes('const [loading')) {
    content = content.replace(/(const \[loading, setLoading\] = useState\(true\);)/, "$1\n  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando Estudos...</div>;");
  }
  if (f.includes('Inventory/index.tsx') && content.includes('const [loading')) {
    content = content.replace(/(const \[loading, setLoading\] = useState\(true\);)/, "$1\n  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando Inventário...</div>;");
  }

  // Unused category Lab
  if (f.includes('Lab/Lab/index.tsx')) {
    content = content.replace(/getIconForTool = \(id: string, category: string\)/g, "getIconForTool = (id: string, category?: string)");
  }

  // Unused seed imports
  if (f.includes('seed.ts')) {
    content = content.replace(/import \{ collection, setDoc, doc, addDoc \} from 'firebase\/firestore';/, "import { setDoc, doc } from 'firebase/firestore';");
  }

  fs.writeFileSync(f, content);
});
console.log('Fixed types!');
