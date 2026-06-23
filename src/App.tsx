import { isStaticMode } from '@/api/client'
import { Toaster } from '@/components/ui/toaster'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LessonCreator from './pages/LessonCreator';
import Slides from './pages/Slides';
import Grading from './pages/Grading';
import Agenda from './pages/Agenda';
import AIAssistant from './pages/AIAssistant';
import Organization from './pages/Organization';
import Trends from './pages/Trends';
import Financial from './pages/Financial';
import Avatar from './pages/Avatar';

import ActivityGenerator from './pages/ActivityGenerator';
import Whiteboard from './pages/Whiteboard';
import NeuralMap from './pages/NeuralMap';
import StudentTracking from './pages/StudentTracking';
import TeacherCatalog from './pages/TeacherCatalog';
import TeacherStore from './pages/TeacherStore';
import Commissions from './pages/Commissions';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth()

  if (!isStaticMode && (isLoadingPublicSettings || isLoadingAuth)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isStaticMode && authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/lesson-creator" element={<LessonCreator />} />
        <Route path="/slides" element={<Slides />} />
        <Route path="/grading" element={<Grading />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/organization" element={<Organization />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/financial" element={<Financial />} />
        <Route path="/avatar" element={<Avatar />} />

        <Route path="/activities" element={<ActivityGenerator />} />
        <Route path="/whiteboard" element={<Whiteboard />} />
        <Route path="/neural-map" element={<NeuralMap />} />
        <Route path="/students" element={<StudentTracking />} />
        <Route path="/catalog" element={<TeacherCatalog />} />
        <Route path="/store" element={<TeacherStore />} />
        <Route path="/commissions" element={<Commissions />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App