import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

//protecion routes
import RedirectIfAuthenticated from './components/auth/RedirectIfAuthenticatedt';
import ProtectedRoute from './components/auth/ProtectedRoute';

// pages auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UpdatePasswordPage from './pages/auth/UpdatePasswordPage';

//pages dashboard
import DashboardPage from './pages/DashboardPage';
import ProblemsPage from './pages/ProblemsPage';
import ClientsPage from './pages/ClientsPage';
import SolutionPage from './pages/SolutionPage';
import FinancialsPage from './pages/FinancialsPage';
import ConfigurationPage from './pages/ConfigurationPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas de autenticação */}
        <Route
          path="/entrar"
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/criar-conta"
          element={
            <RedirectIfAuthenticated>
              <RegisterPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/atualizar-senha"
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
          <Route path="/problema" element={<ProblemsPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/clientes" element={<ClientsPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/solucao" element={<SolutionPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/financeiro" element={<FinancialsPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/configuracao" element={<ConfigurationPage />} />
        </Route>

        {/* QUALQUER ROTA JOGA PARA A DASHBOARD */}
        <Route element={<ProtectedRoute />}>
          <Route path="*" element={<DashboardPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
