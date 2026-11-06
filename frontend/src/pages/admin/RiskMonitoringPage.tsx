import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';
import { RiskFlag } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Sparkles, ShieldAlert, CheckCircle, AlertTriangle, Eye } from 'lucide-react';

export const RiskMonitoringPage: React.FC = () => {
  const [flags, setFlags] = useState<RiskFlag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<RiskFlag[]>('/risk/flags');
      setFlags(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await apiClient.post<void>(`/risk/flags/${id}/resolve`);
      await fetchFlags();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Risk & Anomaly Engine</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Explainable rule-based anomaly detection: large transaction thresholds, rapid velocity, and repeat failed attempts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-amber-100 dark:border-navy-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Flagged Events</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {flags.length}
          </div>
        </Card>
        <Card className="border-rose-100 dark:border-navy-800">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Unresolved Flags</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {flags.filter(f => !f.resolved).length}
          </div>
        </Card>
        <Card className="border-emerald-100 dark:border-navy-800">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Reviewed & Cleared</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {flags.filter(f => f.resolved).length}
          </div>
        </Card>
      </div>

      <Card title="Anomaly Detection Events" subtitle="Human-in-the-loop review workflow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-navy-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Rule Triggered</th>
                <th className="pb-3 font-semibold">Severity</th>
                <th className="pb-3 font-semibold">Description / Evidence</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {flags.length > 0 ? (
                flags.map((flag) => (
                  <tr key={flag.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/50">
                    <td className="py-3 font-mono font-bold text-violet-600 dark:text-violet-400">
                      {flag.ruleName}
                    </td>
                    <td className="py-3">
                      <Badge status={flag.severity} />
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300 max-w-sm">
                      {flag.description}
                    </td>
                    <td className="py-3">
                      <Badge status={flag.resolved ? 'APPROVED' : 'PENDING'} />
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(flag.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      {!flag.resolved ? (
                        <Button
                          variant="emerald"
                          size="sm"
                          onClick={() => handleResolve(flag.id)}
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Mark Resolved
                        </Button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No risk flags detected.
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
