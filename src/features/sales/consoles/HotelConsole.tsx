import React, { useState } from 'react';
import { formatCurrency } from '../../../lib/utils';
import { AppConfig } from '../../../types';
import { Hotel, Calendar, User, CheckCircle2, ShieldCheck, Coffee } from 'lucide-react';

interface HotelConsoleProps {
  appConfig: AppConfig | null;
  currency: string;
  currencySymbol: string;
  submitting: boolean;
  onComplete: (data: {
    customerName: string;
    guestPhone: string;
    guestIdProof: string;
    roomNo: string;
    roomCategory: string;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    tariffPerNight: number;
    roomRentTotal: number;
    roomServiceExtras: number;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    notes: string;
  }) => Promise<void>;
}

export const HotelConsole: React.FC<HotelConsoleProps> = ({
  currency,
  currencySymbol,
  submitting,
  onComplete,
}) => {
  const [guestName, setGuestName] = useState('Vikramaditya Singhania');
  const [guestPhone, setGuestPhone] = useState('+91 99201 88472');
  const [guestIdProof, setGuestIdProof] = useState('Aadhaar: XXXX-XXXX-4912');
  const [roomNo, setRoomNo] = useState('Room 304');
  const [roomCategory, setRoomCategory] = useState('Executive Suite');
  const [checkInDate, setCheckInDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [nights, setNights] = useState<number>(3);
  const [tariffPerNight, setTariffPerNight] = useState<number>(4500);
  const [roomServiceExtras, setRoomServiceExtras] = useState<number>(1250);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [notes, setNotes] = useState('High floor room requested, complimentary breakfast included');

  // Calculations
  const roomRentTotal = nights * tariffPerNight;
  const subtotal = roomRentTotal + roomServiceExtras;
  const tax = Math.round(subtotal * 0.12); // 12% Hospitality GST
  const grandTotal = subtotal + tax;

  const handleConfirm = () => {
    onComplete({
      customerName: guestName,
      guestPhone,
      guestIdProof,
      roomNo,
      roomCategory,
      checkInDate,
      checkOutDate,
      nights,
      tariffPerNight,
      roomRentTotal,
      roomServiceExtras,
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
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Hotel className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Hotel & Resort Booking Management</h2>
            <p className="text-xs text-muted-foreground">Guest check-in folio, room nights reservation, and hospitality billing</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20">
          Front Desk Check-in
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Identity Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              <span>Guest Information & Govt ID</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Primary Guest Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Vikramaditya Singhania"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="+91 99201 88472"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Govt ID Proof (Passport / Aadhaar)</label>
                <input
                  type="text"
                  value={guestIdProof}
                  onChange={(e) => setGuestIdProof(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary font-mono"
                  placeholder="Aadhaar: XXXX-XXXX-4912"
                />
              </div>
            </div>
          </div>

          {/* Room Allocation & Stay Dates */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Hotel className="h-4 w-4 text-blue-500" />
              <span>Room Allocation & Duration of Stay</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Room / Suite Number</label>
                <input
                  type="text"
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold focus:outline-none focus:border-primary"
                  placeholder="Room 304"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Room Category</label>
                <select
                  value={roomCategory}
                  onChange={(e) => {
                    setRoomCategory(e.target.value);
                    if (e.target.value === 'Standard Non-AC') setTariffPerNight(2200);
                    if (e.target.value === 'Deluxe AC Room') setTariffPerNight(3500);
                    if (e.target.value === 'Executive Suite') setTariffPerNight(4500);
                    if (e.target.value === 'Penthouse Villa') setTariffPerNight(9000);
                  }}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                >
                  <option value="Standard Non-AC">Standard Non-AC (King Bed)</option>
                  <option value="Deluxe AC Room">Deluxe AC Room (Garden View)</option>
                  <option value="Executive Suite">Executive Suite (Living Room + Jacuzzi)</option>
                  <option value="Penthouse Villa">Penthouse Villa (Private Pool)</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Tariff per Night ({currencySymbol})</label>
                <input
                  type="number"
                  min="500"
                  value={tariffPerNight}
                  onChange={(e) => setTariffPerNight(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-blue-500" />
                  <span>Check-in Date</span>
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-blue-500" />
                  <span>Check-out Date</span>
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Total Nights Count</label>
                <input
                  type="number"
                  min="1"
                  value={nights}
                  onChange={(e) => setNights(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Incidentals & Dining Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Coffee className="h-4 w-4 text-blue-500" />
              <span>Dining, Room Service & Spa Incidentals</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Room Service / Restaurant Charges ({currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  value={roomServiceExtras}
                  onChange={(e) => setRoomServiceExtras(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Special Guest Preferences & Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground text-xs focus:outline-none focus:border-primary"
                  placeholder="e.g. Extra pillows, airport drop on checkout"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Folio Summary */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Guest Folio Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Room Rent ({nights} nights × {formatCurrency(tariffPerNight, currency, currencySymbol)})</span>
                <span className="font-mono">{formatCurrency(roomRentTotal, currency, currencySymbol)}</span>
              </div>
              {roomServiceExtras > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Room Service & Incidentals</span>
                  <span className="font-mono">{formatCurrency(roomServiceExtras, currency, currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Hospitality GST (12%)</span>
                <span className="font-mono">+{formatCurrency(tax, currency, currencySymbol)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-base font-extrabold text-foreground">
                <span>Total Folio Amount</span>
                <span className="text-blue-500 font-mono">
                  {formatCurrency(grandTotal, currency, currencySymbol)}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Settlement Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-foreground font-medium text-xs focus:outline-none focus:border-primary"
              >
                <option value="Credit Card">Credit / Debit Card (Card Machine)</option>
                <option value="Cash at Reception">Cash at Reception</option>
                <option value="UPI / QR">UPI / Instant QR</option>
                <option value="Corporate Billing">Corporate Billing / Direct Bill</option>
              </select>
            </div>

            <button
              onClick={handleConfirm}
              disabled={submitting || !guestName || !roomNo}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Complete Check-in & Reserve ({formatCurrency(grandTotal, currency, currencySymbol)})</span>
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <span>Direct Excel Synchronization</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Recording this check-in folio immediately writes room occupancy to <code className="text-primary font-mono">_Inventory</code> and records stay billing into <code className="text-primary font-mono">_Sales</code> in your local Excel file.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
