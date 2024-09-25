import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '@/stores/useAuthStore';

const AdminProtectedRoute = () => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();


  if (user && user.is_master) {
    if (location.pathname !== '/admin') {
      return <Navigate to="/admin" />;
    }
    return <Outlet />;
  }

  return <Navigate to="/entrar" />;
};

export default AdminProtectedRoute;
