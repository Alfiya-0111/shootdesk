import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import AddOrder from './pages/AddOrder'
import Calendar from './pages/Calendar'
import Clients from './pages/Clients'
import Team from './pages/Team'
import Settings from './pages/Settings'
import SubscriptionPage from './pages/SubscriptionPage'
import ReferralPage from './pages/ReferralPage'
import AnalyticsPage from './pages/AnalyticsPage'  // ✅ Yeh add kiya
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected App Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/orders" element={<Orders />} />
            <Route path="/app/orders/add" element={<AddOrder />} />
            <Route path="/app/orders/edit/:id" element={<AddOrder />} />
            <Route path="/app/calendar" element={<Calendar />} />
            <Route path="/app/clients" element={<Clients />} />
            <Route path="/app/team" element={<Team />} />
            <Route path="/app/settings" element={<Settings />} />
            <Route path="/app/subscription" element={<SubscriptionPage />} />
            <Route path="/app/referral" element={<ReferralPage />} />
            <Route path="/app/analytics" element={<AnalyticsPage />} />  // ✅ Yeh line add karo
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App