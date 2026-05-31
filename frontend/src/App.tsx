import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Predictor from './pages/Predictor';
import ModelResults from './pages/ModelResults';
import Analysis from './pages/Analysis';
import Hardware from './pages/Hardware';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
          <Routes>
            <Route path="/"         element={<Dashboard />} />
            <Route path="/predict"  element={<Predictor />} />
            <Route path="/results"  element={<ModelResults />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/hardware" element={<Hardware />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
