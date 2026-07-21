import { Route, Switch } from 'wouter';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
import Categories from './pages/Categories';
import Empresas from './pages/Empresas';
import Nfse from './pages/Nfse';
import Settings from './pages/Settings';

function AppRoutes() {
  const { token } = useAuthStore();

  return (
    <Switch>
      <Route path="/login">
        {token ? (
          <Dashboard />
        ) : (
          <Login />
        )}
      </Route>

      <Route path="/auth/callback" component={AuthCallback} />
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/transactions">
        <ProtectedRoute>
          <Layout>
            <Transactions />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/accounts">
        <ProtectedRoute>
          <Layout>
            <Accounts />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/categories">
        <ProtectedRoute>
          <Layout>
            <Categories />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/empresas">
        <ProtectedRoute>
          <Layout>
            <Empresas />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/nfse">
        <ProtectedRoute>
          <Layout>
            <Nfse />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/settings">
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/">
        {token ? (
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        ) : (
          <Login />
        )}
      </Route>
    </Switch>
  );
}

export default function App() {
  const { token, loadUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      loadUser();
    }
  }, [token, loadUser]);

  return <AppRoutes />;
}
