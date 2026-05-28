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
      let originalContent = content;
      
      content = content.replace(/\(dateObj: any \/\* TODO: type Date \*\/\)/g, '(dateObj: Date | number | { seconds: number, nanoseconds: number })');
      content = content.replace(/\(prev: any\)/g, '(prev: import("../../../../src/types/community").Discussion | null)');
      content = content.replace(/\(a: any, b: any\)/g, '(a: any, b: any)'); // Actually let's just leave this or manually replace
      content = content.replace(/\(err: any\)/g, '(err: unknown)');
      content = content.replace(/project: any;/g, 'project: import("../../../../src/types/community").Project | null;');
      content = content.replace(/onSubmit: \(data: any\) => void;/g, 'onSubmit: (data: Record<string, unknown>) => void;');
      content = content.replace(/let currentRoles: any\[\] = \[\];/g, 'let currentRoles: Record<string, unknown>[] = [];');
      content = content.replace(/\(role: any\)/g, '(role: Record<string, unknown>)');
      content = content.replace(/\(data: any\)/g, '(data: Record<string, unknown>)');
      
      // We will leave the (a: any, b: any) as any for now because sorting by generic fields is tricky without exact types.

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceInDir('./renders');
console.log("Done");
