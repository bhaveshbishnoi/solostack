import React, { useState } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useUIStore } from '../../stores/uiStore';
import { X, Wallet, PlusCircle } from 'lucide-react';

export const AddExpenseModal: React.FC = () => {
  const { activeModal, closeModal, addNotification } = useUIStore();
  const { addRow, saveWorkbook } = useWorkbookStore();

  const isOpen = activeModal === 'add_expense';

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Rent & Utilities');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [gst, setGst] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      addNotification('warning', 'Validation Error', 'Expense amount must be greater than zero');
      return;
    }

    try {
      const expenseId = `exp_${Date.now()}`;

      addRow('_Expenses', {
        expense_id: expenseId,
        date,
        category,
        description,
        amount,
        gst,
        payment_method: paymentMethod,
        notes,
      });

      await saveWorkbook();
      addNotification('success', 'Expense Recorded', `Recorded expense of ${amount}`);
      closeModal();
    } catch (err: any) {
      addNotification('error', 'Error', err.message || 'Failed to record expense');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-rose-500" />
            <h3 className="text-base font-bold text-foreground">Record Expense</h3>
          </div>
          <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-medium text-foreground mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              >
                <option>Rent & Utilities</option>
                <option>Salaries & Wages</option>
                <option>Packaging & Shipping</option>
                <option>Office & Supplies</option>
                <option>Marketing & Ads</option>
                <option>Taxes & Licenses</option>
                <option>Maintenance & Repairs</option>
                <option>Miscellaneous</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Description *</label>
            <input
              required
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Monthly Internet Bill or Packing Material"
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">Amount *</label>
              <input
                required
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-medium text-foreground mb-1">GST Included</label>
              <input
                type="number"
                min="0"
                step="any"
                value={gst}
                onChange={(e) => setGst(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
            >
              <option>UPI</option>
              <option>Bank Transfer / NEFT</option>
              <option>Credit Card</option>
              <option>Debit Card</option>
              <option>Cash</option>
              <option>Cheque</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes"
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={closeModal}
              className="px-3 py-1.5 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Record Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
