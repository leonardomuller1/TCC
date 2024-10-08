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
import CompetitorAnalysis from './pages/CompetitorAnalysisPage';
import MetricsPage from './pages/MetricsPage';
import ConfigurationPage from './pages/ConfigurationPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';

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
          <Route path="/concorrentes" element={<CompetitorAnalysis />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/financeiro" element={<FinancialsPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/andamento" element={<MetricsPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/configuracao" element={<ConfigurationPage />} />
        </Route>

        {/* ADMIN TELAS */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
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
