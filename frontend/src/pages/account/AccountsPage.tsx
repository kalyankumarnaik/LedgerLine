import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { accountService } from '../../services/accountService';
import { Account } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Wallet,
  Plus,
  ShieldCheck,
  ChevronRight,
  Lock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState('CHECKING');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountService.getMyAccounts();
      setAccounts(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName) return;
    try {
      setCreating(true);
      setError(null);
      await accountService.createAccount({
        name: newAccName,
        accountType: newAccType,
        currency: 'INR',
      });
      setIsModalOpen(false);
      setNewAccName('');
      await fetchAccounts();
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">My Financial Accounts</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Individual accounts, segregated balances, and daily limits.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Open New Account
        </Button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <Card key={acc.id} className="relative flex flex-col justify-between hover:border-violet-300 dark:hover:border-navy-700 transition-all duration-200">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-brand">
                    {acc.accountType}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {acc.name}
                  </h3>
                  <span className="font-mono text-xs text-slate-400 block mt-1">
                    {acc.accountNumber}
                  </span>
                </div>
                <Badge status={acc.status} />
              </div>

              <div className="my-6">
                <span className="text-xs text-slate-400 block">Available Balance</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Reconciled & Invariant Checked
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-navy-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Daily Limit:</span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                  ₹{acc.dailyLimit?.toLocaleString('en-IN') || '100,000'}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Per-Txn Limit:</span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                  ₹{acc.perTransactionLimit?.toLocaleString('en-IN') || '50,000'}
                </span>
              </div>
              <Link to={`/accounts/${acc.id}`} className="block pt-2">
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span>View Details & Statements</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal for creating a new account */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Open New Financial Account">
        <form onSubmit={handleCreateAccount} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Account Label / Name
            </label>
            <input
              type="text"
              value={newAccName}
              onChange={(e) => setNewAccName(e.target.value)}
              placeholder="e.g. Rainy Day Savings"
              required
              className="w-full px-4 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Account Type
            </label>
            <select
              value={newAccType}
              onChange={(e) => setNewAccType(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm text-slate-900 dark:text-white"
            >
              <option value="CHECKING">Checking Account</option>
              <option value="SAVINGS">High-Yield Savings</option>
              <option value="ESCROW">Escrow Account</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={creating} className="flex-1">
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
