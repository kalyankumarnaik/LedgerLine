import React, { useEffect, useState } from 'react';
import { auditorService } from '../../services/auditorService';
import { FailedAttempt } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ShieldAlert, AlertCircle, Search } from 'lucide-react';

export const FailedAttemptsPage: React.FC = () => {
  const [attempts, setAttempts] = useState<FailedAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const data = await auditorService.getFailedAttempts();
        setAttempts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  const filtered = attempts.filter(
    (a) =>
      a.correlationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.failureReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.requestedOperation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Refused Financial Attempts Trail</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Auditable telemetry for rejected, unauthorized, or insufficient balance operations. Isolated from posted double-entry journals.
        </p>
      </div>

      <Card>
        <div className="relative mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by correlation ID, user, or refusal reason..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-navy-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Correlation ID</th>
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Operation</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Refusal Reason</th>
                <th className="pb-3 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {filtered.length > 0 ? (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/50">
                    <td className="py-3 font-mono font-medium text-slate-900 dark:text-white">
                      {a.correlationId}
                    </td>
                    <td className="py-3 font-medium text-slate-700 dark:text-slate-300">
                      {a.username}
                    </td>
                    <td className="py-3 font-bold text-violet-600 dark:text-violet-400">
                      {a.requestedOperation}
                    </td>
                    <td className="py-3 font-mono font-semibold text-slate-900 dark:text-white">
                      {a.amount ? `₹${a.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="py-3 text-rose-600 dark:text-rose-400 font-medium">
                      {a.failureReason}
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(a.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No failed attempts recorded.
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
