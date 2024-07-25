import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/stores/useAuthStore';

const ProtectedRoute = () => {
  const user = useAuthStore((state) => state.user);

  return user ? <Outlet /> : <Navigate to="/entrar" />;
};

export default ProtectedRoute;
