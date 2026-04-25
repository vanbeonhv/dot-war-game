import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import DotWarGame from './pages/DotWarGame';

function App() {
  return (
    <Router basename='/dot-war-game/'>
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
