const fs = require('fs');

const files = [
  'renders/pages/Pages/Lab/Lab/index.tsx',
  'renders/pages/Pages/Learn/Learn/index.tsx',
  'renders/fragments/Community/ArticlesTab/index.tsx',
  'renders/widgets/Inventory/index.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');

  // Find the exact loading return statement
  const loadingRegex = /^.*if \(loading\) return <div[^>]*>Carregando.*?<\/div>;(\r?\n)?/m;
  const match = content.match(loadingRegex);

  if (match) {
    // Remove it from current location
    content = content.replace(loadingRegex, '');

    // Place it right before the final return of the component main block
    // We look for "return (" which is usually the render statement.
    content = content.replace(/(\n\s*)(return\s*\()/g, (m, space, ret) => {
        return space + match[0].trim() + space + ret;
    });

    fs.writeFileSync(f, content);
    console.log('Fixed ' + f);
  }
});
