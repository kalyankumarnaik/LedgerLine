import React, { useEffect, useState } from 'react';
import { auditorService } from '../../services/auditorService';
import { LedgerEntry } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FileStack, Search, ShieldCheck } from 'lucide-react';

export const LedgerExplorerPage: React.FC = () => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const data = await auditorService.getLedgerEntries();
        setEntries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const filtered = entries.filter(
    (e) =>
      e.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.entryType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Immutable Ledger Explorer</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Read-only window into append-only PostgreSQL financial postings protected by database triggers.
        </p>
      </div>

      <Card>
        <div className="relative mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by account number or entry ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-navy-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Posting Timestamp</th>
                <th className="pb-3 font-semibold">Ledger Entry ID</th>
                <th className="pb-3 font-semibold">Target Account</th>
                <th className="pb-3 font-semibold">Entry Classification</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/50">
                  <td className="py-3 font-mono text-[11px] text-slate-400">
                    {new Date(e.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-slate-500">
                    {e.id}
                  </td>
                  <td className="py-3 font-mono font-medium text-slate-900 dark:text-white">
                    {e.accountNumber}
                  </td>
                  <td className="py-3">
                    <Badge status={e.entryType} />
                  </td>
                  <td className={`py-3 font-bold ${e.entryType === 'CREDIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {e.entryType === 'CREDIT' ? '+' : '-'}₹{e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 font-mono font-bold text-slate-900 dark:text-white text-right">
                    ₹{e.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
