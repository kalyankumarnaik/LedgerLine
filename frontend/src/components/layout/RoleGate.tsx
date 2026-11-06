import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RoleName } from '../../types';

interface RoleGateProps {
  allowedRoles?: RoleName[];
}

export const RoleGate: React.FC<RoleGateProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some(r => user.roles.includes(r))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
