import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { DashboardSummary } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { VolumeChart } from '../../components/charts/VolumeChart';
import { IncomeExpenseChart } from '../../components/charts/IncomeExpenseChart';
import {
  Users,
  Building2,
  Scale,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck2,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAdminDashboard();
        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-brand">System Administration</span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">Platform Operations Hub</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Global metrics, account restrictions, adjustments review, and risk telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/reconciliation">
            <Button variant="primary" size="sm">
              <Scale className="w-4 h-4 mr-1.5" /> Run Reconciliation
            </Button>
          </Link>
          <Link to="/admin/risk">
            <Button variant="outline" size="sm">
              <Sparkles className="w-4 h-4 mr-1.5" /> Risk Engine
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-violet-100 dark:border-navy-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total System Liquidity</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ₹{(summary?.totalBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-500 font-semibold mt-1 block">Includes Reserve Clearing</span>
        </Card>

        <Card className="border-emerald-100 dark:border-navy-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Platform Inflow</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{(summary?.totalIncoming || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Deposits Funded</span>
        </Card>

        <Card className="border-slate-200 dark:border-navy-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Disbursements</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ₹{(summary?.totalOutgoing || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Withdrawals Processed</span>
        </Card>

        <Card className="border-slate-200 dark:border-navy-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Ledger Movements</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {summary?.totalTransfers || 0}
          </div>
          <span className="text-[11px] text-violet-500 font-semibold mt-1 block">Balanced Journal Entries</span>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Organization Financial Velocity" subtitle="Rolling movement velocity">
            <VolumeChart />
          </Card>
        </div>
        <div>
          <Card title="Fund Flows" subtitle="System-wide balance verification">
            <IncomeExpenseChart
              incoming={summary?.totalIncoming || 0}
              outgoing={summary?.totalOutgoing || 0}
            />
          </Card>
        </div>
      </div>

      {/* Admin Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/users" className="block">
          <Card className="hover:border-violet-400 transition-colors cursor-pointer p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-brand flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">User Management</h4>
                  <p className="text-xs text-slate-400">Permissions, role grants, locks</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </Card>
        </Link>

        <Link to="/admin/accounts" className="block">
          <Card className="hover:border-violet-400 transition-colors cursor-pointer p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-brand flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Account Management</h4>
                  <p className="text-xs text-slate-400">Freeze / unfreeze accounts</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </Card>
        </Link>

        <Link to="/admin/reconciliation" className="block">
          <Card className="hover:border-violet-400 transition-colors cursor-pointer p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Reconciliation Center</h4>
                  <p className="text-xs text-slate-400">Materialized balance proof</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};
