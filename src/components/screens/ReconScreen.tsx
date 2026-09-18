import React, { useState } from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  ArrowDownRight, 
  Sparkles, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { ReconRecord } from '../../types';

interface ReconScreenProps {
  reconRecords: ReconRecord[];
  onTriggerRecon: () => void;
}

export const ReconScreen: React.FC<ReconScreenProps> = ({ reconRecords, onTriggerRecon }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const handleRunRecon = () => {
    setIsRunning(true);
    setCurrentStep('1/3: Ingesting NPCI 24h UPI Clearing Logs...');

    setTimeout(() => {
      setCurrentStep('2/3: Cross-matching Bank UTRs against ICICI & HDFC Nodes...');
    }, 1200);

    setTimeout(() => {
      setCurrentStep('3/3: Reconciling Merchant Escrow Balances & Clearing Batch...');
    }, 2400);

    setTimeout(() => {
      setIsRunning(false);
      setCurrentStep(null);
      onTriggerRecon();
    }, 3600);
  };

  const totalGrossSettled = reconRecords.reduce((acc, curr) => acc + curr.grossVolume, 0);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 flex flex-col gap-5">
      {/* Header & Auto-Recon Action */}
      <div className="bg-[#171b26] border border-[#3d494c] p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-[#4cd7f6] ${isRunning ? 'animate-spin' : ''}`} />
            <span className="font-mono text-xs uppercase tracking-wider text-[#4cd7f6] font-bold">
              3-Way Automated Settlement Reconciliation
            </span>
          </div>
          <h2 className="font-display text-lg font-bold text-[#dfe2f1] mt-0.5">
            Banking Escrow & Clearing Engine
          </h2>
          <p className="text-xs text-[#bcc9cd]">
            Real-time verification across Merchant Ledger, NPCI Central Switch, and Acquiring Bank Accounts.
          </p>
        </div>

        <button
          disabled={isRunning}
          onClick={handleRunRecon}
          className={`bg-[#06b6d4] hover:bg-[#4cd7f6] text-[#003640] font-display font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-transform active:scale-95 whitespace-nowrap ${
            isRunning ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isRunning ? 'Reconciling Live Batches...' : 'Run Auto-Recon'}</span>
        </button>
      </div>

      {/* Live Reconciliation Progress Overlay */}
      {currentStep && (
        <div className="bg-[#1c1f2a] border border-[#06b6d4]/50 p-4 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-[#4cd7f6] animate-spin shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="font-mono text-xs font-bold text-[#4cd7f6] block">
              AUTOMATED 3-WAY MATCH IN PROGRESS
            </span>
            <p className="font-mono text-xs text-[#dfe2f1] mt-0.5 animate-pulse">
              {currentStep}
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#171b26] p-4 rounded-xl border border-[#3d494c] flex flex-col gap-1">
          <span className="text-xs text-[#bcc9cd]">Gross Reconciled Volume</span>
          <div className="font-display font-bold text-2xl text-[#dfe2f1]">
            ₹{totalGrossSettled.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-mono text-[#4cd7f6] mt-0.5">
            100% Cleared to Merchant Accounts
          </span>
        </div>

        <div className="bg-[#171b26] p-4 rounded-xl border border-[#3d494c] flex flex-col gap-1">
          <span className="text-xs text-[#bcc9cd]">Discrepancy Match Rate</span>
          <div className="font-display font-bold text-2xl text-[#4cd7f6]">
            100.0%
          </div>
          <span className="text-[11px] font-mono text-[#4cd7f6] mt-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 0 Unmatched Transactions
          </span>
        </div>

        <div className="bg-[#171b26] p-4 rounded-xl border border-[#3d494c] flex flex-col gap-1">
          <span className="text-xs text-[#bcc9cd]">Gateway Deductions</span>
          <div className="font-display font-bold text-2xl text-[#dfe2f1]">
            ₹0.00
          </div>
          <span className="text-[11px] font-mono text-[#bcc9cd] mt-0.5">
            0% MDR on UPI Commercial Tier
          </span>
        </div>
      </div>

      {/* Settlement Batches Table */}
      <div className="bg-[#171b26] rounded-xl border border-[#3d494c] overflow-hidden shadow-sm">
        <div className="p-3.5 border-b border-[#3d494c] flex items-center justify-between bg-[#1c1f2a]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#4cd7f6]" />
            <h3 className="font-display font-bold text-sm text-[#dfe2f1]">
              Daily Bank Settlement Batches
            </h3>
          </div>
          <span className="text-xs font-mono text-[#bcc9cd]">
            NPCI Escrow Cleared (T+0 / T+1)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#3d494c] text-[#bcc9cd] font-mono uppercase text-[10px] bg-[#171b26]">
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-4">Settlement Date</th>
                <th className="py-3 px-4">Total Txns</th>
                <th className="py-3 px-4 text-right">Settled Volume</th>
                <th className="py-3 px-4 text-right">NPCI Batch Ref</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3d494c]/40 font-mono">
              {reconRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#1c1f2a] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#dfe2f1]">{rec.id}</td>
                  <td className="py-3 px-4 text-[#bcc9cd]">{rec.date}</td>
                  <td className="py-3 px-4 text-[#dfe2f1]">
                    {rec.totalTxns} txns ({rec.matchedCount} matched)
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#4cd7f6]">
                    ₹{rec.settledVolume.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right text-[11px] text-[#bcc9cd]">
                    {rec.bankBatchRef}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#06b6d4]/10 text-[#4cd7f6] border border-[#06b6d4]/30 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" /> MATCHED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
