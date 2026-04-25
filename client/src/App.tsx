import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import DotWarGame from './pages/DotWarGame';

function App() {
  // For custom domain (game.huuvan.dev), use /; for GitHub Pages, use /dot-war-game/
  const basename =
    window.location.hostname === 'github.com' || window.location.hostname.endsWith('github.io')
      ? '/dot-war-game/'
      : '/';

  return (
    <Router basename={basename}>
      <Layout>
        <Routes>
          <Route path='/' element={<Navigate to='/dot-war' replace />} />
          <Route path='/dot-war' element={<DotWarGame />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
