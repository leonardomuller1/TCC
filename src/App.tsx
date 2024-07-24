import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// pages
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* PARTE DE AUTENTICAÇÃO */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
      </Routes>
    </Router>
  );
}

export default App;
