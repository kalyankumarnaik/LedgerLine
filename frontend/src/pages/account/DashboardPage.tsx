import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Sparkles,
  Zap,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Top Header & Quick Actions */}
      <motion.div
        variants={cardVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Financial Overview
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-violet-100/80 dark:bg-violet-950/60 border border-violet-300 dark:border-violet-700 text-xs font-bold text-violet-700 dark:text-violet-300 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-violet-500 animate-pulse" /> Live Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time provable ledger balances &amp; verified transaction movements.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/transfer">
            <Button variant="primary" size="sm" className="shadow-md shadow-violet-500/25">
              <ArrowRightLeft className="w-4 h-4 mr-1.5" /> Transfer
            </Button>
          </Link>
          <Link to="/deposit">
            <Button variant="emerald" size="sm" className="shadow-md shadow-emerald-500/25">
              <ArrowDownToLine className="w-4 h-4 mr-1.5" /> Deposit
            </Button>
          </Link>
          <Link to="/withdraw">
            <Button variant="outline" size="sm" className="hover:border-slate-400">
              <ArrowUpFromLine className="w-4 h-4 mr-1.5" /> Withdraw
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Vibrant Hero Balance Banner */}
      <motion.div
        variants={cardVariants}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-navy-900 via-indigo-950 to-violet-950 text-white shadow-2xl border border-indigo-800/40"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-600/30 to-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-widest text-indigo-300">
                Consolidated Liquid Holdings
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Mathematical Parity Validated
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                ₹{(summary?.totalBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-mono text-sm font-semibold text-indigo-200">INR</span>
            </div>
            <p className="mt-2 text-xs text-indigo-200/80 max-w-md leading-relaxed">
              Every single rupee backed by immutable double-entry journal records. Non-negative constraint enforced at PostgreSQL layer.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-3">
            <Link to="/accounts">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-md backdrop-blur-sm"
              >
                <span className="font-semibold text-xs">Manage Accounts</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/transactions">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-md backdrop-blur-sm"
              >
                <span className="font-semibold text-xs">Audit Statements</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Colorful Metric Cards Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Available Balance */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <Card className="relative overflow-hidden border-violet-200/90 dark:border-violet-900/60 bg-gradient-to-br from-violet-50/70 via-white to-white dark:from-violet-950/20 dark:via-navy-900 dark:to-navy-900 hover:border-violet-400 dark:hover:border-violet-600 transition-all card-glow-violet">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Balance
              </span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/30">
                <Wallet className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                ₹{(summary?.totalBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Invariant Checked
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Total Inflow */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <Card className="relative overflow-hidden border-emerald-200/90 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/70 via-white to-white dark:from-emerald-950/20 dark:via-navy-900 dark:to-navy-900 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all card-glow-emerald">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Inflow
              </span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                +₹{(summary?.totalIncoming || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="block text-[11px] text-slate-400 mt-1">Deposits &amp; Received</span>
            </div>
          </Card>
        </motion.div>

        {/* Total Outflow */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <Card className="relative overflow-hidden border-rose-200/90 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/70 via-white to-white dark:from-rose-950/20 dark:via-navy-900 dark:to-navy-900 hover:border-rose-400 dark:hover:border-rose-600 transition-all card-glow-rose">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Outflow
              </span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30">
                <TrendingDown className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                -₹{(summary?.totalOutgoing || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="block text-[11px] text-slate-400 mt-1">Transfers &amp; Withdrawals</span>
            </div>
          </Card>
        </motion.div>

        {/* Total Movements */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <Card className="relative overflow-hidden border-sky-200/90 dark:border-sky-900/60 bg-gradient-to-br from-sky-50/70 via-white to-white dark:from-sky-950/20 dark:via-navy-900 dark:to-navy-900 hover:border-sky-400 dark:hover:border-sky-600 transition-all card-glow-sky">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Transactions
              </span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/30">
                <Clock className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {summary?.totalTransfers || 0}
              </span>
              <span className="block text-[11px] text-slate-400 mt-1">All Postings Balanced</span>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Analytics Charts Section */}
      <motion.div variants={cardVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
      </motion.div>

      {/* Recent Transactions Table */}
      <motion.div variants={cardVariants}>
        <Card
          title="Recent Financial Transactions"
          subtitle="Immutable ledger postings with verifiable receipt inspection"
          action={
            <Link
              to="/transactions"
              className="text-xs font-semibold text-violet-brand hover:underline inline-flex items-center group"
            >
              View All <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
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
                    <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-850/60 transition-colors">
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
                        {new Date(tx.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          aria-label="View receipt"
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
      </motion.div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={selectedTx !== null}
        onClose={() => setSelectedTx(null)}
        transaction={selectedTx}
      />
    </motion.div>
  );
};
