import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { transactionService } from '../../services/transactionService';
import { Transaction } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ReceiptModal } from '../../components/ui/ReceiptModal';
import { Search, Filter, Eye, ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from 'lucide-react';

export const TransactionHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await transactionService.getTransactions();
        setTransactions(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  useEffect(() => {
    let list = transactions;

    if (typeFilter !== 'ALL') {
      list = list.filter(t => t.transactionType === typeFilter);
    }

    if (statusFilter !== 'ALL') {
      list = list.filter(t => t.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        t =>
          t.transactionReference.toLowerCase().includes(q) ||
          t.sourceAccountNumber?.toLowerCase().includes(q) ||
          t.destinationAccountNumber?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    setFiltered(list);
  }, [searchTerm, typeFilter, statusFilter, transactions]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-500" />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="w-4 h-4 text-violet-500" />;
      default:
        return <ArrowRightLeft className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Transaction History</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Complete, traceable ledger records of deposits, disbursements, and account transfers.
        </p>
      </div>

      <Card>
        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by reference, account, or note..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
            >
              <option value="ALL">All Types</option>
              <option value="TRANSFER">Transfer</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="POSTED">POSTED</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-navy-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Reference</th>
                <th className="pb-3 font-semibold">Movement</th>
                <th className="pb-3 font-semibold">Source → Destination</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {filtered.length > 0 ? (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/50 transition-colors">
                    <td className="py-3 font-mono font-medium text-slate-900 dark:text-white">
                      {tx.transactionReference}
                    </td>
                    <td className="py-3 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      {getTypeIcon(tx.transactionType)}
                      <span>{tx.transactionType}</span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-500">
                      {tx.sourceAccountNumber || 'EXTERNAL'} → {tx.destinationAccountNumber || 'EXTERNAL'}
                    </td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3">
                      <Badge status={tx.status} />
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(tx.createdAt).toLocaleString()}
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
                    No transactions match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ReceiptModal
        isOpen={selectedTx !== null}
        onClose={() => setSelectedTx(null)}
        transaction={selectedTx}
      />
    </motion.div>
  );
};
