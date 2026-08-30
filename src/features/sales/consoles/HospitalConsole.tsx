import React, { useState } from 'react';
import { formatCurrency } from '../../../lib/utils';
import { AppConfig } from '../../../types';
import { Activity, User, CheckCircle2, ShieldCheck, Stethoscope, FileText } from 'lucide-react';

interface HospitalConsoleProps {
  appConfig: AppConfig | null;
  currency: string;
  currencySymbol: string;
  submitting: boolean;
  onComplete: (data: {
    customerName: string;
    patientUhid: string;
    ageGender: string;
    bloodGroup: string;
    patientPhone: string;
    doctorName: string;
    department: string;
    encounterType: string;
    consultationFee: number;
    labInvestigationFee: number;
    bedNursingFee: number;
    medicineFee: number;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    notes: string;
  }) => Promise<void>;
}

export const HospitalConsole: React.FC<HospitalConsoleProps> = ({
  currency,
  currencySymbol,
  submitting,
  onComplete,
}) => {
  const [patientName, setPatientName] = useState('Sunita Deshmukh');
  const [patientUhid, setPatientUhid] = useState('UHID-2026-9102');
  const [ageGender, setAgeGender] = useState('42 / Female');
  const [bloodGroup, setBloodGroup] = useState('B+ Positive');
  const [patientPhone, setPatientPhone] = useState('+91 94231 09876');
  const [doctorName, setDoctorName] = useState('Dr. Rajesh Verma, MD');
  const [department, setDepartment] = useState('Cardiology & Internal Medicine');
  const [encounterType, setEncounterType] = useState('OPD Consultation');
  const [consultationFee, setConsultationFee] = useState<number>(1200);
  const [labInvestigationFee, setLabInvestigationFee] = useState<number>(2400);
  const [bedNursingFee, setBedNursingFee] = useState<number>(0);
  const [medicineFee, setMedicineFee] = useState<number>(1150);
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR');
  const [notes, setNotes] = useState('ECG normal, prescribed statin therapy and 2-week follow-up');

  const subtotal = consultationFee + labInvestigationFee + bedNursingFee + medicineFee;
  const tax = Math.round(medicineFee * 0.05); // 5% GST on pharmacy drugs
  const grandTotal = subtotal + tax;

  const handleConfirm = () => {
    onComplete({
      customerName: patientName,
      patientUhid,
      ageGender,
      bloodGroup,
      patientPhone,
      doctorName,
      department,
      encounterType,
      consultationFee,
      labInvestigationFee,
      bedNursingFee,
      medicineFee,
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
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Hospital & Clinic OPD Encounter Console</h2>
            <p className="text-xs text-muted-foreground">Register patient visits, consulting doctors, laboratory diagnostic tests, and medical billing</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full border border-rose-500/20">
          OPD Encounter Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Registry Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-rose-500" />
              <span>Patient Identification & Demographics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Patient Full Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Sunita Deshmukh"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Universal Health ID (UHID)</label>
                <input
                  type="text"
                  value={patientUhid}
                  onChange={(e) => setPatientUhid(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                  placeholder="UHID-2026-9102"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Age / Gender</label>
                <input
                  type="text"
                  value={ageGender}
                  onChange={(e) => setAgeGender(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="42 / Female"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                >
                  <option value="A+ Positive">A+ Positive</option>
                  <option value="A- Negative">A- Negative</option>
                  <option value="B+ Positive">B+ Positive</option>
                  <option value="B- Negative">B- Negative</option>
                  <option value="O+ Positive">O+ Positive</option>
                  <option value="O- Negative">O- Negative</option>
                  <option value="AB+ Positive">AB+ Positive</option>
                  <option value="AB- Negative">AB- Negative</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-muted-foreground font-semibold mb-1">Patient Phone / Emergency Contact</label>
                <input
                  type="text"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="+91 94231 09876"
                />
              </div>
            </div>
          </div>

          {/* Doctor & Medical Encounter */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-rose-500" />
              <span>Consulting Doctor & Specialty Department</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Consulting Physician</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Dr. Rajesh Verma, MD"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                >
                  <option value="Cardiology & Internal Medicine">Cardiology & Internal Medicine</option>
                  <option value="Orthopedics & Joint Surgery">Orthopedics & Joint Surgery</option>
                  <option value="Pediatrics & Child Care">Pediatrics & Child Care</option>
                  <option value="Dermatology & Skin">Dermatology & Skin</option>
                  <option value="General & Family Medicine">General & Family Medicine</option>
                  <option value="Neurology">Neurology</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Encounter Type</label>
                <select
                  value={encounterType}
                  onChange={(e) => setEncounterType(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                >
                  <option value="OPD Consultation">OPD Consultation</option>
                  <option value="Emergency Care">Emergency Care</option>
                  <option value="Daycare Procedure">Daycare Procedure</option>
                  <option value="In-Patient Ward">In-Patient Ward</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medical Services & Diagnostics */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4 text-rose-500" />
              <span>Diagnostic Investigations, Pharmacy & Nursing</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Doctor Consultation ({currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Lab / Tests ({currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  value={labInvestigationFee}
                  onChange={(e) => setLabInvestigationFee(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Bed / Nursing ({currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  value={bedNursingFee}
                  onChange={(e) => setBedNursingFee(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Prescription Drugs ({currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  value={medicineFee}
                  onChange={(e) => setMedicineFee(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="col-span-2 sm:col-span-4">
                <label className="block text-muted-foreground font-semibold mb-1">Diagnosis & Clinical Treatment Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground text-xs focus:outline-none focus:border-primary"
                  placeholder="e.g. ECG normal, prescribed statin therapy and 2-week follow-up"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Bill Summary */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Encounter Bill Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Doctor Consultation</span>
                <span className="font-mono">{formatCurrency(consultationFee, currency, currencySymbol)}</span>
              </div>
              {labInvestigationFee > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Diagnostic Pathology & Radiology</span>
                  <span className="font-mono">{formatCurrency(labInvestigationFee, currency, currencySymbol)}</span>
                </div>
              )}
              {bedNursingFee > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Daycare / Nursing</span>
                  <span className="font-mono">{formatCurrency(bedNursingFee, currency, currencySymbol)}</span>
                </div>
              )}
              {medicineFee > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Prescription Pharmacy</span>
                  <span className="font-mono">{formatCurrency(medicineFee, currency, currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>GST (5% Medicines)</span>
                <span className="font-mono">+{formatCurrency(tax, currency, currencySymbol)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-base font-extrabold text-foreground">
                <span>Total Hospital Bill</span>
                <span className="text-rose-500 font-mono">
                  {formatCurrency(grandTotal, currency, currencySymbol)}
                </span>
              </div>
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
                <option value="Health Insurance (TPA TPA Cashless)">Health Insurance (TPA Cashless)</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
                <option value="Cash Counter">Cash Counter</option>
              </select>
            </div>

            <button
              onClick={handleConfirm}
              disabled={submitting || !patientName}
              className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Generate Medical Bill ({formatCurrency(grandTotal, currency, currencySymbol)})</span>
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-rose-500" />
              <span>Permanent Health Records</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Recording this encounter archives patient registration into <code className="text-primary font-mono">_Customers</code> and logs clinical billing into <code className="text-primary font-mono">_Sales</code> in your local Excel database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
