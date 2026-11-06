import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Users, UserX, UserCheck, Shield } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">User Management</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Platform identities, assigned cryptographic roles, and account state controls.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-navy-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Roles</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Created</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/50">
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
                    >
                      {u.enabled ? (
                        <>
                          <UserX className="w-3.5 h-3.5 mr-1 text-rose-500" /> Disable
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Enable
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
