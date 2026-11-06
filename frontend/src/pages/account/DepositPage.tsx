import React, { useEffect, useState } from 'react';
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
      const active = data.filter(a => a.status === 'ACTIVE');
      setAccounts(active);
      if (active.length > 0) setAccountId(active[0].id);
    };
    fetchAccounts();
    generateKey();
  }, []);

  const generateKey = () => {
    setIdempotencyKey(`IDEMP-DEP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
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
      setAccounts(data.filter(a => a.status === 'ACTIVE'));
    } catch (err: any) {
      setError(err.message || 'Deposit failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Deposit Funds</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Fund your account securely. Balanced against the LedgerLine Central Clearing Reserve.
        </p>
      </div>

      <Card>
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Accounting Invariant Notice */}
        <div className="mb-6 p-4 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50 text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <div className="font-bold text-violet-800 dark:text-violet-300 flex items-center gap-1.5">
            <Building className="w-4 h-4" />
            <span>Authorized Funding Simulation Model</span>
          </div>
          <p>
            In strict compliance with double-entry principles, deposits debit the Reserve Clearing Account (<code className="font-mono text-violet-600 dark:text-violet-400">SYS-CLEARING-INR-001</code>) and credit your account. Money is never created out of thin air.
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
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountNumber}) — Current Balance: ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Deposit Amount (INR ₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 10000.00"
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-lg font-black text-slate-900 dark:text-white"
            />
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
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-500" />
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-200 block">Idempotency Protection</span>
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

          <Button type="submit" variant="emerald" size="lg" loading={loading} className="w-full">
            <ArrowDownToLine className="w-4 h-4 mr-2" /> Complete Deposit
          </Button>
        </form>
      </Card>

      <ReceiptModal
        isOpen={completedTx !== null}
        onClose={() => setCompletedTx(null)}
        transaction={completedTx}
      />
    </div>
  );
};
