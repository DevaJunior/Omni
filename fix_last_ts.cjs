const fs = require('fs');

function replaceInFile(filePath, replacements) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [regex, replacement] of replacements) {
      content = content.replace(regex, replacement);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  } catch (err) {
    console.error('Error fixing', filePath, err.message);
  }
}

replaceInFile('renders/fragments/Community/FeedTab/index.tsx', [
  [/\.map\(p => \(\{ \.\.\.p, _searchScore: getSearchScore\(p\) \}\)\)/g, '.map((p: any) => ({ ...p, _searchScore: getSearchScore(p as any) }))']
]);

replaceInFile('renders/pages/Pages/Lab/LabProfile/index.tsx', [
  [/id: \(p as any\)\.id/g, "id: labSnap.id"]
]);

replaceInFile('src/services/bookmarkService.ts', [
  [/serverTimestamp,?/g, ""]
]);
