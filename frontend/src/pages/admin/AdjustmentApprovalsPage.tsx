import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { accountService } from '../../services/accountService';
import { Account, AdjustmentRequest } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { CheckCircle, Plus, ShieldCheck, XCircle, AlertCircle } from 'lucide-react';

export const AdjustmentApprovalsPage: React.FC = () => {
  const [requests, setRequests] = useState<AdjustmentRequest[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // New Request Modal State
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [adjType, setAdjType] = useState('CREDIT');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<AdjustmentRequest | null>(null);
  const [comments, setComments] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqs, accs] = await Promise.all([
        adminService.getAdjustments(),
        adminService.getAllAccounts(),
      ]);
      setRequests(reqs);
      setAccounts(accs.filter(a => a.status === 'ACTIVE' && a.accountType !== 'SYSTEM_CLEARING'));
      if (accs.length > 0) setSelectedAccountId(accs[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId || !amount || !reason) return;
    try {
      setSubmitting(true);
      await adminService.requestAdjustment({
        accountId: selectedAccountId,
        adjustmentType: adjType,
        amount: parseFloat(amount),
        reason,
      });
      setNewModalOpen(false);
      setAmount('');
      setReason('');
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!activeRequest) return;
    try {
      setReviewing(true);
      await adminService.reviewAdjustment(activeRequest.id, {
        decision,
        comments,
      });
      setReviewModalOpen(false);
      setActiveRequest(null);
      setComments('');
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial Adjustments & Compensations</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Strict two-person approval workflow. Approved adjustments post auditable double-entry compensating transactions.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setNewModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Request Adjustment
        </Button>
      </div>

      <Card title="Submitted Adjustment Requests" subtitle="Pending review, approved, or rejected items">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-navy-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Account</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Reason</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Requested By</th>
                <th className="pb-3 font-semibold text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/50">
                  <td className="py-3 font-mono font-medium text-slate-900 dark:text-white">
                    {r.accountNumber}
                  </td>
                  <td className="py-3 font-bold text-violet-600 dark:text-violet-400">
                    {r.adjustmentType}
                  </td>
                  <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                    ₹{r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {r.reason}
                  </td>
                  <td className="py-3">
                    <Badge status={r.status} />
                  </td>
                  <td className="py-3 text-slate-500">
                    {r.requestedByUsername}
                  </td>
                  <td className="py-3 text-right">
                    {r.status === 'PENDING' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setActiveRequest(r);
                          setReviewModalOpen(true);
                        }}
                      >
                        Review
                      </Button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Request Adjustment Modal */}
      <Modal isOpen={newModalOpen} onClose={() => setNewModalOpen(false)} title="Submit Financial Adjustment Request">
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Target Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.accountNumber}) — ₹{a.balance.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Adjustment Type
            </label>
            <select
              value={adjType}
              onChange={(e) => setAdjType(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white"
            >
              <option value="CREDIT">CREDIT (Compensate / Add Funds)</option>
              <option value="DEBIT">DEBIT (Fee / Correction Debit)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Adjustment Amount (INR ₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500.00"
              required
              className="w-full px-4 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Justification / Audit Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detailed justification for this balance adjustment..."
              required
              rows={3}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setNewModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} className="flex-1">
              Submit for Approval
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Review Adjustment Request">
        {activeRequest && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-navy-850 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Account:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{activeRequest.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="font-bold text-violet-600 dark:text-violet-400">{activeRequest.adjustmentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{activeRequest.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Justification:</span>
                <span className="text-slate-800 dark:text-slate-200">{activeRequest.reason}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Approver Comments
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Approval rationale or rejection reason..."
                rows={2}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-navy-850 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-3 bg-violet-50 dark:bg-violet-950/30 rounded-xl text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Approving executes a double-entry transaction against the central clearing reserve.</span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="danger"
                loading={reviewing}
                onClick={() => handleReview('REJECTED')}
                className="flex-1"
              >
                Reject Request
              </Button>
              <Button
                variant="emerald"
                loading={reviewing}
                onClick={() => handleReview('APPROVED')}
                className="flex-1"
              >
                Approve & Post Postings
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
