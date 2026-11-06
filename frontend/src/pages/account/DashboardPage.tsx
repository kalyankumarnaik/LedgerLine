import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { transactionService } from '../../services/transactionService';
import { DashboardSummary, Transaction } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ReceiptModal } from '../../components/ui/ReceiptModal';
import { VolumeChart } from '../../components/charts/VolumeChart';
import { IncomeExpenseChart } from '../../components/charts/IncomeExpenseChart';
import {
  Wallet,
  ArrowRightLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  ChevronRight,
  Eye,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial Overview</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time provable ledger balances & transaction movements.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/transfer">
            <Button variant="primary" size="sm">
              <ArrowRightLeft className="w-4 h-4 mr-1.5" /> Transfer
            </Button>
          </Link>
          <Link to="/deposit">
            <Button variant="emerald" size="sm">
              <ArrowDownToLine className="w-4 h-4 mr-1.5" /> Deposit
            </Button>
          </Link>
          <Link to="/withdraw">
            <Button variant="outline" size="sm">
              <ArrowUpFromLine className="w-4 h-4 mr-1.5" /> Withdraw
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Available Balance */}
        <Card className="relative overflow-hidden border-violet-100 dark:border-navy-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-brand flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ₹{(summary?.totalBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Reconciled to Ledger
            </span>
          </div>
        </Card>

        {/* Total Inflow */}
        <Card className="border-emerald-100 dark:border-navy-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Inflow
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-brand flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              +₹{(summary?.totalIncoming || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="block text-[11px] text-slate-400 mt-1">Deposits & Received</span>
          </div>
        </Card>

        {/* Total Outflow */}
        <Card className="border-slate-200 dark:border-navy-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Outflow
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-navy-850 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              -₹{(summary?.totalOutgoing || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="block text-[11px] text-slate-400 mt-1">Transfers & Withdrawals</span>
          </div>
        </Card>

        {/* Total Movements */}
        <Card className="border-slate-200 dark:border-navy-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Transactions
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-navy-850 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {summary?.totalTransfers || 0}
            </span>
            <span className="block text-[11px] text-slate-400 mt-1">All Postings Balanced</span>
          </div>
        </Card>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Transaction Volume Activity" subtitle="Rolling movement velocity">
            <VolumeChart />
          </Card>
        </div>
        <div>
          <Card title="Inflow vs Outflow" subtitle="Conservation of funds">
            <IncomeExpenseChart
              incoming={summary?.totalIncoming || 0}
              outgoing={summary?.totalOutgoing || 0}
            />
          </Card>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <Card
        title="Recent Financial Transactions"
        subtitle="Immutable ledger postings with verifiable receipt inspection"
        action={
          <Link to="/transactions" className="text-xs font-semibold text-violet-brand hover:underline inline-flex items-center">
            View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-navy-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Reference</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Accounts</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {summary?.recentTransactions && summary.recentTransactions.length > 0 ? (
                summary.recentTransactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/50 transition-colors">
                    <td className="py-3 font-mono font-medium text-slate-900 dark:text-white">
                      {tx.transactionReference}
                    </td>
                    <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">
                      {tx.transactionType}
                    </td>
                    <td className="py-3 text-slate-500 font-mono text-[11px]">
                      {tx.sourceAccountNumber ? `${tx.sourceAccountNumber.substring(0, 10)}...` : 'EXTERNAL'}
                      {' → '}
                      {tx.destinationAccountNumber ? `${tx.destinationAccountNumber.substring(0, 10)}...` : 'EXTERNAL'}
                    </td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3">
                      <Badge status={tx.status} />
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-violet-brand hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
                        title="View Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No transactions posted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={selectedTx !== null}
        onClose={() => setSelectedTx(null)}
        transaction={selectedTx}
      />
    </div>
  );
};
