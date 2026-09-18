import React, { useState } from 'react';
import { 
  GitFork, 
  Plus, 
  ShieldCheck, 
  ToggleLeft, 
  ToggleRight, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle,
  X,
  Sliders
} from 'lucide-react';
import { RoutingRule, RouteProvider, PaymentCategory } from '../../types';

interface RulesScreenProps {
  rules: RoutingRule[];
  providers: RouteProvider[];
  onToggleRule: (ruleId: string) => void;
  onAddRule: (rule: RoutingRule) => void;
}

export const RulesScreen: React.FC<RulesScreenProps> = ({
  rules,
  providers,
  onToggleRule,
  onAddRule,
}) => {
  // Test Simulator State
  const [testAmount, setTestAmount] = useState<number>(8500);
  const [testCategory, setTestCategory] = useState<PaymentCategory>('wholesale');

  // Add Rule Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleDesc, setRuleDesc] = useState('');
  const [rulePriority, setRulePriority] = useState<number>(rules.length + 1);
  const [targetRoute, setTargetRoute] = useState<string>(providers[0]?.id || 'route-b');
  const [categoryFilter, setCategoryFilter] = useState<string>('any');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');

  // Simulator evaluation
  const evaluateTestRoute = () => {
    // 1. Check category wholesale rule
    const wholesaleRule = rules.find(
      (r) => r.active && r.categoryFilter && r.categoryFilter === testCategory
    );
    if (wholesaleRule) {
      return {
        matched: true,
        rule: wholesaleRule,
        reason: `Matched category rule: ${wholesaleRule.name}`,
        providerName: wholesaleRule.targetRouteName,
      };
    }

    // 2. High amount rule (> 50,000)
    const highRule = rules.find(
      (r) => r.active && r.minAmount && testAmount >= r.minAmount
    );
    if (highRule) {
      return {
        matched: true,
        rule: highRule,
        reason: `Transaction amount ₹${testAmount.toLocaleString('en-IN')} exceeds threshold ₹${highRule.minAmount?.toLocaleString('en-IN')}`,
        providerName: highRule.targetRouteName,
      };
    }

    // 3. Low amount rule (< 2,000)
    const lowRule = rules.find(
      (r) => r.active && r.maxAmount && testAmount <= r.maxAmount
    );
    if (lowRule) {
      return {
        matched: true,
        rule: lowRule,
        reason: `Transaction amount ₹${testAmount.toLocaleString('en-IN')} is under express limit ₹${lowRule.maxAmount?.toLocaleString('en-IN')}`,
        providerName: lowRule.targetRouteName,
      };
    }

    return {
      matched: false,
      rule: null,
      reason: 'No priority rules matched; routing to Default Cluster Gateway (Route B - ICICI)',
      providerName: 'Route B (ICICI Provider)',
    };
  };

  const testResult = evaluateTestRoute();

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    const chosenProvider = providers.find((p) => p.id === targetRoute) || providers[0];

    const newRule: RoutingRule = {
      id: `rule-${Date.now()}`,
      name: ruleName.trim(),
      priority: rulePriority,
      description: ruleDesc.trim() || `Routes traffic to ${chosenProvider.name}`,
      targetRouteId: chosenProvider.id,
      targetRouteName: chosenProvider.name,
      active: true,
      categoryFilter: categoryFilter !== 'any' ? (categoryFilter as PaymentCategory) : undefined,
      minAmount: minAmount ? parseInt(minAmount, 10) : undefined,
      maxAmount: maxAmount ? parseInt(maxAmount, 10) : undefined,
    };

    onAddRule(newRule);
    setShowAddModal(false);
    setRuleName('');
    setRuleDesc('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 flex flex-col gap-5">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#3d494c] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-[#4cd7f6]" />
            <h2 className="font-display text-base font-bold text-[#dfe2f1]">
              Smart Routing Policy Matrix
            </h2>
          </div>
          <p className="text-xs text-[#bcc9cd] mt-0.5">
            Configure automated gateway failover, ticket-size clustering, and merchant priority routing.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#06b6d4] hover:bg-[#4cd7f6] text-[#003640] font-display font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-transform active:scale-95 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Custom Rule</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="flex flex-col gap-3">
        {rules.map((rule) => {
          return (
            <div
              key={rule.id}
              className={`bg-[#171b26] p-4 rounded-xl border transition-all ${
                rule.active
                  ? 'border-[#3d494c] hover:border-[#06b6d4]/50'
                  : 'border-[#3d494c]/40 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1c1f2a] border border-[#3d494c] flex items-center justify-center font-mono font-bold text-xs text-[#4cd7f6] shrink-0 mt-0.5">
                    P{rule.priority}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-sm text-[#dfe2f1]">
                        {rule.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1c1f2a] border border-[#3d494c] text-[#adc6ff]">
                        Target: {rule.targetRouteName}
                      </span>
                    </div>
                    <p className="text-xs text-[#bcc9cd] mt-1 leading-relaxed">
                      {rule.description}
                    </p>

                    {/* Criteria Tags */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] font-mono">
                      {rule.categoryFilter && (
                        <span className="px-2 py-0.5 rounded bg-[#262a35] text-[#4cd7f6] border border-[#3d494c]">
                          Category == {rule.categoryFilter.toUpperCase()}
                        </span>
                      )}
                      {rule.minAmount !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-[#262a35] text-[#4cd7f6] border border-[#3d494c]">
                          Amount ≥ ₹{rule.minAmount.toLocaleString('en-IN')}
                        </span>
                      )}
                      {rule.maxAmount !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-[#262a35] text-[#4cd7f6] border border-[#3d494c]">
                          Amount ≤ ₹{rule.maxAmount.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onToggleRule(rule.id)}
                  className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors p-1"
                  title={rule.active ? 'Deactivate Rule' : 'Activate Rule'}
                >
                  {rule.active ? (
                    <ToggleRight className="w-8 h-8 text-[#06b6d4]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-[#869397]" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Routing Evaluation Testbed / Simulator */}
      <div className="bg-[#171b26] p-4 rounded-xl border border-[#06b6d4]/40 shadow-[0_0_15px_rgba(6,182,212,0.1)] flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#3d494c] pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#4cd7f6]" />
            <h3 className="font-display font-bold text-sm text-[#dfe2f1]">
              Live Routing Engine Sandbox & Simulator
            </h3>
          </div>
          <span className="font-mono text-xs text-[#4cd7f6] bg-[#06b6d4]/10 px-2 py-0.5 rounded border border-[#06b6d4]/30">
            TEST EVALUATION
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#bcc9cd] block mb-1">
              Simulated Transaction Amount (₹)
            </label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="w-full bg-[#262a35] border border-[#3d494c] rounded-lg px-3 py-2 text-sm font-mono text-[#dfe2f1] focus:border-[#06b6d4] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-[#bcc9cd] block mb-1">
              Merchant Category
            </label>
            <select
              value={testCategory}
              onChange={(e) => setTestCategory(e.target.value as PaymentCategory)}
              className="w-full bg-[#262a35] border border-[#3d494c] rounded-lg px-3 py-2 text-sm text-[#dfe2f1] focus:border-[#06b6d4] focus:outline-none cursor-pointer"
            >
              <option value="wholesale">Wholesale</option>
              <option value="retail">Retail</option>
              <option value="services">Services</option>
            </select>
          </div>
        </div>

        {/* Real-time Result Box */}
        <div className="bg-[#1c1f2a] p-3.5 rounded-lg border border-[#3d494c] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/30 flex items-center justify-center text-[#4cd7f6]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-[#bcc9cd]">Evaluated Route:</div>
              <div className="font-display font-bold text-sm text-[#4cd7f6]">
                {testResult.providerName}
              </div>
              <div className="text-[11px] text-[#bcc9cd] font-mono mt-0.5">
                {testResult.reason}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-xs font-mono text-[#4cd7f6] bg-[#06b6d4]/10 px-2.5 py-1 rounded-full border border-[#06b6d4]/30 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Automated Match
            </span>
          </div>
        </div>
      </div>

      {/* Add Custom Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#171b26] border border-[#3d494c] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#3d494c] bg-[#1c1f2a]">
              <h3 className="font-display font-bold text-base text-[#dfe2f1]">
                Define Routing Rule
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-[#bcc9cd] hover:text-[#dfe2f1]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="p-4 space-y-3">
              <div>
                <label className="text-xs text-[#bcc9cd] block mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rule #4: Corporate High-Value Node"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full bg-[#262a35] border border-[#3d494c] rounded-lg px-3 py-2 text-sm text-[#dfe2f1] focus:border-[#06b6d4] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#bcc9cd] block mb-1">Description / Intent</label>
                <textarea
                  rows={2}
                  placeholder="Details on why this traffic should be routed to this provider..."
                  value={ruleDesc}
                  onChange={(e) => setRuleDesc(e.target.value)}
                  className="w-full bg-[#262a35] border border-[#3d494c] rounded-lg px-3 py-2 text-xs text-[#dfe2f1] focus:border-[#06b6d4] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#bcc9cd] block mb-1">Target Banking Route</label>
                  <select
                    value={targetRoute}
                    onChange={(e) => setTargetRoute(e.target.value)}
                    className="w-full bg-[#262a35] border border-[#3d494c] rounded-lg px-3 py-2 text-xs text-[#dfe2f1] focus:border-[#06b6d4] focus:outline-none cursor-pointer"
                  >
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#bcc9cd] block mb-1">Merchant Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-[#262a35] border border-[#3d494c] rounded-lg px-3 py-2 text-xs text-[#dfe2f1] focus:border-[#06b6d4] focus:outline-none cursor-pointer"
                  >
                    <option value="any">Any Category</option>
                    <option value="wholesale">Wholesale Only</option>
                    <option value="retail">Retail Only</option>
                    <option value="services">Services Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#bcc9cd] block mb-1">Min Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="Optional, e.g. 10000"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-full bg-[#262a35] border border-[#3d494c] rounded-lg px-3 py-2 text-xs text-[#dfe2f1] focus:border-[#06b6d4] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#bcc9cd] block mb-1">Max Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="Optional, e.g. 50000"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="w-full bg-[#262a35] border border-[#3d494c] rounded-lg px-3 py-2 text-xs text-[#dfe2f1] focus:border-[#06b6d4] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#06b6d4] hover:bg-[#4cd7f6] text-[#003640] font-bold text-sm py-2.5 rounded-lg transition-colors"
                >
                  Deploy Rule
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-[#3d494c] text-[#bcc9cd] hover:text-[#dfe2f1] text-sm rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
