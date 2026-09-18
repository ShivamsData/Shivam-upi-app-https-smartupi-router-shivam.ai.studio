import React, { useState } from 'react';
import { 
  ReceiptText, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  X, 
  Code, 
  Copy, 
  Check,
  Printer
} from 'lucide-react';
import { LedgerTransaction } from '../../types';

interface LedgerScreenProps {
  transactions: LedgerTransaction[];
}

export const LedgerScreen: React.FC<LedgerScreenProps> = ({ transactions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SETTLED' | 'FAILED'>('ALL');
  const [selectedTxn, setSelectedTxn] = useState<LedgerTransaction | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  const filtered = transactions.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.invoiceNo.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.utr.toLowerCase().includes(q) ||
      t.provider.toLowerCase().includes(q)
    );
  });

  const handleExportCsv = () => {
    const headers = ['Txn ID,Invoice,Amount,Customer,Category,Provider,Status,UTR,Timestamp'];
    const rows = filtered.map(
      (t) =>
        `${t.id},${t.invoiceNo},${t.amount},"${t.customerName}",${t.category},"${t.provider}",${t.status},${t.utr},${t.timestamp}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartUPI_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyWebhookJson = (txn: LedgerTransaction) => {
    const payload = JSON.stringify(
      {
        event: txn.status === 'SETTLED' ? 'payment.captured' : 'payment.failed',
        transaction_id: txn.id,
        invoice_reference: txn.invoiceNo,
        amount_inr: txn.amount,
        currency: 'INR',
        npci_utr: txn.utr,
        vpa_source: txn.vpa,
        routing: {
          assigned_provider: txn.provider,
          latency_ms: txn.latencyMs,
          cluster_health: '99.8%',
        },
        failure_reason: txn.failureReason || null,
        timestamp: txn.timestamp,
      },
      null,
      2
    );
    navigator.clipboard?.writeText(payload);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 flex flex-col gap-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3d494c] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-[#4cd7f6]" />
            <h2 className="font-display text-base font-bold text-[#dfe2f1]">
              Live Transactions Ledger
            </h2>
          </div>
          <p className="text-xs text-[#bcc9cd] mt-0.5">
            Immutable settlement log of all dynamic QR scans, automated routing traces, and bank UTRs.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="bg-[#262a35] hover:bg-[#313540] border border-[#3d494c] text-[#dfe2f1] font-mono text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#4cd7f6]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#bcc9cd]" />
          <input
            type="text"
            placeholder="Search by Txn ID, Invoice, Customer, or UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#171b26] border border-[#3d494c] rounded-lg pl-9 pr-3 py-2 text-xs text-[#dfe2f1] focus:border-[#06b6d4] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-[#bcc9cd] hover:text-[#dfe2f1]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-[#171b26] p-1 rounded-lg border border-[#3d494c] shrink-0 font-mono text-xs">
          {(['ALL', 'SETTLED', 'FAILED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === status
                  ? 'bg-[#262a35] text-[#4cd7f6] font-bold border border-[#06b6d4]/40 shadow-xs'
                  : 'text-[#bcc9cd] hover:text-[#dfe2f1]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#171b26] rounded-xl border border-[#3d494c] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#1c1f2a] border-b border-[#3d494c] text-[#bcc9cd] font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Transaction / Invoice</th>
                <th className="py-3 px-4">Customer Entity</th>
                <th className="py-3 px-4">Banking Route</th>
                <th className="py-3 px-4 text-right">Amount (INR)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">NPCI UTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3d494c]/40 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#bcc9cd]">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((txn) => (
                  <tr
                    key={txn.id}
                    onClick={() => setSelectedTxn(txn)}
                    className="hover:bg-[#1c1f2a] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#dfe2f1] hover:text-[#4cd7f6]">
                        {txn.id}
                      </div>
                      <div className="text-[10px] text-[#869397]">{txn.invoiceNo}</div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-[#dfe2f1]">{txn.customerName}</div>
                      <div className="text-[10px] font-mono text-[#869397]">{txn.vpa}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#4cd7f6] font-sans font-medium block">
                        {txn.provider}
                      </span>
                      <span className="text-[10px] text-[#869397]">{txn.latencyMs}ms latency</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-sm text-[#dfe2f1]">
                      ₹{txn.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {txn.status === 'SETTLED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#06b6d4]/10 text-[#4cd7f6] border border-[#06b6d4]/30 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Settled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30 text-[10px] font-bold">
                          <XCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-[11px] text-[#bcc9cd]">
                      {txn.utr}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Drawer / Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#171b26] border border-[#3d494c] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-[#3d494c] bg-[#1c1f2a]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#bcc9cd]">
                  Settlement Receipt
                </span>
                <h3 className="font-display font-bold text-base text-[#dfe2f1]">
                  {selectedTxn.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="p-1 rounded text-[#bcc9cd] hover:text-[#dfe2f1]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 font-mono text-xs">
              {/* Amount Highlight Card */}
              <div className="bg-[#1c1f2a] p-4 rounded-xl border border-[#3d494c] flex items-center justify-between">
                <div>
                  <span className="text-[#869397] block text-[11px]">SETTLED AMOUNT</span>
                  <div className="font-display font-bold text-2xl text-[#4cd7f6] mt-0.5">
                    ₹{selectedTxn.amount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      selectedTxn.status === 'SETTLED'
                        ? 'bg-[#06b6d4]/10 text-[#4cd7f6] border border-[#06b6d4]/30'
                        : 'bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30'
                    }`}
                  >
                    {selectedTxn.status === 'SETTLED' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> DECLINED
                      </>
                    )}
                  </span>
                  <div className="text-[10px] text-[#869397] mt-1">{selectedTxn.timestamp}</div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-3 bg-[#0a0e18] p-3.5 rounded-xl border border-[#3d494c]">
                <div>
                  <span className="text-[#869397] text-[10px] block">INVOICE NO</span>
                  <span className="font-bold text-[#dfe2f1]">{selectedTxn.invoiceNo}</span>
                </div>
                <div>
                  <span className="text-[#869397] text-[10px] block">NPCI UTR NUMBER</span>
                  <span className="font-bold text-[#dfe2f1]">{selectedTxn.utr}</span>
                </div>
                <div>
                  <span className="text-[#869397] text-[10px] block">PAYER CUSTOMER</span>
                  <span className="font-sans font-semibold text-[#dfe2f1]">
                    {selectedTxn.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-[#869397] text-[10px] block">CUSTOMER VPA</span>
                  <span className="text-[#4cd7f6]">{selectedTxn.vpa}</span>
                </div>
                <div>
                  <span className="text-[#869397] text-[10px] block">ROUTED BANK NODE</span>
                  <span className="text-[#dfe2f1]">{selectedTxn.provider}</span>
                </div>
                <div>
                  <span className="text-[#869397] text-[10px] block">LATENCY RECORDED</span>
                  <span className="text-[#dfe2f1]">{selectedTxn.latencyMs} ms</span>
                </div>
              </div>

              {selectedTxn.failureReason && (
                <div className="bg-[#93000a]/20 border border-[#ffb4ab]/30 p-3 rounded-lg text-[#ffb4ab]">
                  <span className="font-bold block">Failure Diagnostics:</span>
                  <span className="text-[11px] mt-0.5">{selectedTxn.failureReason}</span>
                </div>
              )}

              {/* Webhook JSON Payload */}
              <div>
                <div className="flex items-center justify-between pb-1 text-[#bcc9cd]">
                  <span className="text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Code className="w-3.5 h-3.5 text-[#4cd7f6]" />
                    Raw Webhook Event Log (JSON)
                  </span>
                  <button
                    onClick={() => copyWebhookJson(selectedTxn)}
                    className="text-[#4cd7f6] hover:underline flex items-center gap-1 text-[11px]"
                  >
                    {copiedJson ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                    {copiedJson ? 'Copied' : 'Copy JSON'}
                  </button>
                </div>
                <pre className="bg-[#0a0e18] p-3 rounded-lg border border-[#3d494c] text-[11px] text-[#4cd7f6] overflow-x-auto max-h-36">
                  {JSON.stringify(
                    {
                      event: selectedTxn.status === 'SETTLED' ? 'payment.captured' : 'payment.failed',
                      txn_id: selectedTxn.id,
                      invoice: selectedTxn.invoiceNo,
                      amount: selectedTxn.amount,
                      utr: selectedTxn.utr,
                      vpa: selectedTxn.vpa,
                      route: selectedTxn.provider,
                      timestamp: selectedTxn.timestamp,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-[#262a35] hover:bg-[#313540] border border-[#3d494c] text-[#dfe2f1] font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4 text-[#4cd7f6]" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="px-5 py-2.5 bg-[#06b6d4] hover:bg-[#4cd7f6] text-[#003640] font-bold rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
