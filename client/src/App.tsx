// src/App.tsx
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import AppRoutes from './routes';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="mediconnect-theme">
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
