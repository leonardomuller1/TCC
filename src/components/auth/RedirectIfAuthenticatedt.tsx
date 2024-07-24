import { Navigate } from 'react-router-dom';
import useAuthStore from '@/stores/useAuthStore';

interface Props {
  children: React.ReactElement;
}

const RedirectIfAuthenticated: React.FC<Props> = ({ children }) => {
  const user = useAuthStore((state) => state.user);

  return user ? <Navigate to="/dashboard" /> : children;
};

export default RedirectIfAuthenticated;
