import React, { useEffect, useState } from 'react';
import { accountService } from '../../services/accountService';
import { Account, Statement } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Download, Calendar, FileText, ShieldCheck } from 'lucide-react';

export const StatementsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statement, setStatement] = useState<Statement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      const data = await accountService.getMyAccounts();
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccountId(data[0].id);
      }
    };
    fetchAccounts();
  }, []);

  const fetchStatement = async () => {
    if (!selectedAccountId) return;
    try {
      setLoading(true);
      const data = await accountService.getStatement(
        selectedAccountId,
        fromDate ? new Date(fromDate).toISOString() : undefined,
        toDate ? new Date(toDate).toISOString() : undefined
      );
      setStatement(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatement();
  }, [selectedAccountId]);

  const handleExportCsv = async () => {
    if (!selectedAccountId) return;
    const blob = await accountService.exportStatementCsv(
      selectedAccountId,
      fromDate ? new Date(fromDate).toISOString() : undefined,
      toDate ? new Date(toDate).toISOString() : undefined
    );
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statement-${statement?.accountNumber || 'account'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Account Statements</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Provable financial statements derived directly from the immutable double-entry ledger.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={!statement}>
          <Download className="w-4 h-4 mr-1.5" /> Export Official CSV
        </Button>
      </div>

      {/* Account & Date Controls Card */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Select Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="primary" size="sm" onClick={fetchStatement} loading={loading}>
            Generate Statement
          </Button>
        </div>
      </Card>

      {/* Statement Header Summary */}
      {statement && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Opening Balance</span>
            <span className="block text-xl font-black text-slate-900 dark:text-white mt-1">
              ₹{statement.openingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </Card>

          <Card className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Total Credits (+)</span>
            <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              ₹{statement.totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </Card>

          <Card className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Total Debits (-)</span>
            <span className="block text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
              ₹{statement.totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </Card>

          <Card className="text-center bg-violet-50/50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-900/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">Closing Balance</span>
            <span className="block text-xl font-black text-violet-700 dark:text-violet-200 mt-1">
              ₹{statement.closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </Card>
        </div>
      )}

      {/* Statement Ledger Postings Table */}
      <Card title="Statement Ledger Entries" subtitle="Chronological running balance audit trail">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-navy-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Date & Time</th>
                <th className="pb-3 font-semibold">Entry ID</th>
                <th className="pb-3 font-semibold">Classification</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {statement?.entries && statement.entries.length > 0 ? (
                statement.entries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/50">
                    <td className="py-3 text-slate-500 font-mono text-[11px]">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 font-mono text-slate-400 text-[10px]">
                      {e.id.substring(0, 8)}...
                    </td>
                    <td className="py-3">
                      <Badge status={e.entryType} />
                    </td>
                    <td className={`py-3 font-bold ${e.entryType === 'CREDIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {e.entryType === 'CREDIT' ? '+' : '-'}₹{e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                      ₹{e.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No transactions recorded for the chosen period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
