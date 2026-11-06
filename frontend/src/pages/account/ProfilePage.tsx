import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { User, ShieldCheck, Key, Lock, Mail, Calendar } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Profile & Security</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          User identity, cryptographic role assignments, and session security.
        </p>
      </div>

      <Card title="User Identification" subtitle="Verified platform identity">
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-navy-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-brand to-emerald-brand text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.fullName}</h3>
              <span className="font-mono text-xs text-slate-400">@{user?.username}</span>
              <div className="flex items-center gap-2 mt-1">
                {user?.roles?.map((r) => (
                  <Badge key={r} status={r} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-navy-850 rounded-xl">
              <span className="text-slate-400 block flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">{user?.email}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-navy-850 rounded-xl">
              <span className="text-slate-400 block flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5" /> Member Since
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Security & Authentication Controls" subtitle="OWASP-compliant safeguards">
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/60 dark:border-navy-800">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-violet-500" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Password Protection</span>
                <span className="text-slate-500 dark:text-slate-400">Hashed with BCrypt (10 rounds work factor)</span>
              </div>
            </div>
            <Badge status="ACTIVE" />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/60 dark:border-navy-800">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-emerald-500" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">JWT Token Rotation</span>
                <span className="text-slate-500 dark:text-slate-400">Stateless bearer tokens with automatic 7-day refresh rotation</span>
              </div>
            </div>
            <Badge status="ACTIVE" />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/60 dark:border-navy-800">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Account Lockout Protection</span>
                <span className="text-slate-500 dark:text-slate-400">Auto-lockout enforced after 5 failed authentication attempts</span>
              </div>
            </div>
            <Badge status="ACTIVE" />
          </div>
        </div>
      </Card>
    </div>
  );
};
