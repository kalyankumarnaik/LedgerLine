import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { accountService } from '../../services/accountService';
import { transactionService } from '../../services/transactionService';
import { Account, Transaction } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ReceiptModal } from '../../components/ui/ReceiptModal';
import {
  ArrowDownToLine,
  ShieldCheck,
  AlertCircle,
  Building,
  KeyRound,
  Sparkles,
} from 'lucide-react';

export const DepositPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      const data = await accountService.getMyAccounts();
      const active = data.filter((a) => a.status === 'ACTIVE');
      setAccounts(active);
      if (active.length > 0) setAccountId(active[0].id);
    };
    fetchAccounts();
    generateKey();
  }, []);

  const generateKey = () => {
    setIdempotencyKey(
      `IDEMP-DEP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    );
  };

  const handleAddAmount = (addVal: number) => {
    const current = parseFloat(amount || '0');
    setAmount((current + addVal).toFixed(2));
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please provide a positive deposit amount.');
      return;
    }

    try {
      setLoading(true);
      const res = await transactionService.deposit({
        accountId,
        amount: numAmount,
        description: description || 'External funding deposit',
        idempotencyKey,
      });

      setCompletedTx(res);
      setAmount('');
      setDescription('');
      generateKey();
      // refresh account balances
      const data = await accountService.getMyAccounts();
      setAccounts(data.filter((a) => a.status === 'ACTIVE'));
    } catch (err: any) {
      setError(err.message || 'Deposit failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Deposit Funds
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            <Sparkles className="w-3 h-3 text-emerald-500" /> Reserve Backed
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Fund your account securely. Balanced against the LedgerLine Central Clearing Reserve.
        </p>
      </div>

      <Card className="border border-emerald-200/80 dark:border-navy-800 card-glow-emerald">
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Accounting Invariant Notice */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
          <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>Authorized Funding Simulation Model</span>
          </div>
          <p className="leading-relaxed">
            In strict compliance with double-entry principles, deposits debit the Reserve Clearing Account (
            <code className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
              SYS-CLEARING-INR-001
            </code>
            ) and credit your account. Money is never created out of thin air.
          </p>
        </div>

        <form onSubmit={handleDeposit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Select Destination Account
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountNumber}) — Current Balance: ₹
                  {acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Deposit Amount (INR ₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000.00"
                required
                className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              {[1000, 5000, 10000, 25000, 50000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddAmount(val)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors"
                >
                  +₹{val.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Deposit Source / Reference Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Salary direct deposit or wire transfer"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-200 block">
                  SHA-256 Idempotency Protection
                </span>
                <span className="font-mono text-[10px] text-slate-400">{idempotencyKey}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={generateKey}
              className="text-[11px] font-semibold text-emerald-600 hover:underline"
            >
              Regenerate
            </button>
          </div>

          <Button
            type="submit"
            variant="emerald"
            size="lg"
            loading={loading}
            className="w-full shadow-lg shadow-emerald-500/25 py-3.5 text-base"
          >
            <ArrowDownToLine className="w-4.5 h-4.5 mr-2" /> Complete Deposit
          </Button>
        </form>
      </Card>

      <ReceiptModal
        isOpen={completedTx !== null}
        onClose={() => setCompletedTx(null)}
        transaction={completedTx}
      />
    </motion.div>
  );
};
