import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Users,
  UserX,
  UserCheck,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  KeyRound,
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: User) => {
    try {
      await adminService.updateUserStatus(user.id, !user.enabled);
      await fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const totalUsers = users.length;
  const activeAdmins = users.filter((u) => u.roles.includes('ROLE_ADMIN')).length;
  const onboardedCount = users.filter((u) => u.enabled).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              User Onboarding &amp; RBAC Control
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 border border-violet-300 dark:border-violet-700 text-[10px] font-bold text-violet-700 dark:text-violet-300">
              <Sparkles className="w-3 h-3 text-violet-500" /> Identity Matrix
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Platform identities, cryptographic role assignments, onboarding verification, and access controls.
          </p>
        </div>
      </div>

      {/* Onboarding Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-violet-200 dark:border-violet-900/60 card-glow-violet">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered</span>
            <Users className="w-5 h-5 text-violet-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{totalUsers} Users</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Provisioned with multi-role authorization</span>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-900/60 card-glow-emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Onboarded &amp; Active</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {onboardedCount} Verified
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Full Double-Entry Rights
          </span>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900/60 card-glow-amber">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Root Administrators</span>
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {activeAdmins} Bootstrapped
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Dual-Control Approval Authority</span>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-navy-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">User Identity</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Assigned Roles</th>
                <th className="pb-3 font-semibold">Onboarding</th>
                <th className="pb-3 font-semibold">Account State</th>
                <th className="pb-3 font-semibold">Provisioned</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/50 transition-colors">
                  <td className="py-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{u.fullName}</span>
                    <span className="text-[11px] font-mono text-slate-400">@{u.username}</span>
                  </td>
                  <td className="py-3 font-mono text-slate-600 dark:text-slate-300">
                    {u.email}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <Badge key={r} status={r} />
                      ))}
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge status={u.enabled ? 'VERIFIED' : 'PENDING'} />
                  </td>
                  <td className="py-3">
                    <Badge status={u.enabled ? 'ACTIVE' : 'RESTRICTED'} />
                  </td>
                  <td className="py-3 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      variant={u.enabled ? 'outline' : 'emerald'}
                      size="sm"
                      onClick={() => handleToggleStatus(u)}
                      className="text-xs"
                    >
                      {u.enabled ? (
                        <>
                          <UserX className="w-3.5 h-3.5 mr-1 text-rose-500" /> Suspend
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Activate
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
