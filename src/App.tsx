import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NewAnalysisPage } from '@/pages/NewAnalysisPage';
import { AnalysisResultsPage } from '@/pages/AnalysisResultsPage';
import { RequirementDetailPage } from '@/pages/RequirementDetailPage';
import { PricingPage } from '@/pages/PricingPage';
import { AccountPage } from '@/pages/AccountPage';
import { UsagePage } from '@/pages/UsagePage';
import { HelpPage } from '@/pages/HelpPage';
import { DemoResultsPage } from '@/pages/DemoResultsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/demo" element={<DemoResultsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-analysis"
            element={
              <ProtectedRoute>
                <NewAnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis/:documentId"
            element={
              <ProtectedRoute>
                <AnalysisResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis/:documentId/requirement/:requirementId"
            element={
              <ProtectedRoute>
                <RequirementDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usage"
            element={
              <ProtectedRoute>
                <UsagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <HelpPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
