import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Account } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Building2, Lock, Unlock, ShieldAlert } from 'lucide-react';

export const AccountManagementPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllAccounts();
      setAccounts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleFreeze = async (accountId: string) => {
    try {
      await adminService.freezeAccount(accountId);
      await fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnfreeze = async (accountId: string) => {
    try {
      await adminService.unfreezeAccount(accountId);
      await fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Account Management</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Global financial account directory, materialized balances, and administrative freeze controls.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-navy-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Account Number</th>
                <th className="pb-3 font-semibold">Label & Owner</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Balance</th>
                <th className="pb-3 font-semibold text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/50">
                  <td className="py-3 font-mono font-medium text-slate-900 dark:text-white">
                    {acc.accountNumber}
                  </td>
                  <td className="py-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{acc.name}</span>
                    <span className="text-[11px] text-slate-400">{acc.ownerName}</span>
                  </td>
                  <td className="py-3">
                    <span className="font-semibold text-violet-600 dark:text-violet-400">{acc.accountType}</span>
                  </td>
                  <td className="py-3">
                    <Badge status={acc.status} />
                  </td>
                  <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                    ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-right">
                    {acc.accountType !== 'SYSTEM_CLEARING' && (
                      acc.status === 'ACTIVE' ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleFreeze(acc.id)}
                        >
                          <Lock className="w-3.5 h-3.5 mr-1" /> Freeze Account
                        </Button>
                      ) : (
                        <Button
                          variant="emerald"
                          size="sm"
                          onClick={() => handleUnfreeze(acc.id)}
                        >
                          <Unlock className="w-3.5 h-3.5 mr-1" /> Unfreeze
                        </Button>
                      )
                    )}
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
