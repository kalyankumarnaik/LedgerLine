import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { accountService } from '../../services/accountService';
import { transactionService } from '../../services/transactionService';
import { Account, Statement, Transaction } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ReceiptModal } from '../../components/ui/ReceiptModal';
import {
  Wallet,
  Download,
  ArrowRightLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  Eye,
  Sliders,
  CheckCircle,
} from 'lucide-react';

export const AccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [statement, setStatement] = useState<Statement | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyLimit, setDailyLimit] = useState<number>(100000);
  const [perTxnLimit, setPerTxnLimit] = useState<number>(50000);
  const [limitSaved, setLimitSaved] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [acc, stmt, txs] = await Promise.all([
        accountService.getAccountById(id),
        accountService.getStatement(id),
        transactionService.getTransactions(id),
      ]);
      setAccount(acc);
      setStatement(stmt);
      setTransactions(txs);
      if (acc.dailyLimit) setDailyLimit(acc.dailyLimit);
      if (acc.perTransactionLimit) setPerTxnLimit(acc.perTransactionLimit);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpdateLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await accountService.updateLimits(id, { dailyLimit, perTransactionLimit: perTxnLimit });
      setLimitSaved(true);
      setTimeout(() => setLimitSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCsv = async () => {
    if (!id) return;
    const blob = await accountService.exportStatementCsv(id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statement-${account?.accountNumber || id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading account details...</div>;
  }

  if (!account) {
    return <div className="p-8 text-center text-rose-500">Account not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-brand">{account.accountType}</span>
            <Badge status={account.status} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{account.name}</h1>
          <span className="font-mono text-sm text-slate-400">{account.accountNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="w-4 h-4 mr-1.5" /> Export Statement CSV
          </Button>
          <Link to="/transfer">
            <Button variant="primary" size="sm">
              <ArrowRightLeft className="w-4 h-4 mr-1.5" /> Transfer Funds
            </Button>
          </Link>
        </div>
      </div>

      {/* Account Balance Banner */}
      <div className="p-6 bg-gradient-to-r from-navy-900 via-navy-850 to-violet-950 text-white rounded-2xl shadow-fintech border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">Materialized Account Balance</span>
          <div className="text-4xl font-black tracking-tight mt-1">
            ₹{account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mt-2">
            <ShieldCheck className="w-4 h-4" /> Reconciled against {statement?.entries?.length || 0} ledger postings
          </span>
        </div>
        <div className="text-right sm:border-l border-white/10 sm:pl-6 text-xs text-slate-300 space-y-1">
          <div><span className="text-slate-400">Total Credits:</span> ₹{statement?.totalCredits?.toLocaleString('en-IN') || 0}</div>
          <div><span className="text-slate-400">Total Debits:</span> ₹{statement?.totalDebits?.toLocaleString('en-IN') || 0}</div>
          <div><span className="text-slate-400">Currency:</span> {account.currency}</div>
        </div>
      </div>

      {/* Grid: Transaction Limits configuration & statement breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Limits configuration */}
        <Card title="Transaction Limits" subtitle="Safety and compliance limits">
          <form onSubmit={handleUpdateLimits} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Daily Outgoing Limit (₹)
              </label>
              <input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                min="0"
                step="1000"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Per-Transaction Limit (₹)
              </label>
              <input
                type="number"
                value={perTxnLimit}
                onChange={(e) => setPerTxnLimit(Number(e.target.value))}
                min="0"
                step="1000"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
              />
            </div>
            <Button type="submit" variant="primary" size="sm" className="w-full">
              {limitSaved ? <CheckCircle className="w-4 h-4 mr-1 text-emerald-300" /> : <Sliders className="w-4 h-4 mr-1" />}
              {limitSaved ? 'Limits Updated' : 'Save Limits'}
            </Button>
          </form>
        </Card>

        {/* Ledger Entries Table */}
        <div className="lg:col-span-2">
          <Card title="Ledger Postings with Running Balances" subtitle="Audit records directly computed from the double-entry ledger">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-navy-800 text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {statement?.entries && statement.entries.length > 0 ? (
                    statement.entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/50">
                        <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                          {new Date(entry.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2.5">
                          <Badge status={entry.entryType} />
                        </td>
                        <td className={`py-2.5 font-bold ${entry.entryType === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                          {entry.entryType === 'CREDIT' ? '+' : '-'}₹{entry.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 font-mono font-bold text-slate-900 dark:text-white">
                          ₹{entry.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No ledger postings found for this account.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <ReceiptModal
        isOpen={selectedTx !== null}
        onClose={() => setSelectedTx(null)}
        transaction={selectedTx}
      />
    </div>
  );
};
