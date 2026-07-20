import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CompleteProfilePage } from './pages/CompleteProfilePage';
import { RequestTripPage } from './pages/RequestTripPage';
import { TripInProgressPage } from './pages/TripInProgressPage';
import { TripHistoryPage } from './pages/TripHistoryPage';
import { WalletPage } from './pages/WalletPage';
import { DriverHomePage } from './pages/DriverHomePage';
import { DriverCompleteProfilePage } from './pages/DriverCompleteProfilePage';
import { IncomingRequestPage } from './pages/IncomingRequestPage';
import { DriverTripPage } from './pages/DriverTripPage';
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
        <Route path="/passenger" element={<RequestTripPage />} />
        <Route path="/passenger/trips/history" element={<TripHistoryPage />} />
        <Route path="/passenger/trips/:tripId" element={<TripInProgressPage />} />
        <Route path="/passenger/wallet" element={<WalletPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['driver']} requirePhone />}>
        <Route path="/driver" element={<DriverHomePage />} />
        <Route path="/driver/complete-profile" element={<DriverCompleteProfilePage />} />
        <Route path="/driver/requests/:tripId" element={<IncomingRequestPage />} />
        <Route path="/driver/trips/:tripId" element={<DriverTripPage />} />
        <Route path="/driver/trips/history" element={<TripHistoryPage />} />
        <Route path="/driver/wallet" element={<WalletPage />} />
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
