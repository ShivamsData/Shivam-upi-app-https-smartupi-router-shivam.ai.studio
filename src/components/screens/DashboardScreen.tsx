import React from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Zap, 
  Network, 
  ArrowUpRight, 
  QrCode, 
  ShieldCheck, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { RouteProvider, LedgerTransaction } from '../../types';

interface DashboardScreenProps {
  providers: RouteProvider[];
  transactions: LedgerTransaction[];
  onNavigateToQR: () => void;
  onNavigateToLedger: () => void;
  onNavigateToRules: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  providers,
  transactions,
  onNavigateToQR,
  onNavigateToLedger,
  onNavigateToRules,
}) => {
  const settledTxns = transactions.filter((t) => t.status === 'SETTLED');
  const totalVolume = settledTxns.reduce((acc, curr) => acc + curr.amount, 0);
  const successRate = transactions.length > 0 
    ? ((settledTxns.length / transactions.length) * 100).toFixed(1)
    : '100.0';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 flex flex-col gap-5">
      {/* Top Banner with Quick Action */}
      <div className="bg-[#171b26] border border-[#3d494c] p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#4cd7f6] font-bold">
              SmartUPI Autonomous Router
            </span>
          </div>
          <h2 className="font-display text-lg font-bold text-[#dfe2f1] mt-0.5">
            Gateway Telemetry & Health Monitor
          </h2>
          <p className="text-xs text-[#bcc9cd]">
            Real-time automated traffic routing across 3 active banking nodes with sub-400ms latency.
          </p>
        </div>

        <button
          onClick={onNavigateToQR}
          className="bg-[#06b6d4] hover:bg-[#4cd7f6] text-[#003640] font-display font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-transform active:scale-95 whitespace-nowrap"
        >
          <QrCode className="w-4 h-4 stroke-[2.5]" />
          <span>Generate Dynamic QR</span>
        </button>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Volume */}
        <div className="bg-[#171b26] p-4 rounded-xl border border-[#3d494c] flex flex-col gap-1">
          <div className="flex items-center justify-between text-[#bcc9cd]">
            <span className="text-xs font-medium">Volume Processed Today</span>
            <TrendingUp className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="font-display font-bold text-2xl text-[#dfe2f1] tracking-tight">
            ₹{totalVolume.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#4cd7f6] mt-0.5 font-mono">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{settledTxns.length} settled payments</span>
          </div>
        </div>

        {/* Metric 2: Gateway Success Rate */}
        <div className="bg-[#171b26] p-4 rounded-xl border border-[#3d494c] flex flex-col gap-1">
          <div className="flex items-center justify-between text-[#bcc9cd]">
            <span className="text-xs font-medium">Gateway Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="font-display font-bold text-2xl text-[#dfe2f1] tracking-tight">
            {successRate}%
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#4cd7f6] mt-0.5 font-mono">
            <span>+1.6% above NPCI standard</span>
          </div>
        </div>

        {/* Metric 3: Average Latency */}
        <div className="bg-[#171b26] p-4 rounded-xl border border-[#3d494c] flex flex-col gap-1">
          <div className="flex items-center justify-between text-[#bcc9cd]">
            <span className="text-xs font-medium">Average Round-Trip Latency</span>
            <Zap className="w-4 h-4 text-[#adc6ff]" />
          </div>
          <div className="font-display font-bold text-2xl text-[#dfe2f1] tracking-tight">
            378 ms
          </div>
          <div className="text-[11px] text-[#bcc9cd] mt-0.5 font-mono">
            SLA target: &lt; 450ms
          </div>
        </div>

        {/* Metric 4: Active Route Health */}
        <div className="bg-[#171b26] p-4 rounded-xl border border-[#3d494c] flex flex-col gap-1">
          <div className="flex items-center justify-between text-[#bcc9cd]">
            <span className="text-xs font-medium">Cluster Availability</span>
            <ShieldCheck className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="font-display font-bold text-2xl text-[#dfe2f1] tracking-tight">
            99.8%
          </div>
          <div className="text-[11px] text-[#4cd7f6] mt-0.5 font-mono">
            3 of 3 Gateways Online
          </div>
        </div>
      </div>

      {/* Gateway Providers Performance Matrix */}
      <div className="bg-[#171b26] p-4 rounded-xl border border-[#3d494c] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-[#4cd7f6]" />
            <h3 className="font-display font-bold text-sm text-[#dfe2f1]">
              Live Banking Route Evaluation Nodes
            </h3>
          </div>
          <button
            onClick={onNavigateToRules}
            className="text-xs text-[#4cd7f6] hover:underline font-mono"
          >
            Manage Routing Rules →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {providers.map((p) => (
            <div
              key={p.id}
              className="bg-[#1c1f2a] p-3.5 rounded-lg border border-[#3d494c] flex flex-col gap-2 relative overflow-hidden"
            >
              <div 
                className="absolute top-0 left-0 right-0 h-1" 
                style={{ backgroundColor: p.color }}
              />
              <div className="flex items-center justify-between pt-1">
                <span className="font-display font-bold text-xs text-[#dfe2f1]">
                  {p.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#06b6d4]/10 text-[#4cd7f6] border border-[#06b6d4]/30">
                  {p.health}% Health
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div>
                  <span className="text-[#869397] block text-[10px]">AVG LATENCY</span>
                  <span className="text-[#dfe2f1] font-semibold">{p.avgLatencyMs} ms</span>
                </div>
                <div>
                  <span className="text-[#869397] block text-[10px]">24H UPTIME</span>
                  <span className="text-[#dfe2f1] font-semibold">{p.uptime24h}%</span>
                </div>
              </div>

              {/* Health progress meter */}
              <div className="w-full bg-[#262a35] h-1.5 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${p.health}%`, backgroundColor: p.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent QR Transactions Feed */}
      <div className="bg-[#171b26] p-4 rounded-xl border border-[#3d494c] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#4cd7f6]" />
            <h3 className="font-display font-bold text-sm text-[#dfe2f1]">
              Recent Dynamic QR Settlements
            </h3>
          </div>
          <button
            onClick={onNavigateToLedger}
            className="text-xs text-[#4cd7f6] hover:underline font-mono"
          >
            Full Ledger View ({transactions.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#3d494c] text-[#bcc9cd] font-mono uppercase text-[10px]">
                <th className="pb-2">Txn ID / Invoice</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Routed Gateway</th>
                <th className="pb-2 text-right">Amount</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3d494c]/40 font-mono">
              {transactions.slice(0, 4).map((txn) => (
                <tr key={txn.id} className="hover:bg-[#1c1f2a] transition-colors">
                  <td className="py-2.5">
                    <div className="font-bold text-[#dfe2f1]">{txn.id}</div>
                    <div className="text-[10px] text-[#869397]">{txn.invoiceNo}</div>
                  </td>
                  <td className="py-2.5">
                    <div className="text-[#dfe2f1] font-sans font-medium">{txn.customerName}</div>
                    <div className="text-[10px] text-[#869397]">{txn.vpa}</div>
                  </td>
                  <td className="py-2.5">
                    <span className="text-[#4cd7f6] font-sans text-xs font-semibold">
                      {txn.provider}
                    </span>
                    <div className="text-[10px] text-[#869397]">{txn.latencyMs}ms</div>
                  </td>
                  <td className="py-2.5 text-right font-bold text-[#dfe2f1]">
                    ₹{txn.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 text-right">
                    {txn.status === 'SETTLED' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#06b6d4]/10 text-[#4cd7f6] border border-[#06b6d4]/30 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Settled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30 text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3" /> Failed
                      </span>
                    )}
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
