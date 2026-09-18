import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Download, Share2, Smartphone } from 'lucide-react';

interface ShareDeepLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  upiUri: string;
  amount: number;
  invoiceNo: string;
  customerName: string;
}

export const ShareDeepLinkModal: React.FC<ShareDeepLinkModalProps> = ({
  isOpen,
  onClose,
  upiUri,
  amount,
  invoiceNo,
  customerName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(upiUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    // Generate simple SVG data URL download
    const svgElement = document.getElementById('main-qr-svg');
    if (svgElement) {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svgElement);
      const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SmartUPI-${invoiceNo}.svg`;
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#171b26] border border-[#3d494c] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3d494c] bg-[#1c1f2a]">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#4cd7f6]" />
            <h3 className="font-display font-bold text-base text-[#dfe2f1]">
              Share & UPI DeepLink
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#bcc9cd] hover:text-[#dfe2f1] hover:bg-[#262a35] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="bg-[#1c1f2a] p-3 rounded-xl border border-[#3d494c] flex items-center justify-between">
            <div>
              <div className="text-xs text-[#bcc9cd]">Payment Target</div>
              <div className="text-sm font-bold text-[#dfe2f1]">{customerName}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#bcc9cd]">Amount Due</div>
              <div className="text-sm font-bold text-[#4cd7f6]">₹{amount.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#bcc9cd] font-mono block mb-1.5 uppercase tracking-wider">
              UPI Protocol Intent URI (NPCI standard)
            </label>
            <div className="relative">
              <textarea
                readOnly
                rows={3}
                value={upiUri}
                className="w-full bg-[#0a0e18] border border-[#3d494c] rounded-lg p-3 font-mono text-xs text-[#4cd7f6] break-all select-all resize-none focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 bg-[#06b6d4] hover:bg-[#4cd7f6] text-[#003640] font-bold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
            >
              {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'URI Copied!' : 'Copy Intent URI'}</span>
            </button>
            <button
              onClick={handleDownloadQr}
              className="px-4 py-2.5 bg-[#262a35] hover:bg-[#313540] border border-[#3d494c] text-[#dfe2f1] font-medium text-sm rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-[#4cd7f6]" />
              <span>SVG QR</span>
            </button>
          </div>

          {/* Test Intent Launcher */}
          <div className="pt-2 border-t border-[#3d494c]/60">
            <span className="text-xs text-[#bcc9cd] flex items-center gap-1 mb-2">
              <Smartphone className="w-3.5 h-3.5 text-[#4cd7f6]" />
              Launch on Mobile Device directly:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href={upiUri}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded bg-[#1c1f2a] border border-[#3d494c] hover:border-[#4cd7f6] text-center text-xs font-bold text-[#dfe2f1] transition-colors"
              >
                GPay Intent
              </a>
              <a
                href={upiUri}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded bg-[#1c1f2a] border border-[#3d494c] hover:border-[#4cd7f6] text-center text-xs font-bold text-[#dfe2f1] transition-colors"
              >
                PhonePe
              </a>
              <a
                href={upiUri}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded bg-[#1c1f2a] border border-[#3d494c] hover:border-[#4cd7f6] text-center text-xs font-bold text-[#dfe2f1] transition-colors"
              >
                Paytm UPI
              </a>
              <a
                href={upiUri}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded bg-[#1c1f2a] border border-[#3d494c] hover:border-[#4cd7f6] text-center text-xs font-bold text-[#dfe2f1] transition-colors"
              >
                BHIM UPI
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
