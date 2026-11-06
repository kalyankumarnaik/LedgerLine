import React, { useEffect, useState } from 'react';
import { auditorService } from '../../services/auditorService';
import { ReconciliationReport } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Scale, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, XCircle } from 'lucide-react';

export const ReconciliationCenterPage: React.FC = () => {
  const [report, setReport] = useState<ReconciliationReport | null>(null);
  const [loading, setLoading] = useState(false);

  const runAudit = async () => {
    try {
      setLoading(true);
      const data = await auditorService.getReconciliationReport();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial Reconciliation Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographic mathematical proof: Materialized account balances vs raw immutable double-entry ledger postings.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={runAudit} loading={loading}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Run Audit Verification
        </Button>
      </div>

      {/* Main Reconciliation Status Banner */}
      {report && (
        <div
          className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
            report.fullyReconciled
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold shadow-md ${
                report.fullyReconciled
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-rose-500 text-white shadow-rose-500/20'
              }`}
            >
              {report.fullyReconciled ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">
                {report.fullyReconciled ? 'Pass — 100% Invariant Verified' : 'Critical Discrepancy Alert'}
              </span>
              <h2 className="text-xl font-black tracking-tight mt-0.5">
                {report.statusMessage}
              </h2>
              <span className="text-xs font-mono opacity-70 block mt-1">
                Verified at: {new Date(report.verifiedAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-right text-xs space-y-1">
            <div>
              <span className="opacity-70">Accounts Balanced:</span>{' '}
              <span className="font-bold">{report.balancedAccountsCount} / {report.totalAccountsChecked}</span>
            </div>
            <div>
              <span className="opacity-70">Journal Parity:</span>{' '}
              <span className="font-bold">{report.balancedJournalEntriesCount} / {report.totalJournalEntriesChecked}</span>
            </div>
          </div>
        </div>
      )}

      {/* Discrepancies Table (if any) */}
      {report && report.discrepancyCount > 0 && (
        <Card title="Detected Balance Discrepancies" subtitle="Flagged accounts requiring immediate investigation">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-navy-800 text-rose-500 font-bold uppercase">
                  <th className="pb-3">Account Number</th>
                  <th className="pb-3">Label</th>
                  <th className="pb-3">Materialized</th>
                  <th className="pb-3">Ledger Derived</th>
                  <th className="pb-3 text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {report.accountDiscrepancies.map((d) => (
                  <tr key={d.accountId} className="text-rose-600 dark:text-rose-400 font-semibold">
                    <td className="py-3 font-mono">{d.accountNumber}</td>
                    <td className="py-3">{d.accountName}</td>
                    <td className="py-3 font-mono">₹{d.materializedBalance.toFixed(4)}</td>
                    <td className="py-3 font-mono">₹{d.ledgerDerivedBalance.toFixed(4)}</td>
                    <td className="py-3 font-mono text-right font-black">₹{d.variance.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Reconciliation Architecture Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Zero-Imbalance Invariant" subtitle="Accounting equation verification">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            LedgerLine guarantees that for every journal entry, the algebraic sum of postings equals zero:
            <br />
            <code className="block mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-navy-850 font-mono text-[11px] text-violet-600 dark:text-violet-400">
              ∑(Debits) - ∑(Credits) = 0.0000
            </code>
            Discrepancies are NEVER automatically overwritten. Any correction requires an explicit, multi-signature compensating adjustment transaction.
          </p>
        </Card>

        <Card title="Materialized vs Derived Balances" subtitle="Dual-verification architecture">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Account balances are materialized for sub-millisecond query performance, but every balance is provable from the immutable append-only ledger entries table:
            <br />
            <code className="block mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-navy-850 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
              Balance(A) = ∑(Credits) - ∑(Debits)
            </code>
            Database triggers on <code className="font-mono text-xs">ledger_entries</code> reject any SQL <code className="font-mono text-xs">UPDATE</code> or <code className="font-mono text-xs">DELETE</code>.
          </p>
        </Card>
      </div>
    </div>
  );
};
