import AppRoutes from './routes';
import { AuthSessionBoundary } from './context/AuthContext';
import { useData } from './context/DataContext';

export default function App() {
  const { currentUser } = useData();
  return <AuthSessionBoundary currentUser={currentUser}><AppRoutes /></AuthSessionBoundary>;
}
