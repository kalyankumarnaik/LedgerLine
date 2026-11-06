import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import { AppLayout } from './components/layout/AppLayout';
import { RoleGate } from './components/layout/RoleGate';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';

// Account Holder Pages
import { DashboardPage } from './pages/account/DashboardPage';
import { AccountsPage } from './pages/account/AccountsPage';
import { AccountDetailPage } from './pages/account/AccountDetailPage';
import { TransferPage } from './pages/account/TransferPage';
import { DepositPage } from './pages/account/DepositPage';
import { WithdrawPage } from './pages/account/WithdrawPage';
import { TransactionHistoryPage } from './pages/account/TransactionHistoryPage';
import { StatementsPage } from './pages/account/StatementsPage';
import { NotificationsPage } from './pages/account/NotificationsPage';
import { ProfilePage } from './pages/account/ProfilePage';

// Administrator Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AccountManagementPage } from './pages/admin/AccountManagementPage';
import { FailedAttemptsPage } from './pages/admin/FailedAttemptsPage';
import { RiskMonitoringPage } from './pages/admin/RiskMonitoringPage';
import { ReconciliationCenterPage } from './pages/admin/ReconciliationCenterPage';
import { AdjustmentApprovalsPage } from './pages/admin/AdjustmentApprovalsPage';
import { AuditEventsPage } from './pages/admin/AuditEventsPage';

// Auditor Pages
import { AuditorDashboardPage } from './pages/auditor/AuditorDashboardPage';
import { LedgerExplorerPage } from './pages/auditor/LedgerExplorerPage';
import { IntegrityVerificationPage } from './pages/auditor/IntegrityVerificationPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Account Holder Routes */}
              <Route element={<RoleGate allowedRoles={['ROLE_ACCOUNT_HOLDER', 'ROLE_ADMIN', 'ROLE_AUDITOR']} />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/accounts" element={<AccountsPage />} />
                  <Route path="/accounts/:id" element={<AccountDetailPage />} />
                  <Route path="/transfer" element={<TransferPage />} />
                  <Route path="/deposit" element={<DepositPage />} />
                  <Route path="/withdraw" element={<WithdrawPage />} />
                  <Route path="/transactions" element={<TransactionHistoryPage />} />
                  <Route path="/statements" element={<StatementsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
              </Route>

              {/* Administrator Routes */}
              <Route element={<RoleGate allowedRoles={['ROLE_ADMIN']} />}>
                <Route element={<AppLayout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/users" element={<UserManagementPage />} />
                  <Route path="/admin/accounts" element={<AccountManagementPage />} />
                  <Route path="/admin/transactions" element={<TransactionHistoryPage />} />
                  <Route path="/admin/failed-attempts" element={<FailedAttemptsPage />} />
                  <Route path="/admin/risk" element={<RiskMonitoringPage />} />
                  <Route path="/admin/reconciliation" element={<ReconciliationCenterPage />} />
                  <Route path="/admin/adjustments" element={<AdjustmentApprovalsPage />} />
                  <Route path="/admin/audit-events" element={<AuditEventsPage />} />
                </Route>
              </Route>

              {/* Auditor Routes */}
              <Route element={<RoleGate allowedRoles={['ROLE_AUDITOR', 'ROLE_ADMIN']} />}>
                <Route element={<AppLayout />}>
                  <Route path="/auditor/dashboard" element={<AuditorDashboardPage />} />
                  <Route path="/auditor/ledger" element={<LedgerExplorerPage />} />
                  <Route path="/auditor/integrity" element={<IntegrityVerificationPage />} />
                  <Route path="/auditor/reconciliation" element={<ReconciliationCenterPage />} />
                  <Route path="/auditor/failed-attempts" element={<FailedAttemptsPage />} />
                  <Route path="/auditor/audit-events" element={<AuditEventsPage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
