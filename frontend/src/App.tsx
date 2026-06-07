import { useEffect, useState } from 'react';
import Map from './Map';
import { getStoredSession, storeSession, clearSession, logout, type AuthState } from './auth/authClient';
import { AuthPanel } from './components/AuthPanel';
import { NavigationBar } from './components/NavigationBar';
import { AboutPage } from './components/AboutPage';

type AppPage = 'home' | 'about';

function getPageFromHash(): AppPage {
  return window.location.hash === '#about' ? 'about' : 'home';
}

function App() {
  const [session, setSession] = useState<AuthState | null>(() => getStoredSession());
  const [isAuthOpen, setIsAuthOpen] = useState(() => !getStoredSession());
  const [page, setPage] = useState<AppPage>(() => getPageFromHash());

  useEffect(() => {
    const handleHashChange = () => setPage(getPageFromHash());

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAuthenticated = (nextSession: AuthState) => {
    storeSession(nextSession);
    setSession(nextSession);
  };

  const handleLogout = async () => {
    const currentSession = session;
    clearSession();
    setSession(null);
    setIsAuthOpen(true);

    if (currentSession?.refreshToken) {
      await logout(currentSession.refreshToken).catch(() => undefined);
    }
  };

  return (
    <div className='w-screen h-screen overflow-hidden bg-[#020508]'>
      <NavigationBar
        user={session?.user ?? null}
        onLogin={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />
      <Map
        key={session?.accessToken ?? 'anonymous-map'}
        accessToken={session?.accessToken}
        onAuthRequired={() => setIsAuthOpen(true)}
      />
      {page === 'about' && <AboutPage />}
      <AuthPanel
        open={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
}

export default App;
