import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { Transaction } from '../../types';
import { CheckCircle2, Download, Printer, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptContent = `================================================
          BALANCEVAULT PROVABLE RECEIPT
================================================
Reference:       ${transaction.transactionReference}
Timestamp:       ${new Date(transaction.createdAt).toLocaleString()}
Type:            ${transaction.transactionType}
Amount:          ₹${transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
Currency:        ${transaction.currency || 'INR'}
Status:          ${transaction.status}
From Account:    ${transaction.sourceAccountNumber || 'EXTERNAL CLEARING'}
To Account:      ${transaction.destinationAccountNumber || 'EXTERNAL CLEARING'}
Initiated By:    ${transaction.initiatedByUsername}
Description:     ${transaction.description || 'N/A'}
Core Invariant:  Double-entry balanced. Immutable journal record posted to BalanceVault core.
================================================`;
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${transaction.transactionReference}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Receipt" maxWidth="max-w-md">
      <div id="printable-receipt" className="space-y-6">
        {/* Header Branding */}
        <div className="text-center pb-4 border-b border-slate-100 dark:border-navy-800">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-violet-brand">
            <ShieldCheck className="w-4 h-4" />
            <span>BalanceVault Provable Receipt</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{new Date(transaction.createdAt).toLocaleString()}</p>
        </div>

        {/* Details Table */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-navy-850">
            <span className="text-slate-500 dark:text-slate-400">Reference:</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100">{transaction.transactionReference}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-navy-850">
            <span className="text-slate-500 dark:text-slate-400">Transaction Type:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{transaction.transactionType}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-navy-850">
            <span className="text-slate-500 dark:text-slate-400">Status:</span>
            <Badge status={transaction.status} />
          </div>
          {transaction.sourceAccountNumber && (
            <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-navy-850">
              <span className="text-slate-500 dark:text-slate-400">From Account:</span>
              <span className="font-mono text-slate-900 dark:text-slate-100">{transaction.sourceAccountNumber}</span>
            </div>
          )}
          {transaction.destinationAccountNumber && (
            <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-navy-850">
              <span className="text-slate-500 dark:text-slate-400">To Account:</span>
              <span className="font-mono text-slate-900 dark:text-slate-100">{transaction.destinationAccountNumber}</span>
            </div>
          )}
          <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-navy-850">
            <span className="text-slate-500 dark:text-slate-400">Initiated By:</span>
            <span className="text-slate-900 dark:text-slate-100">{transaction.initiatedByUsername}</span>
          </div>
          {transaction.description && (
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400">Description:</span>
              <span className="text-right text-slate-900 dark:text-slate-100 max-w-[200px] truncate">{transaction.description}</span>
            </div>
          )}
        </div>

        {/* Invariant seal */}
        <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl text-xs text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-navy-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>Double-entry balanced. Immutable journal record posted to BalanceVault core.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 print:hidden">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1.5" />
            Download
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" />
            Print
          </Button>
          <Button variant="primary" size="sm" className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
