import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage.tsx'
import UpdatePasswordPage from './pages/auth/UpdatePasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RedirectIfAuthenticated from './components/auth/RedirectIfAuthenticatedt.tsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas de autenticação */}
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuthenticated>
              <RegisterPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/update-password"
          element={
            <RedirectIfAuthenticated>
              <UpdatePasswordPage />
            </RedirectIfAuthenticated>
          }
        />
        {/* Rotas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<DashboardPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
