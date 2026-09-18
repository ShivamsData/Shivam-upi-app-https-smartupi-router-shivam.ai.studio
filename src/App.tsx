import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DynamicQRScreen } from './components/screens/DynamicQRScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { RulesScreen } from './components/screens/RulesScreen';
import { LedgerScreen } from './components/screens/LedgerScreen';
import { ReconScreen } from './components/screens/ReconScreen';
import { ChangeCustomerModal } from './components/ChangeCustomerModal';
import { ShareDeepLinkModal } from './components/ShareDeepLinkModal';

import { 
  CustomerProfile, 
  RouteProvider, 
  RoutingRule, 
  LedgerTransaction, 
  ReconRecord, 
  WebhookNotification, 
  PaymentIntent 
} from './types';

import { 
  INITIAL_CUSTOMERS, 
  BRANCHES, 
  INITIAL_PROVIDERS, 
  INITIAL_RULES, 
  INITIAL_LEDGER, 
  INITIAL_RECON 
} from './data/mockData';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('qr-codes');
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile>(INITIAL_CUSTOMERS[0]);
  const [providers, setProviders] = useState<RouteProvider[]>(INITIAL_PROVIDERS);
  const [rules, setRules] = useState<RoutingRule[]>(INITIAL_RULES);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>(INITIAL_LEDGER);
  const [reconRecords, setReconRecords] = useState<ReconRecord[]>(INITIAL_RECON);

  // Notifications
  const [notifications, setNotifications] = useState<WebhookNotification[]>([
    {
      id: 'notif-1',
      title: 'Gateway Health Check Passed',
      message: 'All 3 provider nodes (ICICI, HDFC, Axis) reporting 99.8% cluster uptime.',
      timestamp: '22:45',
      type: 'info',
    },
    {
      id: 'notif-2',
      title: 'Settlement Batch Clear',
      message: '₹12,45,000 dispatched via NPCI clearing switch.',
      timestamp: '22:30',
      type: 'success',
      route: 'ICICI Provider',
      amount: 1245000,
    },
  ]);

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<{ upiUri: string; amount: number; invoiceNo: string }>({
    upiUri: 'upi://pay?pa=smartrouter@icici&pn=SmartUPI&am=8500&tr=PAY-20260918-001&cu=INR&tn=INV-2026-1024',
    amount: 8500,
    invoiceNo: 'INV-2026-1024',
  });

  // Key to reset form
  const [qrScreenKey, setQrScreenKey] = useState(1);

  const handleResetForm = () => {
    setSelectedCustomer(INITIAL_CUSTOMERS[0]);
    setQrScreenKey((prev) => prev + 1);
  };

  const handleSimulatePayment = (intent: PaymentIntent, success: boolean) => {
    const txnId = `TXN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomUtr = `UTR${Math.floor(70000000000 + Math.random() * 29999999999)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newTxn: LedgerTransaction = {
      id: txnId,
      intentId: intent.id,
      invoiceNo: intent.invoiceNo,
      amount: intent.amount,
      customerName: intent.customer.name,
      customerId: intent.customer.id,
      category: intent.category,
      provider: intent.evaluatedRouteName,
      routeId: intent.evaluatedRouteId,
      status: success ? 'SETTLED' : 'FAILED',
      timestamp: nowStr,
      utr: randomUtr,
      vpa: intent.customer.vpa || 'customer@upi',
      latencyMs: Math.floor(320 + Math.random() * 120),
      failureReason: success
        ? undefined
        : 'U30: Declined by customer bank (Insufficient balance or authentication timeout)',
    };

    setTransactions((prev) => [newTxn, ...prev]);

    // Create Webhook Event Notification
    const newNotif: WebhookNotification = {
      id: `notif-${Date.now()}`,
      title: success
        ? `Payment Success: ₹${intent.amount.toLocaleString('en-IN')}`
        : `Payment Declined: ₹${intent.amount.toLocaleString('en-IN')}`,
      message: success
        ? `Settled via ${intent.evaluatedRouteName}. UTR: ${randomUtr}`
        : `Declined on ${intent.evaluatedRouteName}. Error code U30.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: success ? 'success' : 'failure',
      route: intent.evaluatedRouteName,
      amount: intent.amount,
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r))
    );
  };

  const handleAddRule = (newRule: RoutingRule) => {
    setRules((prev) => [...prev, newRule]);
  };

  const handleAddCustomer = (newCust: CustomerProfile) => {
    setCustomers((prev) => [...prev, newCust]);
  };

  const handleTriggerRecon = () => {
    const today = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const newBatch: ReconRecord = {
      id: `BATCH-${Date.now().toString().slice(-8)}`,
      date: today,
      totalTxns: transactions.filter((t) => t.status === 'SETTLED').length,
      grossVolume: transactions
        .filter((t) => t.status === 'SETTLED')
        .reduce((sum, t) => sum + t.amount, 0),
      settledVolume: transactions
        .filter((t) => t.status === 'SETTLED')
        .reduce((sum, t) => sum + t.amount, 0),
      feeDeduction: 0,
      netPayout: transactions
        .filter((t) => t.status === 'SETTLED')
        .reduce((sum, t) => sum + t.amount, 0),
      status: 'MATCHED',
      bankBatchRef: `NPCI-SETTLE-${Math.floor(1000 + Math.random() * 9000)}`,
      matchedCount: transactions.filter((t) => t.status === 'SETTLED').length,
      mismatchCount: 0,
    };

    setReconRecords((prev) => [newBatch, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: '3-Way Recon Batch Complete',
        message: `Batch ${newBatch.id} verified with 100% bank escrow match.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'success',
      },
      ...prev,
    ]);
  };

  return (
    <div className="bg-[#0f131d] text-[#dfe2f1] min-h-screen flex flex-col font-sans pb-24 selection:bg-[#06b6d4] selection:text-[#003640]">
      {/* Top App Bar */}
      <Header
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        onResetForm={handleResetForm}
        notifications={notifications}
        onClearNotifications={() => setNotifications([])}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {currentTab === 'qr-codes' && (
          <DynamicQRScreen
            key={qrScreenKey}
            customer={selectedCustomer}
            onChangeCustomer={() => setIsCustomerModalOpen(true)}
            onSimulatePayment={handleSimulatePayment}
            onOpenShareModal={(data) => {
              setShareData(data);
              setIsShareModalOpen(true);
            }}
            branches={BRANCHES}
            rules={rules}
            providers={providers}
            onNavigateToLedger={() => setCurrentTab('ledger')}
            onNavigateToRules={() => setCurrentTab('rules')}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardScreen
            providers={providers}
            transactions={transactions}
            onNavigateToQR={() => setCurrentTab('qr-codes')}
            onNavigateToLedger={() => setCurrentTab('ledger')}
            onNavigateToRules={() => setCurrentTab('rules')}
          />
        )}

        {currentTab === 'rules' && (
          <RulesScreen
            rules={rules}
            providers={providers}
            onToggleRule={handleToggleRule}
            onAddRule={handleAddRule}
          />
        )}

        {currentTab === 'ledger' && (
          <LedgerScreen transactions={transactions} />
        )}

        {currentTab === 'recon' && (
          <ReconScreen
            reconRecords={reconRecords}
            onTriggerRecon={handleTriggerRecon}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* Customer Selection Modal */}
      <ChangeCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customers={customers}
        selectedCustomerId={selectedCustomer.id}
        onSelectCustomer={(c) => setSelectedCustomer(c)}
        onAddCustomer={handleAddCustomer}
      />

      {/* Share UPI DeepLink Modal */}
      <ShareDeepLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        upiUri={shareData.upiUri}
        amount={shareData.amount}
        invoiceNo={shareData.invoiceNo}
        customerName={selectedCustomer.name}
      />
    </div>
  );
}
