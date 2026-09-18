export type PaymentCategory = 'retail' | 'wholesale' | 'services';

export interface CustomerProfile {
  id: string;
  name: string;
  category: string;
  initials: string;
  verified: boolean;
  phone?: string;
  vpa?: string;
}

export interface RouteProvider {
  id: string;
  name: string;
  code: string;
  health: number;
  avgLatencyMs: number;
  feeRate: number; // percentage
  status: 'ACTIVE' | 'DEGRADED' | 'STANDBY';
  color: string;
  uptime24h: number;
}

export interface RoutingRule {
  id: string;
  name: string;
  priority: number;
  description: string;
  targetRouteId: string;
  targetRouteName: string;
  active: boolean;
  categoryFilter?: PaymentCategory;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  invoiceNo: string;
  branch: string;
  customer: CustomerProfile;
  category: PaymentCategory;
  notes: string;
  createdAt: string;
  expiresAt: string;
  state: 'DRAFT_ROUTED' | 'ACTIVE' | 'SETTLED' | 'FAILED' | 'EXPIRED';
  evaluatedRouteId: string;
  evaluatedRouteName: string;
  matchedRuleName: string;
  latencySla: string;
  feesText: string;
  utr?: string;
}

export interface LedgerTransaction {
  id: string;
  intentId: string;
  invoiceNo: string;
  amount: number;
  customerName: string;
  customerId: string;
  category: PaymentCategory;
  provider: string;
  routeId: string;
  status: 'SETTLED' | 'PENDING' | 'FAILED';
  timestamp: string;
  utr: string;
  vpa: string;
  latencyMs: number;
  failureReason?: string;
}

export interface ReconRecord {
  id: string;
  date: string;
  totalTxns: number;
  grossVolume: number;
  settledVolume: number;
  feeDeduction: number;
  netPayout: number;
  status: 'MATCHED' | 'DISCREPANCY' | 'PROCESSING';
  bankBatchRef: string;
  matchedCount: number;
  mismatchCount: number;
}

export interface WebhookNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'success' | 'failure' | 'routing' | 'info';
  route?: string;
  amount?: number;
}
