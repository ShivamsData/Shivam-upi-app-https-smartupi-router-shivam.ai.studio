import React, { useState } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Radio,
  ExternalLink
} from 'lucide-react';
import { WebhookNotification } from '../types';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onResetForm?: () => void;
  notifications: WebhookNotification[];
  onClearNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onResetForm,
  notifications,
  onClearNotifications,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [resetFeedback, setResetFeedback] = useState(false);

  const getTitle = () => {
    switch (currentTab) {
      case 'qr-codes':
        return 'Generate Dynamic QR';
      case 'dashboard':
        return 'Routing Telemetry';
      case 'rules':
        return 'Smart Routing Engine';
      case 'ledger':
        return 'Transactions Ledger';
      case 'recon':
        return 'Settlement Recon';
      default:
        return 'Generate Dynamic QR';
    }
  };

  const handleReset = () => {
    if (onResetForm) {
      onResetForm();
      setResetFeedback(true);
      setTimeout(() => setResetFeedback(false), 1500);
    }
  };

  const unreadCount = notifications.length;

  return (
    <header className="sticky top-0 z-40 bg-[#171b26] border-b border-[#3d494c] shadow-sm flex justify-between items-center w-full px-4 py-2 select-none">
      <div className="flex items-center gap-2">
        <button
          id="btn-header-back"
          aria-label="Cancel and return"
          onClick={() => onNavigate('dashboard')}
          className="p-1 rounded text-[#bcc9cd] hover:text-[#dfe2f1] hover:bg-[#262a35] transition-transform duration-150 active:scale-95"
          type="button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h1 className="font-display text-[16px] leading-tight font-bold text-[#dfe2f1] tracking-tight">
            {getTitle()}
          </h1>
          <span className="font-mono text-[12px] text-[#4cd7f6] flex items-center gap-1.5">
            SmartUPI Router • Live Gateway
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onResetForm && currentTab === 'qr-codes' && (
          <div className="relative">
            <button
              id="btn-header-reset"
              aria-label="Reset Form"
              onClick={handleReset}
              title="Reset Form to Defaults"
              className="text-[#bcc9cd] hover:text-[#dfe2f1] p-1.5 rounded hover:bg-[#262a35] transition-colors relative"
              type="button"
            >
              <RotateCcw className={`w-[18px] h-[18px] transition-transform duration-300 ${resetFeedback ? '-rotate-180 text-[#4cd7f6]' : ''}`} />
            </button>
            {resetFeedback && (
              <span className="absolute -bottom-7 right-0 text-[10px] font-mono bg-[#1c1f2a] text-[#4cd7f6] px-2 py-0.5 rounded border border-[#06b6d4]/40 shadow-lg whitespace-nowrap z-50">
                Form Reset
              </span>
            )}
          </div>
        )}

        <div className="relative">
          <button
            id="btn-header-notifications"
            aria-label="System Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-[#4cd7f6] hover:text-[#acedff] p-1.5 rounded hover:bg-[#262a35] transition-colors relative"
            type="button"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#06b6d4] ring-2 ring-[#171b26] animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 sm:w-96 bg-[#171b26] border border-[#3d494c] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[420px]">
              <div className="p-3 border-b border-[#3d494c] flex items-center justify-between bg-[#1c1f2a]">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#4cd7f6] animate-pulse" />
                  <span className="font-display font-bold text-xs text-[#dfe2f1] uppercase tracking-wider">
                    Live Webhook Events ({notifications.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="text-[11px] text-[#bcc9cd] hover:text-[#dfe2f1] hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[#bcc9cd] hover:text-[#dfe2f1] p-0.5 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto divide-y divide-[#3d494c]/50 p-1 flex-1">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[#bcc9cd] text-xs">
                    No new gateway events. Run a payment simulation below!
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-2.5 hover:bg-[#1c1f2a] transition-colors rounded">
                      <div className="flex items-start gap-2">
                        {notif.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-[#4cd7f6] mt-0.5 shrink-0" />
                        ) : notif.type === 'failure' ? (
                          <AlertCircle className="w-4 h-4 text-[#ffb4ab] mt-0.5 shrink-0" />
                        ) : (
                          <Radio className="w-4 h-4 text-[#adc6ff] mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-xs text-[#dfe2f1] truncate">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-[#869397] shrink-0 font-mono">
                              {notif.timestamp}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#bcc9cd] mt-0.5 leading-snug">
                            {notif.message}
                          </p>
                          {notif.route && (
                            <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#262a35] text-[#4cd7f6]">
                              {notif.route}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
