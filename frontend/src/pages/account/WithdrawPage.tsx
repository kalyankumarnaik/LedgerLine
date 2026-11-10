import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { accountService } from '../../services/accountService';
import { transactionService } from '../../services/transactionService';
import { Account, Transaction } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ReceiptModal } from '../../components/ui/ReceiptModal';
import {
  ArrowUpFromLine,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

export const WithdrawPage: React.FC = () => {
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
      `IDEMP-WDL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    );
  };

  const selectedAcc = accounts.find((a) => a.id === accountId);
  const numAmount = parseFloat(amount || '0');
  const remaining = selectedAcc ? selectedAcc.balance - numAmount : 0;

  const handleAddAmount = (addVal: number) => {
    const current = parseFloat(amount || '0');
    setAmount((current + addVal).toFixed(2));
  };

  const handleSetMax = () => {
    if (selectedAcc) {
      setAmount(selectedAcc.balance.toFixed(2));
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please provide a positive withdrawal amount.');
      return;
    }

    if (selectedAcc && numAmount > selectedAcc.balance) {
      setError(
        `Cannot withdraw ₹${numAmount.toLocaleString(
          'en-IN'
        )}. Available balance is ₹${selectedAcc.balance.toLocaleString(
          'en-IN'
        )}. Negative balances are forbidden by database constraint.`
      );
      return;
    }

    try {
      setLoading(true);
      const res = await transactionService.withdraw({
        accountId,
        amount: numAmount,
        description: description || 'External withdrawal disbursement',
        idempotencyKey,
      });

      setCompletedTx(res);
      setAmount('');
      setDescription('');
      generateKey();
      const data = await accountService.getMyAccounts();
      setAccounts(data.filter((a) => a.status === 'ACTIVE'));
    } catch (err: any) {
      setError(err.message || 'Withdrawal rejected.');
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
            Withdraw Funds
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-[10px] font-bold text-rose-700 dark:text-rose-300">
            <ShieldAlert className="w-3 h-3 text-rose-500" /> Non-Negative Enforced
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Disburse funds with server-enforced sufficiency and non-negative balance constraints.
        </p>
      </div>

      <Card className="border border-slate-200/90 dark:border-navy-800 card-glow-rose">
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleWithdraw} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Select Source Account
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountNumber}) — Balance: ₹
                  {acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
            {selectedAcc && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                <span>
                  Max available:{' '}
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    ₹{selectedAcc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </span>
                {numAmount > 0 && (
                  <span
                    className={`font-semibold ${
                      remaining < 0 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Remaining: ₹{remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Withdrawal Amount (INR ₹)
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
                placeholder="5000.00"
                required
                className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              {[500, 1000, 2000, 5000, 10000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddAmount(val)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 transition-colors"
                >
                  +₹{val.toLocaleString('en-IN')}
                </button>
              ))}
              <button
                type="button"
                onClick={handleSetMax}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 transition-colors"
              >
                Max Balance
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Withdrawal Reason / Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. ATM cash withdrawal or external vendor payment"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
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
              className="text-[11px] font-semibold text-violet-brand hover:underline"
            >
              Regenerate
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full shadow-lg shadow-violet-500/25 py-3.5 text-base"
          >
            <ArrowUpFromLine className="w-4.5 h-4.5 mr-2" /> Disburse Withdrawal
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
