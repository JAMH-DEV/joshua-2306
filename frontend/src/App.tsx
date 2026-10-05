import { Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
// Se comprueba al entrar a la ruta, después de que login guardó el token.
function ProtectedDashboard() {
  return localStorage.getItem('token') ? <Dashboard /> : <Navigate to="/login" replace />
}
function App() {
  return <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Auth />} />
    <Route path="/dashboard" element={<ProtectedDashboard />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
}
export default App
