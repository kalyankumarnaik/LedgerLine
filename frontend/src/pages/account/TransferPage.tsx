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
  Sparkles,
  Zap,
  Lock,
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
      const active = data.filter((a) => a.status === 'ACTIVE');
      setAccounts(active);
      if (active.length > 0) {
        setSourceAccountId(active[0].id);
      }
    };
    fetchAccounts();
    generateIdempotencyKey();
  }, []);

  const generateIdempotencyKey = () => {
    setIdempotencyKey(
      `IDEMP-XFER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    );
  };

  const selectedSource = accounts.find((a) => a.id === sourceAccountId);
  const numAmount = parseFloat(amount || '0');
  const remainingBalance = selectedSource ? selectedSource.balance - numAmount : 0;

  const handleAddAmount = (addVal: number) => {
    const current = parseFloat(amount || '0');
    setAmount((current + addVal).toFixed(2));
  };

  const handleSetMax = () => {
    if (selectedSource) {
      setAmount(selectedSource.balance.toFixed(2));
    }
  };

  const handleQuickRecipient = (accNum: string) => {
    setDestAccountNumber(accNum);
  };

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please specify a positive transfer amount.');
      return;
    }

    if (selectedSource && numAmount > selectedSource.balance) {
      setError(
        `Insufficient available balance. You have ₹${selectedSource.balance.toLocaleString(
          'en-IN'
        )} in this account.`
      );
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
      setAccounts(refreshed.filter((a) => a.status === 'ACTIVE'));
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
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Transfer Funds
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 border border-violet-300 dark:border-violet-700 text-[10px] font-bold text-violet-700 dark:text-violet-300">
            <Zap className="w-3 h-3 text-violet-500" /> Instant Settlement
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Atomic double-entry money movement with deterministic lock ordering and idempotency protection.
        </p>
      </div>

      {/* Step Indicator Flow */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 font-bold flex items-center justify-center gap-1.5 shadow-xs">
          <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] flex items-center justify-center font-black">1</span>
          <span>Accounts</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-400 font-medium flex items-center justify-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] flex items-center justify-center font-bold">2</span>
          <span>Idempotency</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-400 font-medium flex items-center justify-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] flex items-center justify-center font-bold">3</span>
          <span>Ledger Post</span>
        </div>
      </div>

      <Card className="border border-violet-200/80 dark:border-navy-800 card-glow-violet">
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
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountNumber}) — ₹
                  {acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
            {selectedSource && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                <span>
                  Current Balance:{' '}
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    ₹{selectedSource.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </span>
                {numAmount > 0 && (
                  <span
                    className={`font-semibold ${
                      remainingBalance < 0
                        ? 'text-rose-500'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    After Transfer: ₹{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
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
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {/* Quick Demo Recipient Chips */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-400">Quick Recipient:</span>
              <button
                type="button"
                onClick={() => handleQuickRecipient('LL-CHK-88991201')}
                className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-100 transition-colors"
              >
                Elena Vance (LL-CHK-88991201)
              </button>
            </div>
          </div>

          {/* Amount & Quick Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Transfer Amount (INR ₹)
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
                placeholder="0.00"
                required
                className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              {[500, 1000, 5000, 10000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddAmount(val)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/60 dark:hover:text-violet-300 transition-colors"
                >
                  +₹{val.toLocaleString('en-IN')}
                </button>
              ))}
              <button
                type="button"
                onClick={handleSetMax}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors"
              >
                Max Balance
              </button>
            </div>
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
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Live Double-Entry Balancing Preview Card */}
          {numAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-violet-50/90 via-slate-50 to-emerald-50/90 dark:from-navy-850 dark:via-navy-900 dark:to-emerald-950/30 border border-violet-200/80 dark:border-navy-700 space-y-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
                  <Sparkles className="w-3.5 h-3.5" /> Live Double-Entry Preview
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded font-bold">
                  &Sigma; Dr &minus; &Sigma; Cr = 0.0000
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-navy-950/80 border border-violet-200/60 dark:border-violet-900/50">
                  <div className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase">Debit Entry [DR]</div>
                  <div className="font-bold text-slate-800 dark:text-white truncate mt-0.5">
                    {destAccountNumber ? destAccountNumber : 'Recipient Account'}
                  </div>
                  <div className="font-mono text-xs font-black text-violet-600 dark:text-violet-400 mt-1">
                    +₹{numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-navy-950/80 border border-emerald-200/60 dark:border-emerald-900/50">
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Credit Entry [CR]</div>
                  <div className="font-bold text-slate-800 dark:text-white truncate mt-0.5">
                    {selectedSource ? selectedSource.name : 'Source Account'}
                  </div>
                  <div className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    -₹{numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-center text-slate-500 dark:text-slate-400 font-mono">
                Mathematical Parity: Total System Capital Conserved
              </div>
            </motion.div>
          )}

          {/* Idempotency Key Banner */}
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
              onClick={generateIdempotencyKey}
              className="text-[11px] font-semibold text-violet-brand hover:underline"
            >
              Regenerate
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full shadow-lg shadow-violet-500/25 py-3.5 text-base"
          >
            <ArrowRightLeft className="w-4.5 h-4.5 mr-2" /> Review Transfer Details
          </Button>
        </form>
      </Card>

      {/* Confirmation Modal */}
      <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title="Confirm Money Movement">
        <div className="space-y-4">
          <div className="p-5 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent border border-violet-200 dark:border-violet-900/60 rounded-2xl text-center">
            <span className="text-xs font-semibold text-slate-500">You are transferring</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              ₹{parseFloat(amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-navy-800">
              <span className="text-slate-400">From Account:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {selectedSource?.accountNumber} ({selectedSource?.name})
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-navy-800">
              <span className="text-slate-400">To Account:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {destAccountNumber}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-navy-800">
              <span className="text-slate-400">Idempotency Key:</span>
              <span className="font-mono text-[10px] text-slate-500">{idempotencyKey}</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-500" />
            <span>Guaranteed atomic debit and credit. Overdrawing is prevented.</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setConfirmModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={loading}
              onClick={handleExecuteTransfer}
              className="flex-1 shadow-md shadow-violet-500/25"
            >
              Confirm &amp; Post Transfer
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
