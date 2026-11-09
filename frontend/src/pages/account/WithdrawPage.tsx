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
      const active = data.filter(a => a.status === 'ACTIVE');
      setAccounts(active);
      if (active.length > 0) setAccountId(active[0].id);
    };
    fetchAccounts();
    generateKey();
  }, []);

  const generateKey = () => {
    setIdempotencyKey(`IDEMP-WDL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  };

  const selectedAcc = accounts.find(a => a.id === accountId);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please provide a positive withdrawal amount.');
      return;
    }

    if (selectedAcc && numAmount > selectedAcc.balance) {
      setError(`Cannot withdraw ₹${numAmount.toLocaleString()}. Available balance is ₹${selectedAcc.balance.toLocaleString()}. Negative balances are forbidden.`);
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
      setAccounts(data.filter(a => a.status === 'ACTIVE'));
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
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Withdraw Funds</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Disburse funds with server-enforced sufficiency and non-negative balance constraints.
        </p>
      </div>

      <Card>
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
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountNumber}) — Balance: ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
            {selectedAcc && (
              <span className="text-[11px] text-slate-400 block mt-1">
                Max available: <span className="font-bold text-slate-700 dark:text-slate-200">₹{selectedAcc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Withdrawal Amount (INR ₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000.00"
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-lg font-black text-slate-900 dark:text-white"
            />
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
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-violet-500" />
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-200 block">Idempotency Protection</span>
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

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            <ArrowUpFromLine className="w-4 h-4 mr-2" /> Disburse Withdrawal
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
