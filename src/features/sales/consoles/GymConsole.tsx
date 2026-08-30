import React, { useState } from 'react';
import { formatCurrency } from '../../../lib/utils';
import { AppConfig } from '../../../types';
import { Dumbbell, User, CheckCircle2, ShieldCheck, Calendar, Flame } from 'lucide-react';

interface GymConsoleProps {
  appConfig: AppConfig | null;
  currency: string;
  currencySymbol: string;
  submitting: boolean;
  onComplete: (data: {
    customerName: string;
    memberPhone: string;
    membershipPlan: string;
    planStartDate: string;
    planExpiryDate: string;
    planFee: number;
    trainerName: string;
    trainerFee: number;
    lockerFee: number;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    notes: string;
  }) => Promise<void>;
}

export const GymConsole: React.FC<GymConsoleProps> = ({
  currency,
  currencySymbol,
  submitting,
  onComplete,
}) => {
  const [memberName, setMemberName] = useState('Kabir Malhotra');
  const [memberPhone, setMemberPhone] = useState('+91 98760 54321');
  const [membershipPlan, setMembershipPlan] = useState('3 Months Gold (Strength & Cardio)');
  const [planStartDate, setPlanStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [planExpiryDate, setPlanExpiryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().slice(0, 10);
  });
  const [planFee, setPlanFee] = useState<number>(6500);
  const [trainerName, setTrainerName] = useState('Coach Vikram (Personal Strength)');
  const [trainerFee, setTrainerFee] = useState<number>(3000);
  const [lockerFee, setLockerFee] = useState<number>(600);
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR');
  const [notes, setNotes] = useState('Goal: Hypertrophy & core stability. Locker #28 assigned.');

  const subtotal = planFee + trainerFee + lockerFee;
  const tax = Math.round(subtotal * 0.18); // 18% Gym GST
  const grandTotal = subtotal + tax;

  const handlePlanChange = (plan: string) => {
    setMembershipPlan(plan);
    const start = new Date(planStartDate);
    if (plan.includes('1 Month')) {
      setPlanFee(2500);
      start.setDate(start.getDate() + 30);
    } else if (plan.includes('3 Months')) {
      setPlanFee(6500);
      start.setDate(start.getDate() + 90);
    } else if (plan.includes('6 Months')) {
      setPlanFee(11500);
      start.setDate(start.getDate() + 180);
    } else if (plan.includes('12 Months')) {
      setPlanFee(18000);
      start.setDate(start.getDate() + 365);
    }
    setPlanExpiryDate(start.toISOString().slice(0, 10));
  };

  const handleConfirm = () => {
    onComplete({
      customerName: memberName,
      memberPhone,
      membershipPlan,
      planStartDate,
      planExpiryDate,
      planFee,
      trainerName,
      trainerFee,
      lockerFee,
      subtotal,
      tax,
      total: grandTotal,
      paymentMethod,
      notes,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Gym & Fitness Center Management</h2>
            <p className="text-xs text-muted-foreground">Enroll new gym members, configure training plans, and track validity renewals</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20">
          Member Onboarding
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Member Profile */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-orange-500" />
              <span>Gym Member Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Member Full Name</label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Kabir Malhotra"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Contact Phone / WhatsApp</label>
                <input
                  type="text"
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="+91 98760 54321"
                />
              </div>
            </div>
          </div>

          {/* Membership Tier & Validity */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Membership Subscription & Validity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-muted-foreground font-semibold mb-1">Membership Plan Duration</label>
                <select
                  value={membershipPlan}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                >
                  <option value="1 Month Bronze (Standard Access)">1 Month Bronze (Standard Access)</option>
                  <option value="3 Months Gold (Strength & Cardio)">3 Months Gold (Strength & Cardio)</option>
                  <option value="6 Months Diamond (All Access + Steam)">6 Months Diamond (All Access + Steam)</option>
                  <option value="12 Months Platinum VIP (Unlimited + CrossFit)">12 Months Platinum VIP (Unlimited + CrossFit)</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Base Plan Fee ({currencySymbol})</label>
                <input
                  type="number"
                  min="500"
                  value={planFee}
                  onChange={(e) => setPlanFee(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-orange-500" />
                  <span>Activation Date</span>
                </label>
                <input
                  type="date"
                  value={planStartDate}
                  onChange={(e) => setPlanStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-rose-500" />
                  <span>Membership Expiry Date (Auto-calculated)</span>
                </label>
                <input
                  type="date"
                  value={planExpiryDate}
                  onChange={(e) => setPlanExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Add-ons & Personal Trainer */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-orange-500" />
              <span>Trainer Allocation & Locker Add-ons</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Personal Fitness Coach</label>
                <input
                  type="text"
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Coach Vikram"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Personal Training Fee ({currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  value={trainerFee}
                  onChange={(e) => setTrainerFee(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Locker Rental Fee ({currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  value={lockerFee}
                  onChange={(e) => setLockerFee(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-muted-foreground font-semibold mb-1">Member Health Goals & Locker Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground text-xs focus:outline-none focus:border-primary"
                  placeholder="e.g. Goal: Hypertrophy & endurance. Locker #28 assigned."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Membership Summary */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Subscription Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Plan Membership Fee</span>
                <span className="font-mono">{formatCurrency(planFee, currency, currencySymbol)}</span>
              </div>
              {trainerFee > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Personal Coaching Add-on</span>
                  <span className="font-mono">{formatCurrency(trainerFee, currency, currencySymbol)}</span>
                </div>
              )}
              {lockerFee > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Private Locker Rental</span>
                  <span className="font-mono">{formatCurrency(lockerFee, currency, currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Fitness Club GST (18%)</span>
                <span className="font-mono">+{formatCurrency(tax, currency, currencySymbol)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-base font-extrabold text-foreground">
                <span>Total Fee Payable</span>
                <span className="text-orange-500 font-mono">
                  {formatCurrency(grandTotal, currency, currencySymbol)}
                </span>
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-xs">
              <span className="text-muted-foreground">Pass Validity:</span>
              <div className="font-bold text-foreground font-mono mt-0.5">{planStartDate} → {planExpiryDate}</div>
            </div>

            {/* Payment Method */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-medium text-xs focus:outline-none focus:border-primary"
              >
                <option value="UPI / QR">UPI / QR Code</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
                <option value="Cash at Reception">Cash at Reception</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            <button
              onClick={handleConfirm}
              disabled={submitting || !memberName}
              className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Activate Member & Issue Pass ({formatCurrency(grandTotal, currency, currencySymbol)})</span>
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-orange-500" />
              <span>Automated Excel Storage</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Activating this membership adds member records into <code className="text-primary font-mono">_Customers</code> and logs plan subscription into <code className="text-primary font-mono">_Sales</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
