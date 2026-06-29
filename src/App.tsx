import { isStaticMode } from '@/api/client'
import { Toaster } from '@/components/ui/toaster'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import PageNotFound from './lib/PageNotFound'
import { AuthProvider } from '@/lib/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import LessonCreator from './pages/LessonCreator'
import Slides from './pages/Slides'
import Grading from './pages/Grading'
import Agenda from './pages/Agenda'
import AIAssistant from './pages/AIAssistant'
import Organization from './pages/Organization'
import Trends from './pages/Trends'
import Financial from './pages/Financial'
import Avatar from './pages/Avatar'
import ActivityGenerator from './pages/ActivityGenerator'
import Whiteboard from './pages/Whiteboard'
import NeuralMap from './pages/NeuralMap'
import StudentTracking from './pages/StudentTracking'
import TeacherCatalog from './pages/TeacherCatalog'
import TeacherStore from './pages/TeacherStore'
import Commissions from './pages/Commissions'

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/interno/cadastro" element={<Cadastro />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
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
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
