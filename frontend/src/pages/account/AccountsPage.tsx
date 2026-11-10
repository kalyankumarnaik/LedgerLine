import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Cpu,
  Radio,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Sparkles,
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

  const getCardTheme = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SAVINGS':
        return {
          banner: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900',
          chipColor: 'text-emerald-200',
          badgeType: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30',
          glow: 'card-glow-emerald',
          borderHover: 'hover:border-emerald-500',
        };
      case 'ESCROW':
        return {
          banner: 'bg-gradient-to-br from-amber-600 via-orange-700 to-amber-900',
          chipColor: 'text-amber-200',
          badgeType: 'bg-amber-400/20 text-amber-200 border-amber-400/30',
          glow: 'card-glow-amber',
          borderHover: 'hover:border-amber-500',
        };
      case 'CHECKING':
      default:
        return {
          banner: 'bg-gradient-to-br from-violet-700 via-indigo-800 to-purple-950',
          chipColor: 'text-amber-300',
          badgeType: 'bg-violet-400/20 text-violet-200 border-violet-400/30',
          glow: 'card-glow-violet',
          borderHover: 'hover:border-violet-500',
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              My Financial Accounts
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-3 h-3 text-emerald-500" /> Segregated Ledgers
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Individual accounts, isolated balances, and configurable transaction limits.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="shadow-md shadow-violet-500/25 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Open New Account
        </Button>
      </div>

      {/* Accounts Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {accounts.map((acc, index) => {
          const theme = getCardTheme(acc.accountType);

          return (
            <motion.div
              key={acc.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              whileHover={{ y: -6, scale: 1.01 }}
            >
              <Card
                className={`relative overflow-hidden flex flex-col justify-between transition-all duration-200 h-full p-0 border border-slate-200/90 dark:border-navy-800 ${theme.borderHover} ${theme.glow}`}
              >
                {/* Virtual Card Graphic Top */}
                <div className={`p-5 text-white ${theme.banner} relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <Cpu className={`w-7 h-7 ${theme.chipColor}`} />
                      <Radio className="w-4 h-4 text-white/60 rotate-90" />
                    </div>
                    <span
                      className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${theme.badgeType}`}
                    >
                      {acc.accountType}
                    </span>
                  </div>

                  <div className="mt-5 relative z-10">
                    <h3 className="text-base font-bold text-white tracking-wide">{acc.name}</h3>
                    <p className="font-mono text-xs text-white/70 tracking-widest mt-0.5">
                      {acc.accountNumber}
                    </p>
                  </div>
                </div>

                {/* Card Body & Balance */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Available Balance</span>
                      <Badge status={acc.status} />
                    </div>
                    <div className="mt-1">
                      <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Reconciled to Ledger Parity
                      </span>
                    </div>
                  </div>

                  {/* Limits & Details CTA */}
                  <div className="pt-3 border-t border-slate-100 dark:border-navy-800 space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Daily Transfer Limit:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        ₹{acc.dailyLimit?.toLocaleString('en-IN') || '100,000'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Per-Txn Max:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        ₹{acc.perTransactionLimit?.toLocaleString('en-IN') || '50,000'}
                      </span>
                    </div>

                    <Link to={`/accounts/${acc.id}`} className="block pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between group hover:border-violet-400 text-xs font-semibold"
                      >
                        <span>Inspect Account Statements</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Modal for creating a new account */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Open New Financial Account">
        <form onSubmit={handleCreateAccount} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
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
              className="w-full px-4 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Account Type
            </label>
            <select
              value={newAccType}
              onChange={(e) => setNewAccType(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="CHECKING">Checking Account (Daily Operations)</option>
              <option value="SAVINGS">High-Yield Savings (Reserve)</option>
              <option value="ESCROW">Escrow Account (Dual Authorization)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={creating} className="flex-1 shadow-md shadow-violet-500/25">
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
