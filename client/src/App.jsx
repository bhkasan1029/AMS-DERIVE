import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing/Landing';
import Register from './pages/Register/Register';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/register"
        element={
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Register />
            </main>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
