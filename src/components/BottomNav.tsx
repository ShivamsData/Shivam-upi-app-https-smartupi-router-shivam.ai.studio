import React from 'react';
import { 
  LayoutDashboard, 
  QrCode, 
  GitFork, 
  ReceiptText, 
  RefreshCw,
  Store
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'qr-codes', label: 'QR Codes', icon: QrCode },
    { id: 'rules', label: 'Rules', icon: GitFork },
    { id: 'ledger', label: 'Ledger', icon: ReceiptText },
    { id: 'recon', label: 'Recon', icon: RefreshCw },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Docked full-width bottom-0, hidden on md+) */}
      <nav 
        id="mobile-bottom-nav"
        className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-1 py-2 bg-[#171b26] border-t border-[#3d494c] shadow-lg md:hidden"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-[#4cd7f6] font-semibold'
                  : 'text-[#bcc9cd] font-normal hover:text-[#dfe2f1]'
              }`}
              type="button"
            >
              <Icon className={isActive ? 'w-6 h-6 stroke-[2.2]' : 'w-5 h-5 stroke-[1.8]'} />
              <span className="text-[11px] font-medium tracking-wide mt-0.5">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] mt-0.5 shadow-[0_0_6px_#06b6d4]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Desktop Navigation Bar (Visible on md+ screens) */}
      <nav 
        id="desktop-bottom-nav"
        className="hidden md:flex fixed bottom-0 left-0 w-full z-50 justify-center items-center gap-6 px-6 py-2.5 bg-[#171b26] border-t border-[#3d494c] shadow-xl backdrop-blur-md"
      >
        <div className="flex items-center gap-2 text-[#bcc9cd] font-medium mr-4 border-r border-[#3d494c] pr-6">
          <Store className="w-4 h-4 text-[#4cd7f6]" />
          <span className="font-bold text-[#dfe2f1] text-sm">SmartUPI Router</span>
        </div>

        <div className="flex items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`desktop-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-[#4cd7f6] font-semibold bg-[#1c1f2a] border border-[#06b6d4]/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                    : 'text-[#bcc9cd] hover:text-[#dfe2f1] hover:bg-[#262a35]'
                }`}
                type="button"
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#4cd7f6]' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
