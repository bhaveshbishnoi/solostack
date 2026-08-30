import React, { useState } from 'react';
import { formatCurrency } from '../../../lib/utils';
import { AppConfig } from '../../../types';
import { Car, MapPin, User, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

interface TaxiConsoleProps {
  appConfig: AppConfig | null;
  currency: string;
  currencySymbol: string;
  submitting: boolean;
  onComplete: (data: {
    customerName: string;
    pickupLocation: string;
    dropLocation: string;
    cabType: string;
    driverName: string;
    vehicleNo: string;
    distanceKm: number;
    baseFare: number;
    ratePerKm: number;
    waitingMins: number;
    waitingCharge: number;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    driverCommissionRate: number;
    driverPayout: number;
    notes: string;
  }) => Promise<void>;
}

export const TaxiConsole: React.FC<TaxiConsoleProps> = ({
  currency,
  currencySymbol,
  submitting,
  onComplete,
}) => {
  const [passengerName, setPassengerName] = useState('Ananya Sharma');
  const [passengerPhone, setPassengerPhone] = useState('+91 98112 34567');
  const [pickupLocation, setPickupLocation] = useState('Terminal 3, IGI Airport');
  const [dropLocation, setDropLocation] = useState('Cyber City, Sector 24, Gurugram');
  const [cabType, setCabType] = useState('Sedan');
  const [driverName, setDriverName] = useState('Rameshwar Kumar');
  const [vehicleNo, setVehicleNo] = useState('DL 01 TA 4921');
  const [distanceKm, setDistanceKm] = useState<number>(24);
  const [ratePerKm, setRatePerKm] = useState<number>(22);
  const [baseFare, setBaseFare] = useState<number>(100);
  const [waitingMins, setWaitingMins] = useState<number>(15);
  const [waitingRatePerMin] = useState<number>(3);
  const [driverCommissionRate, setDriverCommissionRate] = useState<number>(20);
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR');
  const [notes, setNotes] = useState('Airport pickup with luggage assist requested');

  // Calculations
  const distanceFare = distanceKm * ratePerKm;
  const waitingCharge = waitingMins * waitingRatePerMin;
  const subtotal = baseFare + distanceFare + waitingCharge;
  const tax = Math.round(subtotal * 0.05); // 5% GST for passenger transport
  const grandTotal = subtotal + tax;
  const driverPayout = Math.round(grandTotal * (1 - driverCommissionRate / 100));

  const handleConfirm = () => {
    onComplete({
      customerName: passengerName,
      pickupLocation,
      dropLocation,
      cabType,
      driverName,
      vehicleNo,
      distanceKm,
      baseFare,
      ratePerKm,
      waitingMins,
      waitingCharge,
      subtotal,
      tax,
      total: grandTotal,
      paymentMethod,
      driverCommissionRate,
      driverPayout,
      notes,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Taxi & Cab Fleet Dispatch Console</h2>
            <p className="text-xs text-muted-foreground">Book passenger trips, assign fleet drivers, and compute distance fares</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
          Trip Dispatch Mode
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Passenger & Route Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-amber-500" />
              <span>Passenger & Route Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Passenger Name</label>
                <input
                  type="text"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Ananya Sharma"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Passenger Phone</label>
                <input
                  type="text"
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="+91 98112 34567"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Pickup Location</span>
                </label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Airport, Hotel, Street Address"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                  <span>Drop-off Destination</span>
                </label>
                <input
                  type="text"
                  value={dropLocation}
                  onChange={(e) => setDropLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Office Complex, Residence, Railway Station"
                />
              </div>
            </div>
          </div>

          {/* Cab & Driver Assignment Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Car className="h-4 w-4 text-amber-500" />
              <span>Fleet Vehicle & Driver Assignment</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Vehicle Category</label>
                <select
                  value={cabType}
                  onChange={(e) => {
                    setCabType(e.target.value);
                    if (e.target.value === 'Hatchback') setRatePerKm(16);
                    if (e.target.value === 'Sedan') setRatePerKm(22);
                    if (e.target.value === 'SUV') setRatePerKm(30);
                    if (e.target.value === 'Luxury') setRatePerKm(50);
                    if (e.target.value === 'Outstation') setRatePerKm(25);
                  }}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                >
                  <option value="Hatchback">Hatchback (Standard 4 Seater)</option>
                  <option value="Sedan">Sedan (Comfort Prime 4 Seater)</option>
                  <option value="SUV">SUV (Innova / Ertiga 6-7 Seater)</option>
                  <option value="Luxury">Luxury Class (Mercedes / BMW)</option>
                  <option value="Outstation">Outstation Roundtrip Cab</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Driver Name</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary"
                  placeholder="e.g. Rameshwar Kumar"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Cab Reg / Plate Number</label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary font-mono"
                  placeholder="DL 01 TA 4921"
                />
              </div>
            </div>
          </div>

          {/* Fare Structure Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>Distance & Rate Parameters</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Estimated Distance (km)</label>
                <input
                  type="number"
                  min="1"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Rate per km ({currencySymbol})</label>
                <input
                  type="number"
                  min="5"
                  value={ratePerKm}
                  onChange={(e) => setRatePerKm(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Base Pickup Fare ({currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  value={baseFare}
                  onChange={(e) => setBaseFare(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Waiting Time (mins)</label>
                <input
                  type="number"
                  min="0"
                  value={waitingMins}
                  onChange={(e) => setWaitingMins(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground font-bold font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1 text-xs">Trip Special Instructions / Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-foreground text-xs focus:outline-none focus:border-primary"
                placeholder="e.g. AC on, flight delay buffer, toll paid in advance"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Fare Summary & Dispatch */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Trip Fare Estimate
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Base Booking Fare</span>
                <span className="font-mono">{formatCurrency(baseFare, currency, currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Distance Fare ({distanceKm} km × {formatCurrency(ratePerKm, currency, currencySymbol)})</span>
                <span className="font-mono">{formatCurrency(distanceFare, currency, currencySymbol)}</span>
              </div>
              {waitingCharge > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Waiting Charges ({waitingMins} mins)</span>
                  <span className="font-mono">{formatCurrency(waitingCharge, currency, currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>GST (5% Transport)</span>
                <span className="font-mono">+{formatCurrency(tax, currency, currencySymbol)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-base font-extrabold text-foreground">
                <span>Total Passenger Fare</span>
                <span className="text-amber-500 font-mono">
                  {formatCurrency(grandTotal, currency, currencySymbol)}
                </span>
              </div>
            </div>

            {/* Driver Payout Split Card */}
            <div className="bg-muted/30 border border-border/80 rounded-xl p-3 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <label className="flex items-center gap-1 text-muted-foreground">
                  <span>Commission:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={driverCommissionRate}
                    onChange={(e) => setDriverCommissionRate(Number(e.target.value) || 0)}
                    className="w-12 px-1 py-0.5 text-center font-bold bg-background border border-border rounded text-foreground font-mono"
                  />
                  <span>%</span>
                </label>
                <span className="font-mono text-muted-foreground">
                  {formatCurrency(Math.round(grandTotal * (driverCommissionRate / 100)), currency, currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-emerald-500">
                <span>Driver Net Payout</span>
                <span className="font-mono">
                  {formatCurrency(driverPayout, currency, currencySymbol)}
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
                <option value="Cash to Driver">Cash to Driver</option>
                <option value="Credit Card">Credit / Debit Card</option>
                <option value="Corporate Invoice">Corporate Account (Invoice)</option>
              </select>
            </div>

            <button
              onClick={handleConfirm}
              disabled={submitting || !passengerName || !pickupLocation || !dropLocation}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirm & Dispatch Trip ({formatCurrency(grandTotal, currency, currencySymbol)})</span>
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              <span>Automated Excel Storage</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Dispatching this trip automatically writes a new row to <code className="text-primary font-mono">_Sales</code> and logs driver commission to your local Excel workbook.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
