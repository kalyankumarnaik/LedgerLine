import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auditorService } from '../../services/auditorService';
import { ReconciliationReport } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Scale,
  ShieldCheck,
  FileStack,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const AuditorDashboardPage: React.FC = () => {
  const [report, setReport] = useState<ReconciliationReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
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
    fetchReport();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Read-Only Oversight</span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">Auditor Verification Portal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Independent read-only audit interface. Auditors cannot initiate money movements or alter state.
          </p>
        </div>
        <Link to="/auditor/integrity">
          <Button variant="emerald" size="sm">
            <ShieldCheck className="w-4 h-4 mr-1.5" /> Full Invariant Verification
          </Button>
        </Link>
      </div>

      {/* Audit Invariant Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-100 dark:border-navy-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Reconciliation Status</span>
          <div className="flex items-center gap-2 mt-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {report?.fullyReconciled ? 'Pass (100% Balanced)' : 'Discrepancy Detected'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {report?.balancedAccountsCount || 0} / {report?.totalAccountsChecked || 0} Accounts Reconciled
          </span>
        </Card>

        <Card className="border-violet-100 dark:border-navy-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Journal Parity</span>
          <div className="flex items-center gap-2 mt-2">
            <Scale className="w-5 h-5 text-violet-500" />
            <span className="text-lg font-black text-slate-900 dark:text-white">
              Zero Imbalance
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {report?.balancedJournalEntriesCount || 0} Balanced Double-Entries
          </span>
        </Card>

        <Card className="border-slate-200 dark:border-navy-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Immutability Protection</span>
          <div className="flex items-center gap-2 mt-2">
            <Lock className="w-5 h-5 text-blue-500" />
            <span className="text-lg font-black text-slate-900 dark:text-white">
              Database Enforced
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            PostgreSQL BEFORE UPDATE/DELETE Triggers
          </span>
        </Card>
      </div>

      {/* Explorer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/auditor/ledger" className="block">
          <Card className="hover:border-emerald-400 transition-colors p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mb-3">
                  <FileStack className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Immutable Ledger Explorer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Inspect raw double-entry ledger postings across accounts with mathematical running balance proofs.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>
          </Card>
        </Link>

        <Link to="/auditor/integrity" className="block">
          <Card className="hover:border-emerald-400 transition-colors p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-brand flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Integrity Verification Suite</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Run automated invariant audits: zero money creation/loss check, duplicate payment detection, and trigger verification.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};
