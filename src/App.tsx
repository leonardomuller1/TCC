import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UpdatePasswordPage from './pages/auth/UpdatePasswordPage';

import DashboardPage from './pages/DashboardPage';


function App() {
  return (
    <Router>
      <Routes>
        {/* PARTE DE AUTENTICAÇÃO */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />

        <Route path='/dashboard' element={<DashboardPage/>}/>
      </Routes>
    </Router>
  );
}

export default App;
