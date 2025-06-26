import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import DotWarGame from './pages/DotWarGame';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/dot-war' element={<DotWarGame />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
