const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Skip LabTeamTab because I just manually fixed it
      if (fullPath.includes('LabTeamTab')) continue;
      // Skip App.tsx to avoid complexity, I'll do it manually
      if (fullPath.endsWith('App.tsx')) continue;

      if (content.includes('alert(')) {
        let originalContent = content;

        // Import toast store if not present
        if (!content.includes('useToastStore')) {
           const relPath = fullPath.includes('renders\\pages') 
             ? '../../../../src/stores/toastStore' 
             : (fullPath.includes('renders\\fragments') ? '../../../../../src/stores/toastStore' : (
                fullPath.includes('renders\\modals') ? '../../../../src/stores/toastStore' : (
                  fullPath.includes('renders\\widgets') ? '../../../../src/stores/toastStore' : '../../src/stores/toastStore'
                )
             ));
           
           content = `import { useToastStore } from '${relPath}';\n` + content;
        }

        // We need to inject `const { addToast } = useToastStore();` inside the main component function.
        // A naive regex approach is risky, but since these are React components, they usually have a signature like:
        // const ComponentName = () => { or const ComponentName: React.FC = () => {
        if (!content.includes('const { addToast } = useToastStore();')) {
          content = content.replace(/(const \w+(?:\s*:\s*React\.FC(?:<[^>]+>)?\s*)?\s*=\s*(?:async\s*)?\([^)]*\)\s*(?::\s*[^=]+)?\s*=>\s*\{)/, "$1\n  const { addToast } = useToastStore();");
        }

        // Replace alert("...") with addToast("...", "info")
        content = content.replace(/alert\((`[^`]+`|'[^']+'|"[^"]+")\)/g, (match, stringLiteral) => {
          // If it contains "erro" or "falha", make it error type, else success or info
          let type = 'info';
          let strLower = stringLiteral.toLowerCase();
          if (strLower.includes('erro') || strLower.includes('falha') || strLower.includes('preencha')) {
            type = 'error';
          } else if (strLower.includes('sucesso')) {
            type = 'success';
          }
          return `addToast(${stringLiteral}, '${type}')`;
        });

        if (content !== originalContent) {
          fs.writeFileSync(fullPath, content);
        }
      }
    }
  }
}

replaceInDir('./renders');
console.log("Done alerts");
