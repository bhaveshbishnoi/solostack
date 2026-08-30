import React, { useState } from 'react';
import { formatCurrency } from '../../../lib/utils';
import { AppConfig } from '../../../types';
import { BadgeDollarSign, User, CheckCircle2, ShieldCheck, Building2, Wallet } from 'lucide-react';

interface PayrollConsoleProps {
  appConfig: AppConfig | null;
  currency: string;
  currencySymbol: string;
  submitting: boolean;
  onComplete: (data: {
    customerName: string;
    employeeId: string;
    designation: string;
    department: string;
    bankAccount: string;
    payMonth: string;
    basicSalary: number;
    hra: number;
    specialAllowance: number;
    grossSalary: number;
    pfDeduction: number;
    esiDeduction: number;
    taxTds: number;
    totalDeductions: number;
    netTakeHome: number;
    paymentMethod: string;
    notes: string;
  }) => Promise<void>;
}

export const PayrollConsole: React.FC<PayrollConsoleProps> = ({
  currency,
  currencySymbol,
  submitting,
  onComplete,
}) => {
  const [employeeName, setEmployeeName] = useState('Rahul Sengupta');
  const [employeeId, setEmployeeId] = useState('EMP-1042');
  const [designation, setDesignation] = useState('Staff Software Engineer');
  const [department, setDepartment] = useState('Engineering & Cloud Platform');
  const [bankAccount, setBankAccount] = useState('HDFC Bank • A/C ending 8912');
  const [payMonth, setPayMonth] = useState('August 2026');
  const [basicSalary, setBasicSalary] = useState<number>(65000);
  const [hra, setHra] = useState<number>(26000);
  const [specialAllowance, setSpecialAllowance] = useState<number>(14000);
  const [pfDeduction, setPfDeduction] = useState<number>(3600);
  const [esiDeduction, setEsiDeduction] = useState<number>(0);
  const [taxTds, setTaxTds] = useState<number>(5400);
  const [paymentMethod, setPaymentMethod] = useState('Direct Bank Transfer (NEFT)');
  const [notes, setNotes] = useState('Monthly salary credited on 31st with standard tax deduction');

  // Calculations
  const grossSalary = basicSalary + hra + specialAllowance;
  const totalDeductions = pfDeduction + esiDeduction + taxTds;
  const netTakeHome = grossSalary - totalDeductions;

  const handleConfirm = () => {
    onComplete({
      customerName: employeeName,
      employeeId,
      designation,
      department,
      bankAccount,
      payMonth,
      basicSalary,
      hra,
      specialAllowance,
      grossSalary,
      pfDeduction,
      esiDeduction,
      taxTds,
      totalDeductions,
      netTakeHome,
      paymentMethod,
      notes,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
            <BadgeDollarSign className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Company Payroll & Payslip Disbursal Console</h2>
            <p className="text-xs text-muted-foreground">Manage employee rosters, salary components, statutory deductions, and official payslips</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 bg-teal-500/10 text-teal-500 rounded-full border border-teal-500/20">
          Pay Run: {payMonth}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employee Profile Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-teal-500" />
              <span>Employee Employment Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Employee Full Name</label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Rahul Sengupta"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Employee ID / Code</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                  placeholder="EMP-1042"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Pay Cycle Month</label>
                <input
                  type="text"
                  value={payMonth}
                  onChange={(e) => setPayMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="August 2026"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Designation / Role</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                >
                  <option value="Engineering & Cloud Platform">Engineering & Cloud Platform</option>
                  <option value="Product Design & UX">Product Design & UX</option>
                  <option value="Sales & Business Development">Sales & Business Development</option>
                  <option value="Operations & Logistics">Operations & Logistics</option>
                  <option value="Human Resources & Legal">Human Resources & Legal</option>
                  <option value="Finance & Accounts">Finance & Accounts</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Disbursal Bank A/C</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-mono focus:outline-none focus:border-primary"
                  placeholder="HDFC Bank • ending 8912"
                />
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Dual Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Earnings Card */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span>Gross Earnings</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Basic Salary ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">House Rent Allowance (HRA)</label>
                  <input
                    type="number"
                    min="0"
                    value={hra}
                    onChange={(e) => setHra(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Special / Conveyance Allowance</label>
                  <input
                    type="number"
                    min="0"
                    value={specialAllowance}
                    onChange={(e) => setSpecialAllowance(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-2 border-t border-border flex justify-between font-bold text-foreground">
                  <span>Total Gross Earnings:</span>
                  <span className="font-mono text-emerald-500">{formatCurrency(grossSalary, currency, currencySymbol)}</span>
                </div>
              </div>
            </div>

            {/* Deductions Card */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>Statutory Deductions</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Provident Fund (PF - 12%)</label>
                  <input
                    type="number"
                    min="0"
                    value={pfDeduction}
                    onChange={(e) => setPfDeduction(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Employee State Insurance (ESI)</label>
                  <input
                    type="number"
                    min="0"
                    value={esiDeduction}
                    onChange={(e) => setEsiDeduction(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">TDS / Professional Tax</label>
                  <input
                    type="number"
                    min="0"
                    value={taxTds}
                    onChange={(e) => setTaxTds(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-2 border-t border-border flex justify-between font-bold text-foreground">
                  <span>Total Deductions:</span>
                  <span className="font-mono text-rose-500">-{formatCurrency(totalDeductions, currency, currencySymbol)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 text-xs space-y-1.5 shadow-2xs">
            <label className="block text-muted-foreground font-semibold">Payslip Notes & Remarks</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground text-xs focus:outline-none focus:border-primary"
              placeholder="e.g. Monthly salary credited on 31st with standard tax deduction"
            />
          </div>
        </div>

        {/* Right Col: Pay Run Summary */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Net Disbursal Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Total Gross Earnings</span>
                <span className="font-mono">{formatCurrency(grossSalary, currency, currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-rose-500 font-medium">
                <span>Statutory Deductions</span>
                <span className="font-mono">-{formatCurrency(totalDeductions, currency, currencySymbol)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-base font-extrabold text-foreground">
                <span>Net Take-Home Pay</span>
                <span className="text-teal-500 font-mono text-lg">
                  {formatCurrency(netTakeHome, currency, currencySymbol)}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Disbursal Channel</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-medium text-xs focus:outline-none focus:border-primary"
              >
                <option value="Direct Bank Transfer (NEFT)">Direct Bank Transfer (NEFT / RTGS)</option>
                <option value="Instant UPI Payment">Corporate UPI Transfer</option>
                <option value="Company Cheque">Company Bank Cheque</option>
                <option value="Cash Voucher">Direct Cash Voucher</option>
              </select>
            </div>

            <button
              onClick={handleConfirm}
              disabled={submitting || !employeeName || !employeeId}
              className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Process Pay Run & Issue Payslip ({formatCurrency(netTakeHome, currency, currencySymbol)})</span>
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-teal-500" />
              <span>Local Excel Audit Trail</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Processing this pay run writes the monthly employee salary disbursement into <code className="text-primary font-mono">_Sales</code> and logs statutory records for financial audits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
