import React, { useState } from 'react';
import { CustomerProfile } from '../types';
import { X, Check, Building2, Plus, ShieldCheck } from 'lucide-react';

interface ChangeCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: CustomerProfile[];
  selectedCustomerId: string;
  onSelectCustomer: (customer: CustomerProfile) => void;
  onAddCustomer: (customer: CustomerProfile) => void;
}

export const ChangeCustomerModal: React.FC<ChangeCustomerModalProps> = ({
  isOpen,
  onClose,
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onAddCustomer,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Wholesale');
  const [newVpa, setNewVpa] = useState('');
  const [newPhone, setNewPhone] = useState('');

  if (!isOpen) return null;

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const words = newName.trim().split(' ');
    const initials = words.length > 1 
      ? (words[0][0] + words[1][0]).toUpperCase()
      : newName.slice(0, 2).toUpperCase();

    const created: CustomerProfile = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newName.trim(),
      category: newCategory,
      initials,
      verified: true,
      phone: newPhone || '+91 99000 11223',
      vpa: newVpa || `${newName.toLowerCase().replace(/[^a-z0-9]/g, '')}@icici`,
    };

    onAddCustomer(created);
    onSelectCustomer(created);
    setShowAddForm(false);
    setNewName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#171b26] border border-[#3d494c] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3d494c] bg-[#1c1f2a]">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#4cd7f6]" />
            <h3 className="font-display font-bold text-base text-[#dfe2f1]">
              Select Customer Profile
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
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {!showAddForm ? (
            <>
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs uppercase tracking-wider text-[#bcc9cd] font-mono">
                  Verified Merchant Entities
                </span>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-xs text-[#4cd7f6] hover:text-[#acedff] font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Customer
                </button>
              </div>

              <div className="space-y-2">
                {customers.map((cust) => {
                  const isSelected = cust.id === selectedCustomerId;
                  return (
                    <div
                      key={cust.id}
                      onClick={() => {
                        onSelectCustomer(cust);
                        onClose();
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#1c1f2a] border-[#06b6d4] shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                          : 'bg-[#1c1f2a]/60 border-[#3d494c] hover:border-[#869397] hover:bg-[#1c1f2a]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#262a35] border border-[#3d494c] flex items-center justify-center font-bold text-sm text-[#4cd7f6]">
                          {cust.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#dfe2f1]">
                              {cust.name}
                            </span>
                            {cust.verified && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-[#4cd7f6] bg-[#06b6d4]/10 px-1.5 py-0.5 rounded border border-[#06b6d4]/30">
                                <ShieldCheck className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#bcc9cd] font-mono mt-0.5">
                            ID: {cust.id} • {cust.category} • {cust.vpa}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#06b6d4] text-[#003640] flex items-center justify-center">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div className="text-xs font-semibold text-[#dfe2f1] uppercase tracking-wider">
                New Customer Entity
              </div>

              <div>
                <label className="text-xs text-[#bcc9cd] block mb-1">Company / Merchant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Textiles Ltd"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#262a35] border border-[#3d494c] rounded-lg px-3 py-2 text-sm text-[#dfe2f1] focus:border-[#06b6d4] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#bcc9cd] block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#262a35] border border-[#3d494c] rounded-lg px-3 py-2 text-sm text-[#dfe2f1] focus:border-[#06b6d4] focus:outline-none"
                  >
                    <option value="Wholesale">Wholesale</option>
                    <option value="Retail">Retail</option>
                    <option value="Services">Services</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#bcc9cd] block mb-1">Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-[#262a35] border border-[#3d494c] rounded-lg px-3 py-2 text-sm text-[#dfe2f1] focus:border-[#06b6d4] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#bcc9cd] block mb-1">Preferred VPA / Handle</label>
                <input
                  type="text"
                  placeholder="e.g. acmetextiles@okhdfcbank"
                  value={newVpa}
                  onChange={(e) => setNewVpa(e.target.value)}
                  className="w-full bg-[#262a35] border border-[#3d494c] rounded-lg px-3 py-2 text-sm text-[#dfe2f1] focus:border-[#06b6d4] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#06b6d4] hover:bg-[#4cd7f6] text-[#003640] font-bold text-sm py-2 rounded-lg transition-colors"
                >
                  Save & Select
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-[#3d494c] text-[#bcc9cd] hover:text-[#dfe2f1] text-sm rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
