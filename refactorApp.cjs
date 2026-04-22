const fs = require('fs');
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

if (!appTsx.includes('AuthContext')) {
  // Add imports
  appTsx = appTsx.replace(
    /import Home from '.\/\.\.\/renders\/pages\/Pages\/Home';/,
    "import { AuthProvider } from './contexts/AuthContext';\nimport ProtectedRoute from './components/ProtectedRoute';\nimport Login from '../renders/pages/Auth/Login/index';\n\nimport Home from './../renders/pages/Pages/Home';"
  );

  // Add AuthProvider around <Router>
  appTsx = appTsx.replace(/<Router>/, "<AuthProvider>\n      <Router>");
  appTsx = appTsx.replace(/<\/Router>/, "</Router>\n      </AuthProvider>");

  // Protect all non-home routes
  appTsx = appTsx.replace(/element=\{<([A-Za-z]+)\s?(?:[^>]*)?\/>\}/g, (match, comp) => {
    if (comp === 'Home' || comp === 'Login') {
      return match;
    }
    // Handle parameterized components if needed, though most in this file are simple wrappers.
    return `element={<ProtectedRoute><${comp} /></ProtectedRoute>}`;
  });

  // Then add the explicit Login route
  appTsx = appTsx.replace(/<Route path="\/" element=\{<Home \/>\} \/>/, "<Route path=\"/\" element={<Home />} />\n          <Route path=\"/login\" element={<Login />} />");
  
  fs.writeFileSync('src/App.tsx', appTsx);
  console.log('App.tsx updated');
}
