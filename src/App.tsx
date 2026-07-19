import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CompleteProfilePage } from './pages/CompleteProfilePage';
import { PassengerHomePage } from './pages/PassengerHomePage';
import { DriverHomePage } from './pages/DriverHomePage';
import { AdminHomePage } from './pages/AdminHomePage';
import { RootRedirect } from './pages/RootRedirect';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/complete-profile" element={<CompleteProfilePage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['passenger']} requirePhone />}>
        <Route path="/passenger" element={<PassengerHomePage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['driver']} requirePhone />}>
        <Route path="/driver" element={<DriverHomePage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<AdminHomePage />} />
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
