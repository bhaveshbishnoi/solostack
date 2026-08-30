import React, { useState } from 'react';
import { formatCurrency } from '../../../lib/utils';
import { AppConfig } from '../../../types';
import { GraduationCap, User, CheckCircle2, ShieldCheck, BookOpen } from 'lucide-react';

interface SchoolConsoleProps {
  appConfig: AppConfig | null;
  currency: string;
  currencySymbol: string;
  submitting: boolean;
  onComplete: (data: {
    customerName: string;
    studentRollNo: string;
    studentGrade: string;
    guardianName: string;
    guardianPhone: string;
    academicTerm: string;
    tuitionFee: number;
    labLibraryFee: number;
    transportFee: number;
    activityFee: number;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    notes: string;
  }) => Promise<void>;
}

export const SchoolConsole: React.FC<SchoolConsoleProps> = ({
  currency,
  currencySymbol,
  submitting,
  onComplete,
}) => {
  const [studentName, setStudentName] = useState('Aarav Patel');
  const [studentRollNo, setStudentRollNo] = useState('SCH-2026-084');
  const [studentGrade, setStudentGrade] = useState('Grade 8 - Section A');
  const [guardianName, setGuardianName] = useState('Nilesh Patel');
  const [guardianPhone, setGuardianPhone] = useState('+91 98230 11928');
  const [academicTerm, setAcademicTerm] = useState('Term 1 (Apr - Sep 2026)');
  const [tuitionFee, setTuitionFee] = useState<number>(24000);
  const [labLibraryFee, setLabLibraryFee] = useState<number>(3500);
  const [transportFee, setTransportFee] = useState<number>(4800);
  const [activityFee, setActivityFee] = useState<number>(1500);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer / NEFT');
  const [notes, setNotes] = useState('Transport availed for Route #12 (Civil Lines)');

  const subtotal = tuitionFee + labLibraryFee + transportFee + activityFee;
  const tax = 0; // Educational school tuition is typically GST exempt
  const grandTotal = subtotal + tax;

  const handleConfirm = () => {
    onComplete({
      customerName: studentName,
      studentRollNo,
      studentGrade,
      guardianName,
      guardianPhone,
      academicTerm,
      tuitionFee,
      labLibraryFee,
      transportFee,
      activityFee,
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
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">School Management & Student Fee Collection</h2>
            <p className="text-xs text-muted-foreground">Manage student enrollments, grade rosters, and academic term tuition receipts</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
          Fee Counter Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student & Guardian Profile */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-500" />
              <span>Student & Parent Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Aarav Patel"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Admission / Roll Number</label>
                <input
                  type="text"
                  value={studentRollNo}
                  onChange={(e) => setStudentRollNo(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                  placeholder="SCH-2026-084"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Class / Grade Section</label>
                <select
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                >
                  <option value="Kindergarten / Pre-primary">Kindergarten / Pre-primary</option>
                  <option value="Grade 1 - Section A">Grade 1 - Section A</option>
                  <option value="Grade 5 - Section B">Grade 5 - Section B</option>
                  <option value="Grade 8 - Section A">Grade 8 - Section A</option>
                  <option value="Grade 10 - Secondary">Grade 10 - Secondary</option>
                  <option value="Grade 12 - Senior Secondary (Science)">Grade 12 - Senior Secondary (Science)</option>
                  <option value="Grade 12 - Senior Secondary (Commerce)">Grade 12 - Senior Secondary (Commerce)</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Guardian / Parent Name</label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Nilesh Patel"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Guardian Contact Phone</label>
                <input
                  type="text"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="+91 98230 11928"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Academic Term / Period</label>
                <select
                  value={academicTerm}
                  onChange={(e) => setAcademicTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                >
                  <option value="Term 1 (Apr - Sep 2026)">Term 1 (Apr - Sep 2026)</option>
                  <option value="Term 2 (Oct - Mar 2027)">Term 2 (Oct - Mar 2027)</option>
                  <option value="Full Academic Year (Annual)">Full Academic Year (Annual)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Itemized Fee Structure */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-500" />
              <span>Academic Fee Heads & Structure</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Tuition Fee ({currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  value={tuitionFee}
                  onChange={(e) => setTuitionFee(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Science & Lab ({currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  value={labLibraryFee}
                  onChange={(e) => setLabLibraryFee(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">School Bus / Cab ({currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  value={transportFee}
                  onChange={(e) => setTransportFee(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Sports & Extra ({currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  value={activityFee}
                  onChange={(e) => setActivityFee(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1 text-xs">Fee Notes / Scholarship Deductions</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground text-xs focus:outline-none focus:border-primary"
                placeholder="e.g. Merit concession applied, cheque #40921"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Fee Summary */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Term Fee Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Tuition Fee</span>
                <span className="font-mono">{formatCurrency(tuitionFee, currency, currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Lab & Library</span>
                <span className="font-mono">{formatCurrency(labLibraryFee, currency, currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>School Transport</span>
                <span className="font-mono">{formatCurrency(transportFee, currency, currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Sports & Activity</span>
                <span className="font-mono">{formatCurrency(activityFee, currency, currencySymbol)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-base font-extrabold text-foreground">
                <span>Total Fee Payable</span>
                <span className="text-emerald-500 font-mono">
                  {formatCurrency(grandTotal, currency, currencySymbol)}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Collection Mode</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-medium text-xs focus:outline-none focus:border-primary"
              >
                <option value="Bank Transfer / NEFT">Bank Transfer / NEFT / IMPS</option>
                <option value="UPI / Online QR">UPI / Parent QR</option>
                <option value="Bank Cheque / DD">Bank Cheque / Demand Draft</option>
                <option value="Cash at School Counter">Cash at School Counter</option>
              </select>
            </div>

            <button
              onClick={handleConfirm}
              disabled={submitting || !studentName || !studentRollNo}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Issue School Fee Receipt ({formatCurrency(grandTotal, currency, currencySymbol)})</span>
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Permanent Academic Audit</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Issuing this receipt writes student enrollment records into <code className="text-primary font-mono">_Customers</code> and fee receipts into <code className="text-primary font-mono">_Sales</code> in your local Excel workbook.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
