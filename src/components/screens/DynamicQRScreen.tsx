import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Receipt, 
  ChevronDown, 
  Edit3, 
  ShoppingBag, 
  Package, 
  Handshake, 
  Network, 
  CheckCircle2, 
  QrCode, 
  Hourglass, 
  Copy, 
  Check, 
  ExternalLink, 
  XCircle, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { 
  CustomerProfile, 
  PaymentCategory, 
  PaymentIntent, 
  RoutingRule, 
  RouteProvider 
} from '../../types';

interface DynamicQRScreenProps {
  customer: CustomerProfile;
  onChangeCustomer: () => void;
  onSimulatePayment: (intent: PaymentIntent, success: boolean) => void;
  onOpenShareModal: (data: { upiUri: string; amount: number; invoiceNo: string }) => void;
  branches: string[];
  rules: RoutingRule[];
  providers: RouteProvider[];
  onNavigateToLedger: () => void;
  onNavigateToRules: () => void;
}

export const DynamicQRScreen: React.FC<DynamicQRScreenProps> = ({
  customer,
  onChangeCustomer,
  onSimulatePayment,
  onOpenShareModal,
  branches,
  rules,
  providers,
  onNavigateToLedger,
  onNavigateToRules,
}) => {
  // Intent State
  const [amount, setAmount] = useState<number>(8500);
  const [amountInput, setAmountInput] = useState<string>('8,500');
  const [invoiceNo, setInvoiceNo] = useState<string>('INV-2026-1024');
  const [selectedBranch, setSelectedBranch] = useState<string>(branches[0] || 'Gurgaon (Main Hub)');
  const [category, setCategory] = useState<PaymentCategory>('wholesale');
  const [notes, setNotes] = useState<string>('Bulk inventory payment order #42');

  // Copy state
  const [copiedLink, setCopiedLink] = useState(false);

  // Timer: 04:59 (299 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(299);

  // Simulation feedback state
  const [simulationStatus, setSimulationStatus] = useState<{
    visible: boolean;
    success: boolean;
    title: string;
    desc: string;
    txnId?: string;
  } | null>(null);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 299));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Dynamic Route Evaluation
  const evaluateRoute = () => {
    // Check wholesale rule
    const wholesaleRule = rules.find((r) => r.active && r.categoryFilter === 'wholesale');
    if (category === 'wholesale' && wholesaleRule) {
      return {
        providerId: wholesaleRule.targetRouteId,
        providerName: wholesaleRule.targetRouteName,
        ruleName: 'Rule #1: Wholesale Category (Priority 1) matched',
        latencySla: '< 420ms',
        feesText: 'Gateway Fees: 0.00% (UPI Free Tier)',
        health: '99.8%',
      };
    }

    // High amount rule (> 50,000)
    const highAmountRule = rules.find((r) => r.active && r.minAmount && amount >= r.minAmount);
    if (highAmountRule) {
      return {
        providerId: highAmountRule.targetRouteId,
        providerName: highAmountRule.targetRouteName,
        ruleName: 'Rule #3: High-Ticket Escrow (> ₹50,000) matched',
        latencySla: '< 450ms',
        feesText: 'Gateway Fees: 0.00% (UPI Free Tier)',
        health: '99.4%',
      };
    }

    // Low amount rule (< 2,000)
    const lowAmountRule = rules.find((r) => r.active && r.maxAmount && amount <= r.maxAmount);
    if (lowAmountRule) {
      return {
        providerId: lowAmountRule.targetRouteId,
        providerName: lowAmountRule.targetRouteName,
        ruleName: 'Rule #2: Low-Ticket Express (< ₹2,000) matched',
        latencySla: '< 340ms',
        feesText: 'Gateway Fees: 0.00% (UPI Free Tier)',
        health: '98.9%',
      };
    }

    // Default fallback
    return {
      providerId: 'route-b',
      providerName: 'Route B (ICICI Provider)',
      ruleName: 'Default Routing Policy: Standard Hub ICICI',
      latencySla: '< 420ms',
      feesText: 'Gateway Fees: 0.00% (UPI Free Tier)',
      health: '99.8%',
    };
  };

  const evaluation = evaluateRoute();

  const handleAmountChange = (valStr: string) => {
    // Allow digits and commas
    const cleanStr = valStr.replace(/[^0-9]/g, '');
    const num = parseInt(cleanStr, 10) || 0;
    setAmount(num);
    setAmountInput(num ? num.toLocaleString('en-IN') : '');
  };

  const handleQuickAmount = (val: number) => {
    setAmount(val);
    setAmountInput(val.toLocaleString('en-IN'));
  };

  const upiDeepLink = `upi://pay?pa=smartrouter@icici&pn=SmartUPI&am=${amount}&tr=PAY-20260918-001&cu=INR&tn=${encodeURIComponent(
    invoiceNo
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(upiDeepLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const currentIntent: PaymentIntent = {
    id: 'PAY-20260918-001',
    amount,
    invoiceNo,
    branch: selectedBranch,
    customer,
    category,
    notes,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 300000).toISOString(),
    state: 'DRAFT_ROUTED',
    evaluatedRouteId: evaluation.providerId,
    evaluatedRouteName: evaluation.providerName,
    matchedRuleName: evaluation.ruleName,
    latencySla: evaluation.latencySla,
    feesText: evaluation.feesText,
  };

  const triggerSimulation = (isSuccess: boolean) => {
    onSimulatePayment(currentIntent, isSuccess);

    if (isSuccess) {
      setSimulationStatus({
        visible: true,
        success: true,
        title: `Webhook: SUCCESS (${evaluation.providerName})`,
        desc: `Payment for ₹${amount.toLocaleString('en-IN')} settled. Ledger ID: TXN_${evaluation.providerId.toUpperCase()}_${Math.floor(
          10000 + Math.random() * 90000
        )} logged.`,
      });
    } else {
      setSimulationStatus({
        visible: true,
        success: false,
        title: 'Webhook: FAILED (Customer Cancelled / Timeout)',
        desc: `${evaluation.providerName} returned error code U30 (Declined by customer bank).`,
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-3 flex flex-col gap-4">
      {/* Top Status Banner / Intent State */}
      <section 
        id="top-intent-banner"
        className="flex items-center justify-between bg-[#1c1f2a] px-3.5 py-2 rounded-lg border border-[#3d494c] shadow-xs"
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4] animate-pulse" />
          <span className="text-[11px] uppercase tracking-wider text-[#bcc9cd] font-semibold">
            Intent State:
          </span>
          <span className="font-mono text-xs font-bold text-[#4cd7f6]">
            DRAFT_ROUTED
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[#bcc9cd]">
          <Hourglass className="w-3.5 h-3.5 text-[#4cd7f6]" />
          <span id="global-timer" className="font-mono text-xs font-bold text-[#dfe2f1]">
            {formatTimer(secondsRemaining)}
          </span>
        </div>
      </section>

      {/* Main Grid: Form (Left, 7 Cols) & QR Terminal (Right, 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Payment Intent Details Form */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-[#3d494c] pb-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#4cd7f6]" />
              <h2 className="font-display text-base font-bold text-[#dfe2f1]">
                Payment Intent Details
              </h2>
            </div>
            <span className="font-mono text-xs text-[#bcc9cd]">
              ID: PAY-20260918-001
            </span>
          </div>

          <div className="bg-[#171b26] p-4 rounded-xl border border-[#3d494c] flex flex-col gap-4 shadow-sm">
            {/* Transaction Amount Input */}
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="intent-amount" 
                className="text-xs text-[#bcc9cd] flex justify-between font-medium"
              >
                <span>Transaction Amount</span>
                <span className="font-mono text-[#4cd7f6] text-[11px]">
                  Currency: INR (₹)
                </span>
              </label>
              
              <div className="relative flex items-center">
                <span className="absolute left-3.5 font-bold text-2xl text-[#4cd7f6] select-none">
                  ₹
                </span>
                <input
                  id="intent-amount"
                  type="text"
                  value={amountInput}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#262a35] border border-[#3d494c] rounded-lg pl-10 pr-14 py-2.5 font-bold text-2xl text-[#dfe2f1] tracking-tight focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] focus:outline-none transition-all"
                />
                <div className="absolute right-3 bg-[#1c1f2a] px-2 py-0.5 rounded border border-[#3d494c] font-mono text-xs text-[#bcc9cd] font-bold">
                  INR
                </div>
              </div>

              {/* Quick Select Chips */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {[500, 1000, 2500, 8500].map((val) => {
                  const isSelected = amount === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAmount(val)}
                      className={`px-3 py-1 rounded-full text-xs font-mono transition-transform duration-150 active:scale-95 ${
                        isSelected
                          ? 'bg-[#06b6d4]/20 border border-[#06b6d4] text-[#4cd7f6] font-bold shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                          : 'bg-[#1c1f2a] border border-[#3d494c] hover:border-[#4cd7f6] text-[#dfe2f1]'
                      }`}
                    >
                      ₹{val}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Invoice Reference & Merchant Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="invoice-no" className="text-xs text-[#bcc9cd]">
                  Invoice Reference
                </label>
                <div className="relative">
                  <input
                    id="invoice-no"
                    type="text"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    className="w-full bg-[#262a35] border border-[#3d494c] rounded-lg px-3 py-2 font-mono text-xs text-[#dfe2f1] focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] focus:outline-none font-semibold pr-8"
                  />
                  <Receipt className="w-4 h-4 absolute right-2.5 top-2.5 text-[#bcc9cd]" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="branch-selector" className="text-xs text-[#bcc9cd]">
                  Merchant Branch
                </label>
                <div className="relative">
                  <select
                    id="branch-selector"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full bg-[#262a35] border border-[#3d494c] rounded-lg px-3 py-2 text-xs text-[#dfe2f1] focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] focus:outline-none appearance-none pr-8 cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b} value={b} className="bg-[#171b26]">
                        {b}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2.5 top-2.5 text-[#bcc9cd] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Customer Identity Card Inside Form */}
            <div className="bg-[#1c1f2a] p-3 rounded-lg border border-[#3d494c] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-[#bcc9cd] font-semibold">
                  Customer Profile
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#06b6d4]/10 text-[#4cd7f6] border border-[#06b6d4]/30 text-[11px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse" />
                  Verified Entity
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#262a35] flex items-center justify-center text-[#4cd7f6] font-display text-sm font-bold border border-[#3d494c]">
                    {customer.initials}
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#dfe2f1]">
                      {customer.name}
                    </h3>
                    <p className="font-mono text-xs text-[#bcc9cd]">
                      Customer ID: <span className="text-[#dfe2f1]">{customer.id}</span> • {customer.category}
                    </p>
                  </div>
                </div>

                <button
                  id="btn-change-customer"
                  type="button"
                  onClick={onChangeCustomer}
                  className="text-[#4cd7f6] hover:text-[#acedff] text-xs font-semibold flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-[#262a35]"
                >
                  Change <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Category Segmented Control Chips */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#bcc9cd]">
                Merchant Processing Category
              </label>
              <div className="grid grid-cols-3 gap-2 bg-[#0a0e18] p-1 rounded-lg border border-[#3d494c]">
                <button
                  type="button"
                  onClick={() => setCategory('retail')}
                  className={`py-2 text-center rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    category === 'retail'
                      ? 'bg-[#262a35] border border-[#06b6d4] text-[#4cd7f6] font-bold shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'text-[#bcc9cd] hover:text-[#dfe2f1]'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Retail
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('wholesale')}
                  className={`py-2 text-center rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    category === 'wholesale'
                      ? 'bg-[#262a35] border border-[#06b6d4] text-[#4cd7f6] font-bold shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'text-[#bcc9cd] hover:text-[#dfe2f1]'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Wholesale
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('services')}
                  className={`py-2 text-center rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    category === 'services'
                      ? 'bg-[#262a35] border border-[#06b6d4] text-[#4cd7f6] font-bold shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'text-[#bcc9cd] hover:text-[#dfe2f1]'
                  }`}
                >
                  <Handshake className="w-4 h-4" />
                  Services
                </button>
              </div>
            </div>

            {/* Description / Notes */}
            <div className="flex flex-col gap-1">
              <label htmlFor="intent-notes" className="text-xs text-[#bcc9cd]">
                Description / Notes
              </label>
              <textarea
                id="intent-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add optional settlement or routing notes..."
                className="w-full bg-[#262a35] border border-[#3d494c] rounded-lg px-3 py-2 text-xs text-[#dfe2f1] focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Automated Route Evaluation Card (Docked directly under form) */}
          <div 
            id="automated-route-evaluation-card"
            className="bg-[#171b26] rounded-xl border border-[#3d494c] p-4 flex flex-col gap-3 relative overflow-hidden shadow-sm"
          >
            {/* Cyan Left Accent Line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-[#4cd7f6]" />
                <span className="text-[11px] uppercase tracking-wider text-[#bcc9cd] font-semibold">
                  Automated Route Evaluation
                </span>
              </div>
              <button 
                onClick={onNavigateToRules}
                title="View Routing Rules"
                className="px-2 py-0.5 rounded-full bg-[#06b6d4]/15 text-[#4cd7f6] text-[11px] font-semibold border border-[#06b6d4]/30 flex items-center gap-1.5 hover:bg-[#06b6d4]/25 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-ping" />
                {evaluation.health} Health
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
              <div className="bg-[#1c1f2a] p-3 rounded-lg border border-[#3d494c]">
                <span className="text-xs text-[#bcc9cd] block">Evaluated Route:</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Network className="w-4 h-4 text-[#adc6ff]" />
                  <span className="font-display text-sm font-bold text-[#dfe2f1]">
                    {evaluation.providerName}
                  </span>
                </div>
              </div>

              <div className="bg-[#1c1f2a] p-3 rounded-lg border border-[#3d494c]">
                <span className="text-xs text-[#bcc9cd] block">Matched Priority Rule:</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-[#4cd7f6] shrink-0" />
                  <span className="font-mono text-xs font-semibold text-[#4cd7f6] truncate">
                    {evaluation.ruleName}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-[#bcc9cd] pt-2 border-t border-[#3d494c]/60">
              <span>Latency SLA: {evaluation.latencySla}</span>
              <span className="text-[#4cd7f6] font-medium">
                {evaluation.feesText}
              </span>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Dynamic QR Code Display & Simulation Card */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-[#3d494c] pb-2">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#4cd7f6]" />
              <h2 className="font-display text-base font-bold text-[#dfe2f1]">
                Dynamic QR Terminal
              </h2>
            </div>
            <span className="font-mono text-xs text-[#4cd7f6] flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse" />
              ACTIVE LISTENER
            </span>
          </div>

          {/* Dynamic QR Card Container */}
          <div className="bg-[#171b26] rounded-xl border border-[#3d494c] p-4 flex flex-col items-center gap-4 relative shadow-md">
            {/* Expiry Timer Countdown Badge */}
            <div className="w-full flex items-center justify-between bg-[#1c1f2a] px-3 py-2 rounded-lg border border-[#3d494c]">
              <div className="flex items-center gap-1.5 text-[#bcc9cd]">
                <Hourglass className="w-4 h-4 text-[#4cd7f6]" />
                <span className="text-xs font-medium">Expires in:</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#dfe2f1] bg-[#262a35] px-2.5 py-0.5 rounded border border-[#3d494c]">
                <span id="qr-timer-countdown">{formatTimer(secondsRemaining)}</span>
                <span className="text-[11px] text-[#bcc9cd] font-normal">
                  mins remaining
                </span>
              </div>
            </div>

            {/* High-Contrast Scannable QR Code Frame */}
            <div className="relative p-4 bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center border-4 border-[#06b6d4]/20 transition-all hover:border-[#06b6d4]/40">
              <div className="w-56 h-56 bg-white p-2 flex flex-col items-center justify-center relative">
                <svg
                  id="main-qr-svg"
                  className="w-full h-full text-slate-900 select-none"
                  fill="currentColor"
                  viewBox="0 0 200 200"
                >
                  {/* QR Position Detection Patterns Top-Left */}
                  <rect fill="#0b0f19" height="50" rx="6" width="50" x="10" y="10" />
                  <rect fill="#ffffff" height="30" rx="2" width="30" x="20" y="20" />
                  <rect fill="#06b6d4" height="16" rx="2" width="16" x="27" y="27" />

                  {/* QR Position Detection Patterns Top-Right */}
                  <rect fill="#0b0f19" height="50" rx="6" width="50" x="140" y="10" />
                  <rect fill="#ffffff" height="30" rx="2" width="30" x="150" y="20" />
                  <rect fill="#06b6d4" height="16" rx="2" width="16" x="157" y="27" />

                  {/* QR Position Detection Patterns Bottom-Left */}
                  <rect fill="#0b0f19" height="50" rx="6" width="50" x="10" y="140" />
                  <rect fill="#ffffff" height="30" rx="2" width="30" x="20" y="150" />
                  <rect fill="#06b6d4" height="16" rx="2" width="16" x="27" y="157" />

                  {/* Matrix Payload Bits */}
                  <rect fill="#0b0f19" height="10" width="10" x="70" y="15" />
                  <rect fill="#0b0f19" height="10" width="20" x="90" y="15" />
                  <rect fill="#0b0f19" height="10" width="10" x="120" y="15" />
                  <rect fill="#0b0f19" height="10" width="20" x="70" y="35" />
                  <rect fill="#0b0f19" height="10" width="10" x="100" y="35" />
                  <rect fill="#0b0f19" height="10" width="10" x="120" y="35" />
                  <rect fill="#0b0f19" height="10" width="10" x="15" y="70" />
                  <rect fill="#0b0f19" height="10" width="20" x="35" y="70" />
                  <rect fill="#06b6d4" height="15" width="15" x="70" y="70" />
                  <rect fill="#0b0f19" height="10" width="10" x="95" y="70" />
                  <rect fill="#0b0f19" height="10" width="20" x="115" y="70" />
                  <rect fill="#0b0f19" height="10" width="10" x="145" y="70" />
                  <rect fill="#0b0f19" height="10" width="20" x="165" y="70" />
                  <rect fill="#0b0f19" height="10" width="20" x="15" y="90" />
                  <rect fill="#0b0f19" height="10" width="10" x="45" y="90" />
                  <rect fill="#0b0f19" height="15" width="10" x="70" y="95" />
                  <rect fill="#06b6d4" height="10" width="15" x="120" y="90" />
                  <rect fill="#0b0f19" height="20" width="10" x="145" y="90" />
                  <rect fill="#0b0f19" height="10" width="25" x="165" y="90" />
                  <rect fill="#0b0f19" height="10" width="15" x="15" y="115" />
                  <rect fill="#0b0f19" height="10" width="15" x="40" y="115" />
                  <rect fill="#0b0f19" height="10" width="20" x="65" y="120" />
                  <rect fill="#0b0f19" height="15" width="15" x="95" y="115" />
                  <rect fill="#0b0f19" height="10" width="10" x="120" y="115" />
                  <rect fill="#0b0f19" height="10" width="20" x="140" y="120" />
                  <rect fill="#0b0f19" height="10" width="15" x="170" y="115" />
                  <rect fill="#0b0f19" height="10" width="20" x="70" y="145" />
                  <rect fill="#06b6d4" height="20" width="10" x="100" y="140" />
                  <rect fill="#0b0f19" height="10" width="15" x="120" y="145" />
                  <rect fill="#0b0f19" height="10" width="10" x="145" y="145" />
                  <rect fill="#0b0f19" height="15" width="25" x="165" y="140" />
                  <rect fill="#0b0f19" height="15" width="10" x="70" y="170" />
                  <rect fill="#0b0f19" height="10" width="25" x="90" y="170" />
                  <rect fill="#0b0f19" height="15" width="20" x="125" y="165" />
                  <rect fill="#0b0f19" height="15" width="10" x="155" y="170" />
                  <rect fill="#0b0f19" height="10" width="15" x="175" y="170" />

                  {/* Center Smart Router Nano Badge */}
                  <circle cx="100" cy="100" fill="#0b0f19" r="16" stroke="#ffffff" strokeWidth="2" />
                  <path d="M94 100 L98 95 L106 95 L102 100 L106 105 L98 105 Z" fill="#06b6d4" />
                </svg>
              </div>

              <div className="mt-1 flex items-center justify-center gap-1 font-mono text-xs text-slate-800 font-bold tracking-wider">
                <span>SCAN TO PAY ₹{amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Accepted UPI Brand Ecosystem Logos */}
            <div className="w-full flex flex-col items-center gap-1.5 pt-1">
              <span className="text-xs text-[#bcc9cd]">
                Accepts all UPI Apps directly:
              </span>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {/* GPay Pill */}
                <span className="px-2.5 py-1 rounded bg-[#1c1f2a] border border-[#3d494c] text-[11px] font-bold text-[#dfe2f1] flex items-center gap-1">
                  <span className="font-extrabold text-[#4285F4]">G</span>Pay
                </span>
                {/* PhonePe Pill */}
                <span className="px-2.5 py-1 rounded bg-[#1c1f2a] border border-[#3d494c] text-[11px] font-bold text-[#dfe2f1] flex items-center gap-1">
                  <span className="font-extrabold text-[#5f259f]">Pe</span>PhonePe
                </span>
                {/* Paytm Pill */}
                <span className="px-2.5 py-1 rounded bg-[#1c1f2a] border border-[#3d494c] text-[11px] font-bold text-[#dfe2f1] flex items-center gap-1">
                  <span className="text-[#00BAF2]">Paytm</span>
                </span>
                {/* BHIM Pill */}
                <span className="px-2.5 py-1 rounded bg-[#1c1f2a] border border-[#3d494c] text-[11px] font-bold text-[#dfe2f1] flex items-center gap-1">
                  <span className="text-[#2e7d32]">BHIM</span> UPI
                </span>
              </div>
            </div>

            {/* Copy Payment Link Button */}
            <div className="w-full flex flex-col gap-1.5">
              <button
                id="copy-link-btn"
                type="button"
                onClick={handleCopyLink}
                className="w-full h-11 rounded-lg bg-[#262a35] hover:bg-[#353944] border border-[#3d494c] text-[#dfe2f1] text-xs font-semibold flex items-center justify-center gap-2 transition-transform duration-150 active:scale-98"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-[#4cd7f6] stroke-[3]" />
                    <span className="text-[#4cd7f6]">Link Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#4cd7f6]" />
                    <span>Copy UPI Payment Link</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between font-mono text-xs text-[#bcc9cd] px-1">
                <span className="truncate max-w-[210px]">
                  upi://pay?pa=smartrouter@icici&am={amount}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenShareModal({ upiUri: upiDeepLink, amount, invoiceNo })}
                  className="text-[#4cd7f6] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  Share DeepLink <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Simulate Customer Payment Action Bar */}
            <div className="w-full pt-3 border-t border-[#3d494c] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-[#bcc9cd] flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#adc6ff]" />
                  Simulate Customer Payment
                </span>
                <span className="font-mono text-xs text-[#adc6ff] font-bold">
                  SANDBOX / QA
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Simulate Success Button */}
                <button
                  id="btn-sim-success"
                  type="button"
                  onClick={() => triggerSimulation(true)}
                  className="px-2 py-2.5 rounded-lg bg-[#06b6d4] hover:bg-[#4cd7f6] text-[#003640] font-display font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-transform duration-150 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Simulate Success</span>
                </button>

                {/* Simulate Failure Button */}
                <button
                  id="btn-sim-fail"
                  type="button"
                  onClick={() => triggerSimulation(false)}
                  className="px-2 py-2.5 rounded-lg bg-[#93000a]/30 hover:bg-[#93000a]/50 border border-[#ffb4ab]/40 text-[#ffb4ab] font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-transform duration-150 active:scale-95"
                >
                  <XCircle className="w-4 h-4 stroke-[2.5]" />
                  <span>Simulate Failure</span>
                </button>
              </div>

              {/* Simulation Status Feedback Box */}
              {simulationStatus && simulationStatus.visible && (
                <div
                  id="sim-status-box"
                  className={`p-3 rounded-lg border text-xs font-mono flex items-start gap-2.5 transition-all mt-1 ${
                    simulationStatus.success
                      ? 'bg-[#1c1f2a] border-[#06b6d4]/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-[#1c1f2a] border-[#ffb4ab]/40'
                  }`}
                >
                  {simulationStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-[#4cd7f6] shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#ffb4ab] shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div
                      className={`font-bold ${
                        simulationStatus.success ? 'text-[#4cd7f6]' : 'text-[#ffb4ab]'
                      }`}
                    >
                      {simulationStatus.title}
                    </div>
                    <div className="text-[#bcc9cd] mt-0.5 leading-snug">
                      {simulationStatus.desc}
                    </div>
                    {simulationStatus.success && (
                      <button
                        type="button"
                        onClick={onNavigateToLedger}
                        className="mt-2 text-xs text-[#4cd7f6] hover:underline flex items-center gap-1 font-semibold"
                      >
                        View in Live Ledger <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
