import React, { useEffect, useState } from 'react';
import { auditorService } from '../../services/auditorService';
import { AuditEvent } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FileCheck2, Search, User, Shield } from 'lucide-react';

export const AuditEventsPage: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await auditorService.getAuditEvents();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = events.filter(
    (e) =>
      e.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.resourceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.details && e.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.user?.username && e.user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Security Audit Event Log</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Immutable audit record of all authentication attempts, administrative interventions, and account permission modifications.
        </p>
      </div>

      <Card>
        <div className="relative mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, resource type, user, or details..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-navy-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Action</th>
                <th className="pb-3 font-semibold">Actor / User</th>
                <th className="pb-3 font-semibold">Target Resource</th>
                <th className="pb-3 font-semibold">Event Details</th>
                <th className="pb-3 font-semibold">IP Address</th>
                <th className="pb-3 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/50">
                  <td className="py-3 font-mono font-bold text-violet-600 dark:text-violet-400">
                    {e.action}
                  </td>
                  <td className="py-3 font-medium text-slate-800 dark:text-slate-200">
                    {e.user?.username || 'ANONYMOUS'}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                      {e.resourceType}: {e.resourceId || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300 max-w-sm truncate">
                    {e.details || '—'}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-slate-400">
                    {e.ipAddress || '127.0.0.1'}
                  </td>
                  <td className="py-3 text-right text-slate-400">
                    {new Date(e.createdAt).toLocaleString()}
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
