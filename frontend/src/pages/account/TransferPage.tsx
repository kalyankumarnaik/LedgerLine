import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { accountService } from '../../services/accountService';
import { transactionService } from '../../services/transactionService';
import { Account, Transaction } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ReceiptModal } from '../../components/ui/ReceiptModal';
import {
  ArrowRightLeft,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const TransferPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [destAccountNumber, setDestAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      const data = await accountService.getMyAccounts();
      const active = data.filter(a => a.status === 'ACTIVE');
      setAccounts(active);
      if (active.length > 0) {
        setSourceAccountId(active[0].id);
      }
    };
    fetchAccounts();
    generateIdempotencyKey();
  }, []);

  const generateIdempotencyKey = () => {
    setIdempotencyKey(`IDEMP-XFER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  };

  const selectedSource = accounts.find(a => a.id === sourceAccountId);

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please specify a positive transfer amount.');
      return;
    }

    if (selectedSource && numAmount > selectedSource.balance) {
      setError(`Insufficient available balance. You have ₹${selectedSource.balance.toLocaleString()} in this account.`);
      return;
    }

    if (!destAccountNumber.trim()) {
      setError('Please provide a destination account number.');
      return;
    }

    setConfirmModal(true);
  };

  const handleExecuteTransfer = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await transactionService.transfer({
        sourceAccountId,
        destinationAccountNumber: destAccountNumber.trim(),
        amount: parseFloat(amount),
        description: description || undefined,
        idempotencyKey,
      });

      setConfirmModal(false);
      setCompletedTx(result);
      // Reset form
      setAmount('');
      setDescription('');
      setDestAccountNumber('');
      generateIdempotencyKey();
      // Refresh accounts
      const refreshed = await accountService.getMyAccounts();
      setAccounts(refreshed.filter(a => a.status === 'ACTIVE'));
    } catch (err: any) {
      setConfirmModal(false);
      setError(err.message || 'Transfer failed. Please check account details.');
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
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Transfer Funds</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Atomic double-entry money movement with deterministic lock ordering and idempotency protection.
        </p>
      </div>

      <Card>
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleInitiate} className="space-y-5">
          {/* Source Account Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Source Account
            </label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountNumber}) — ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
            {selectedSource && (
              <span className="text-[11px] text-slate-400 block mt-1">
                Available to spend: <span className="font-bold text-slate-700 dark:text-slate-200">₹{selectedSource.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </span>
            )}
          </div>

          {/* Destination Account Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Destination Account Number
            </label>
            <input
              type="text"
              value={destAccountNumber}
              onChange={(e) => setDestAccountNumber(e.target.value)}
              placeholder="e.g. LL-CHK-88991201 or LL-SAV-10020492"
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Tip: Use demo account <code className="text-violet-500 font-bold">LL-CHK-88991201</code> (Elena Vance) to test cross-user transfer.
            </span>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Transfer Amount (INR ₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-lg font-black text-slate-900 dark:text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Transfer Note / Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Consulting fees disbursement"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
            />
          </div>

          {/* Idempotency Key Banner */}
          <div className="p-3.5 bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-violet-500" />
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-200 block">Idempotency-Key Protection</span>
                <span className="font-mono text-[10px] text-slate-400">{idempotencyKey}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={generateIdempotencyKey}
              className="text-[11px] font-semibold text-violet-brand hover:underline"
            >
              Regenerate
            </button>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            <ArrowRightLeft className="w-4 h-4 mr-2" /> Review Transfer Details
          </Button>
        </form>
      </Card>

      {/* Confirmation Modal */}
      <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title="Confirm Money Movement">
        <div className="space-y-4">
          <div className="p-4 bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 rounded-xl text-center">
            <span className="text-xs text-slate-500">You are transferring</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              ₹{parseFloat(amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-navy-800">
              <span className="text-slate-400">From Account:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedSource?.accountNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-navy-800">
              <span className="text-slate-400">To Account:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{destAccountNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-navy-800">
              <span className="text-slate-400">Idempotency Key:</span>
              <span className="font-mono text-[10px] text-slate-500">{idempotencyKey}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>Guaranteed atomic debit and credit. Overdrawing is prevented.</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setConfirmModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" loading={loading} onClick={handleExecuteTransfer} className="flex-1">
              Confirm & Post Transfer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Pop-up Receipt upon success */}
      <ReceiptModal
        isOpen={completedTx !== null}
        onClose={() => setCompletedTx(null)}
        transaction={completedTx}
      />
    </motion.div>
  );
};
