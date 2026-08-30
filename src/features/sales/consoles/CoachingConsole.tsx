import React, { useState } from 'react';
import { formatCurrency } from '../../../lib/utils';
import { AppConfig } from '../../../types';
import { BookOpen, User, CheckCircle2, ShieldCheck, Calendar, Award } from 'lucide-react';

interface CoachingConsoleProps {
  appConfig: AppConfig | null;
  currency: string;
  currencySymbol: string;
  submitting: boolean;
  onComplete: (data: {
    customerName: string;
    studentPhone: string;
    courseName: string;
    batchSchedule: string;
    installmentNumber: string;
    installmentAmount: number;
    studyMaterialFee: number;
    nextDueDate: string;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    notes: string;
  }) => Promise<void>;
}

export const CoachingConsole: React.FC<CoachingConsoleProps> = ({
  currency,
  currencySymbol,
  submitting,
  onComplete,
}) => {
  const [studentName, setStudentName] = useState('Ishita Mukherjee');
  const [studentPhone, setStudentPhone] = useState('+91 97110 49281');
  const [courseName, setCourseName] = useState('JEE Advanced & Mains (2-Year Integrated)');
  const [batchSchedule, setBatchSchedule] = useState('Morning Elite Batch (7:00 AM - 11:30 AM)');
  const [installmentNumber, setInstallmentNumber] = useState('Installment 1 of 3');
  const [installmentAmount, setInstallmentAmount] = useState<number>(35000);
  const [studyMaterialFee, setStudyMaterialFee] = useState<number>(6500);
  const [nextDueDate, setNextDueDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR');
  const [notes, setNotes] = useState('Enrolled with Ranker Scholarship 15% discount');

  const subtotal = installmentAmount + studyMaterialFee;
  const tax = Math.round(subtotal * 0.18); // 18% GST for commercial training institutes
  const grandTotal = subtotal + tax;

  const handleConfirm = () => {
    onComplete({
      customerName: studentName,
      studentPhone,
      courseName,
      batchSchedule,
      installmentNumber,
      installmentAmount,
      studyMaterialFee,
      nextDueDate,
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
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Coaching & Tuition Institute Management</h2>
            <p className="text-xs text-muted-foreground">Manage batches, student enrollments, and tuition fee installment schedules</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full border border-purple-500/20">
          Enrollment Desk
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Identity Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-purple-500" />
              <span>Student Candidate Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Ishita Mukherjee"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Contact Phone / Parent WhatsApp</label>
                <input
                  type="text"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="+91 97110 49281"
                />
              </div>
            </div>
          </div>

          {/* Course & Batch Selection */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-500" />
              <span>Target Course & Batch Allocation</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Target Exam / Course</label>
                <select
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                >
                  <option value="JEE Advanced & Mains (2-Year Integrated)">JEE Advanced & Mains (2-Year Integrated)</option>
                  <option value="NEET Medical Entrance Masterclass">NEET Medical Entrance Masterclass</option>
                  <option value="Grade 10 Board Accelerator (Math & Science)">Grade 10 Board Accelerator (Math & Science)</option>
                  <option value="Fullstack AI & Software Engineering BootCamp">Fullstack AI & Software Engineering BootCamp</option>
                  <option value="Foundation Olympiad Prep (Grade 8-9)">Foundation Olympiad Prep (Grade 8-9)</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Batch Timing & Schedule</label>
                <select
                  value={batchSchedule}
                  onChange={(e) => setBatchSchedule(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                >
                  <option value="Morning Elite Batch (7:00 AM - 11:30 AM)">Morning Elite Batch (7:00 AM - 11:30 AM)</option>
                  <option value="Evening Super-30 Batch (4:00 PM - 8:30 PM)">Evening Super-30 Batch (4:00 PM - 8:30 PM)</option>
                  <option value="Weekend Intensive (Sat & Sun 9:00 AM - 3:00 PM)">Weekend Intensive (Sat & Sun 9:00 AM - 3:00 PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fee Installment Parameters */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <span>Installment Schedule & Study Material</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Installment Stage</label>
                <select
                  value={installmentNumber}
                  onChange={(e) => setInstallmentNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                >
                  <option value="Installment 1 of 3 (Admission)">Installment 1 of 3 (Admission)</option>
                  <option value="Installment 2 of 3 (Mid-term)">Installment 2 of 3 (Mid-term)</option>
                  <option value="Installment 3 of 3 (Final)">Installment 3 of 3 (Final)</option>
                  <option value="Full One-time Payment (Lump-sum)">Full One-time Payment (Lump-sum)</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Tuition Installment ({currencySymbol})</label>
                <input
                  type="number"
                  min="1000"
                  value={installmentAmount}
                  onChange={(e) => setInstallmentAmount(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Study Kit & Test Series ({currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  value={studyMaterialFee}
                  onChange={(e) => setStudyMaterialFee(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-muted-foreground font-semibold mb-1">Next Installment Due Date</label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Scholarship / Merit Remarks</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground text-xs focus:outline-none focus:border-primary"
                  placeholder="e.g. 15% scholarship applied"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Installment Summary */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Installment Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Tuition Installment</span>
                <span className="font-mono">{formatCurrency(installmentAmount, currency, currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Study Material & Online Tests</span>
                <span className="font-mono">{formatCurrency(studyMaterialFee, currency, currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST (18% Institute Tax)</span>
                <span className="font-mono">+{formatCurrency(tax, currency, currencySymbol)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-base font-extrabold text-foreground">
                <span>Current Payable</span>
                <span className="text-purple-500 font-mono">
                  {formatCurrency(grandTotal, currency, currencySymbol)}
                </span>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-xs">
              <span className="text-muted-foreground">Next Installment Due On:</span>
              <div className="font-bold text-foreground font-mono mt-0.5">{nextDueDate}</div>
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
                <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT / IMPS)</option>
                <option value="Cheque">Post-Dated Cheque</option>
              </select>
            </div>

            <button
              onClick={handleConfirm}
              disabled={submitting || !studentName}
              className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Record Installment ({formatCurrency(grandTotal, currency, currencySymbol)})</span>
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-purple-500" />
              <span>Synced with Excel Ledger</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Recording this fee updates enrolled student records in <code className="text-primary font-mono">_Customers</code> and writes an itemized transaction into <code className="text-primary font-mono">_Sales</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
