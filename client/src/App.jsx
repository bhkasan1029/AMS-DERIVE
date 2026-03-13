import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
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
            <Header />
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
