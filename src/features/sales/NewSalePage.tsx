import React, { useState, useMemo } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import { formatCurrency, formatDate } from '../../lib/utils';
import { getBusinessFlowType } from '../../types';
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  CheckCircle2,
  Printer,
  Search,
  Plus,
  Receipt,
  RotateCcw,
  LayoutGrid,
  List,
  Store,
  Truck,
  Stethoscope,
  Briefcase,
  Factory,
  AlertTriangle,
  Boxes,
  Cpu,
  Wrench,
  Car,
  Hotel,
  GraduationCap,
  BookOpen,
  BadgeDollarSign,
  Dumbbell,
  Activity
} from 'lucide-react';
import { TaxiConsole } from './consoles/TaxiConsole';
import { HotelConsole } from './consoles/HotelConsole';
import { SchoolConsole } from './consoles/SchoolConsole';
import { CoachingConsole } from './consoles/CoachingConsole';
import { PayrollConsole } from './consoles/PayrollConsole';
import { GymConsole } from './consoles/GymConsole';
import { HospitalConsole } from './consoles/HospitalConsole';

interface CartItem {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  gstRate: number;
  availableStock: number;
  // Pharmacy fields
  batchNo?: string;
  expiryDate?: string;
  // Services fields
  isService?: boolean;
  serviceHours?: number;
  milestoneDescription?: string;
}

export const NewSalePage: React.FC = () => {
  const { sheets, addRow, updateRow, saveWorkbook, appConfig, setActiveSheet } = useWorkbookStore();
  const { defaultPaymentMethod } = useSettingsStore();
  const { addNotification } = useUIStore();

  // Active business edition is determined strictly by the user's business type
  const currentFlow = getBusinessFlowType(appConfig?.businessType);

  const editionInfo = useMemo(() => {
    switch (currentFlow) {
      case 'pharmacy':
        return {
          title: 'Pharmacy Rx & Medicine Dispensing',
          badge: 'Pharmacy Edition',
          icon: Stethoscope,
          iconColor: 'text-emerald-500',
        };
      case 'wholesale':
        return {
          title: 'Wholesale B2B Order & Dispatch',
          badge: 'Wholesale B2B Edition',
          icon: Truck,
          iconColor: 'text-indigo-400',
        };
      case 'services':
        return {
          title: 'Client Invoicing & Services Retainers',
          badge: 'Services Edition',
          icon: Briefcase,
          iconColor: 'text-amber-400',
        };
      case 'manufacturing':
        return {
          title: 'Manufacturing & BOM Assembly Console',
          badge: 'Manufacturing Edition',
          icon: Factory,
          iconColor: 'text-cyan-400',
        };
      case 'taxi':
        return {
          title: 'Taxi & Cab Fleet Dispatch Console',
          badge: 'Taxi Edition',
          icon: Car,
          iconColor: 'text-amber-500',
        };
      case 'hotel':
        return {
          title: 'Hotel Room Booking & Check-in Console',
          badge: 'Hotel Edition',
          icon: Hotel,
          iconColor: 'text-blue-500',
        };
      case 'school':
        return {
          title: 'School Admission & Term Fee Collection',
          badge: 'School Edition',
          icon: GraduationCap,
          iconColor: 'text-emerald-500',
        };
      case 'coaching':
        return {
          title: 'Coaching Enrollment & Fee Installments',
          badge: 'Coaching Edition',
          icon: BookOpen,
          iconColor: 'text-purple-500',
        };
      case 'payroll':
        return {
          title: 'Company Payroll & Payslip Disbursal',
          badge: 'Payroll Edition',
          icon: BadgeDollarSign,
          iconColor: 'text-teal-500',
        };
      case 'gym':
        return {
          title: 'Gym Membership & Renewal Console',
          badge: 'Gym Edition',
          icon: Dumbbell,
          iconColor: 'text-orange-500',
        };
      case 'hospital':
        return {
          title: 'Hospital OPD & Patient Medical Billing',
          badge: 'Hospital Edition',
          icon: Activity,
          iconColor: 'text-rose-500',
        };
      case 'retail':
      default:
        return {
          title: 'Retail Point of Sale (POS)',
          badge: 'Retail POS Edition',
          icon: Store,
          iconColor: 'text-primary',
        };
    }
  }, [currentFlow]);

  const [catalogViewMode, setCatalogViewMode] = useState<'table' | 'grid'>('table');

  const currencySymbol = appConfig?.currencySymbol || '₹';
  const currency = appConfig?.currency || 'INR';

  const customerRows = sheets['_Customers']?.rows || [];
  const productRows = sheets['_Products']?.rows || [];
  const inventoryRows = sheets['_Inventory']?.rows || [];
  const categoryRows = sheets['_Categories']?.rows || [];

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk_in');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(defaultPaymentMethod || 'Cash');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Wholesale specific states
  const [creditTerms, setCreditTerms] = useState<'immediate' | 'net_15' | 'net_30' | 'net_60'>('immediate');
  const [poNumber, setPoNumber] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState<'draft' | 'ready_for_dispatch' | 'in_transit' | 'delivered'>('ready_for_dispatch');
  const [transporterName, setTransporterName] = useState('');
  const [wholesaleTierDiscount, setWholesaleTierDiscount] = useState<number>(0);

  // Pharmacy specific states
  const [doctorName, setDoctorName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [prescriptionId, setPrescriptionId] = useState('');

  // Services specific states
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceBillingType, setServiceBillingType] = useState<'hourly' | 'fixed_milestone' | 'retainer'>('hourly');
  const [serviceHours, setServiceHours] = useState<number>(10);
  const [serviceHourlyRate, setServiceHourlyRate] = useState<number>(1500);
  const [serviceScope, setServiceScope] = useState('');

  // Manufacturing & Assembly (BOM) states
  const [selectedBomProduct, setSelectedBomProduct] = useState<string>(productRows[0]?.product_id || 'prod_1');
  const [productionQty, setProductionQty] = useState<number>(5);
  const [completedProduction, setCompletedProduction] = useState<any | null>(null);

  // Completed order receipt state
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  // Available stock lookup
  const stockMap = useMemo(() => {
    const map: Record<string, number> = {};
    inventoryRows.forEach((inv) => {
      map[inv.product_id] = Number(inv.quantity || 0);
    });
    return map;
  }, [inventoryRows]);

  // Filtered products for catalog
  const filteredProducts = useMemo(() => {
    return productRows.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        String(p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [productRows, selectedCategory, searchQuery]);

  // Check for any near-expiry items in cart (Pharmacy flow)
  const nearExpiryCartItems = useMemo(() => {
    if (currentFlow !== 'pharmacy') return [];
    const now = new Date().getTime();
    const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
    return cart.filter((item) => {
      if (!item.expiryDate) return false;
      const exp = new Date(item.expiryDate).getTime();
      return exp - now < sixtyDaysMs;
    });
  }, [cart, currentFlow]);

  // Calculate Wholesale credit due date
  const creditDueDate = useMemo(() => {
    if (creditTerms === 'immediate') return 'Due on Receipt';
    const days = creditTerms === 'net_15' ? 15 : creditTerms === 'net_30' ? 30 : 60;
    const due = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return due.toISOString().split('T')[0];
  }, [creditTerms]);

  // Handle Add Product to Cart
  const handleAddToCart = (productId: string) => {
    const prod = productRows.find((p) => p.product_id === productId);
    if (!prod) return;

    const available = stockMap[productId] ?? 0;
    const existing = cart.find((item) => item.productId === productId);

    if (existing) {
      setCart(
        cart.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      if (available <= 0 && currentFlow !== 'services') {
        addNotification('warning', 'Low Stock Warning', `Product currently has 0 physical stock in inventory`);
      }
      
      // Auto-generate realistic demo batch / expiry for pharmacy flow if missing
      const randomBatch = `BATCH-${Math.floor(1000 + Math.random() * 9000)}`;
      const futureDate = new Date(Date.now() + (120 + Math.floor(Math.random() * 200)) * 86400000).toISOString().split('T')[0];

      setCart([
        ...cart,
        {
          productId: prod.product_id,
          name: prod.name,
          sku: prod.sku || '',
          unitPrice: Number(prod.selling_price || 0),
          quantity: 1,
          discount: 0,
          gstRate: Number(prod.gst_rate || appConfig?.defaultTaxRate || 18),
          availableStock: available,
          batchNo: randomBatch,
          expiryDate: futureDate,
          isService: false,
        },
      ]);
    }
  };

  // Add Custom Service item (Services Flow)
  const handleAddCustomService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTitle.trim()) {
      addNotification('warning', 'Missing Title', 'Please enter a service name or milestone');
      return;
    }

    const calculatedPrice = serviceBillingType === 'hourly' ? serviceHours * serviceHourlyRate : serviceHourlyRate;
    const serviceItemId = `svc_${Date.now()}`;

    setCart([
      ...cart,
      {
        productId: serviceItemId,
        name: serviceTitle,
        sku: 'SVC-BILLABLE',
        unitPrice: calculatedPrice,
        quantity: 1,
        discount: 0,
        gstRate: Number(appConfig?.defaultTaxRate || 18),
        availableStock: 9999,
        isService: true,
        serviceHours: serviceBillingType === 'hourly' ? serviceHours : undefined,
        milestoneDescription: serviceScope,
      },
    ]);

    setServiceTitle('');
    setServiceScope('');
    addNotification('success', 'Service Added', `Added billable item "${serviceTitle}" to invoice`);
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter((item) => item.productId !== productId));
    } else {
      setCart(
        cart.map((item) =>
          item.productId === productId ? { ...item, quantity: qty } : item
        )
      );
    }
  };

  const handleUpdatePrice = (productId: string, price: number) => {
    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, unitPrice: price } : item
      )
    );
  };

  const handleUpdateDiscount = (productId: string, discount: number) => {
    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, discount } : item
      )
    );
  };

  const handleUpdateBatchExpiry = (productId: string, batchNo: string, expiryDate: string) => {
    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, batchNo, expiryDate } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  // Calculations with Wholesale tier discount support
  const calculations = useMemo(() => {
    let subtotal = 0;
    let totalItemDiscount = 0;
    let totalTax = 0;

    cart.forEach((item) => {
      const lineBase = item.unitPrice * item.quantity;
      const lineDiscount = Math.min(item.discount, lineBase);
      const taxableAmount = lineBase - lineDiscount;
      const lineTax = (taxableAmount * item.gstRate) / 100;

      subtotal += lineBase;
      totalItemDiscount += lineDiscount;
      totalTax += lineTax;
    });

    // Apply wholesale tier discount if selected
    const tierDiscountAmount = wholesaleTierDiscount > 0 ? (subtotal * wholesaleTierDiscount) / 100 : 0;
    const totalDiscount = totalItemDiscount + tierDiscountAmount;
    const grandTotal = Math.max(0, subtotal - totalDiscount + totalTax);

    return {
      subtotal,
      totalDiscount,
      tierDiscountAmount,
      totalTax,
      grandTotal,
    };
  }, [cart, wholesaleTierDiscount]);

  // Execute Sale / Order checkout
  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      addNotification('warning', 'Empty Cart', 'Please add at least one item');
      return;
    }

    setSubmitting(true);
    try {
      const saleId = `sale_${Date.now()}`;
      const nowIso = new Date().toISOString();
      const saleDate = nowIso.split('T')[0];

      // 1. Record Sale in _Sales with flow metadata
      const saleRecord: Record<string, any> = {
        sale_id: saleId,
        customer_id: selectedCustomerId === 'walk_in' ? '' : selectedCustomerId,
        sale_date: saleDate,
        subtotal: calculations.subtotal,
        discount: calculations.totalDiscount,
        tax: calculations.totalTax,
        total: calculations.grandTotal,
        payment_method: creditTerms !== 'immediate' ? `Credit (${creditTerms.toUpperCase()})` : selectedPaymentMethod,
        status: creditTerms !== 'immediate' ? 'credit_pending' : 'completed',
        notes: notes || (currentFlow === 'wholesale' ? `PO: ${poNumber} | Dispatch: ${dispatchStatus}` : ''),
        created_at: nowIso,
      };

      // Flow specific metadata
      if (currentFlow === 'wholesale') {
        saleRecord['credit_terms'] = creditTerms;
        saleRecord['credit_due_date'] = creditDueDate;
        saleRecord['po_number'] = poNumber;
        saleRecord['dispatch_status'] = dispatchStatus;
        saleRecord['transporter'] = transporterName;
      } else if (currentFlow === 'pharmacy') {
        saleRecord['doctor_name'] = doctorName;
        saleRecord['patient_name'] = patientName;
        saleRecord['prescription_id'] = prescriptionId;
      } else if (currentFlow === 'services') {
        saleRecord['service_flow'] = true;
        saleRecord['milestone_scope'] = serviceScope;
      }

      addRow('_Sales', saleRecord);

      // 2. Record items in _SaleItems and conditionally update _Inventory
      for (const item of cart) {
        const saleItemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const lineBase = item.unitPrice * item.quantity;
        const lineDiscount = Math.min(item.discount, lineBase);
        const taxable = lineBase - lineDiscount;
        const lineTax = (taxable * item.gstRate) / 100;
        const lineTotal = taxable + lineTax;

        const saleItemRecord: Record<string, any> = {
          sale_item_id: saleItemId,
          sale_id: saleId,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: item.discount,
          tax: lineTax,
          line_total: lineTotal,
        };

        if (currentFlow === 'pharmacy') {
          saleItemRecord['batch_no'] = item.batchNo;
          saleItemRecord['expiry_date'] = item.expiryDate;
        }

        addRow('_SaleItems', saleItemRecord);

        // Only reduce physical warehouse inventory if this is a physical product (not a service)
        if (!item.isService) {
          const invRow = inventoryRows.find((i) => i.product_id === item.productId);
          if (invRow) {
            const newQty = Number(invRow.quantity || 0) - item.quantity;
            updateRow('_Inventory', 'inventory_id', invRow.inventory_id, {
              quantity: newQty,
              updated_at: nowIso,
            });
          }

          // Record stock audit trail
          addRow('_StockMovements', {
            movement_id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            product_id: item.productId,
            type: currentFlow === 'wholesale' ? 'WHOLESALE_DISPATCH' : 'SALE',
            quantity: -item.quantity,
            reference_id: saleId,
            notes: `${currentFlow.toUpperCase()} Order ${saleId}`,
            created_at: nowIso,
          });
        }
      }

      await saveWorkbook();

      const customerObj = customerRows.find((c) => c.customer_id === selectedCustomerId);
      setCompletedOrder({
        saleId,
        saleRecord,
        cart: [...cart],
        calculations,
        flow: currentFlow,
        customerName: customerObj?.name || (currentFlow === 'wholesale' ? 'B2B Client' : 'Walk-in Customer'),
        customerObj,
        creditDueDate,
        doctorName,
        patientName,
        poNumber,
        dispatchStatus,
      });

      addNotification('success', 'Order Completed', `Recorded ${currentFlow.toUpperCase()} transaction #${saleId}`);
    } catch (err: any) {
      addNotification('error', 'Sale Failed', err.message || 'Transaction could not be completed');
    } finally {
      setSubmitting(false);
    }
  };

  // Manufacturing: Execute BOM Production Run
  const handleExecuteProductionRun = async () => {
    if (!selectedBomProduct || productionQty <= 0) return;

    setSubmitting(true);
    try {
      const nowIso = new Date().toISOString();
      const targetProd = productRows.find((p) => p.product_id === selectedBomProduct);
      if (!targetProd) throw new Error('Selected product not found');

      // BOM Recipe: Pick component products from catalog or synthesize
      const otherProducts = productRows.filter((p) => p.product_id !== selectedBomProduct);
      const components = otherProducts.slice(0, 3).map((comp, idx) => ({
        productId: comp.product_id,
        name: comp.name,
        qtyPerUnit: idx + 1,
        totalRequired: (idx + 1) * productionQty,
        available: stockMap[comp.product_id] || 0,
      }));

      // Check shortages
      const shortage = components.find((c) => c.available < c.totalRequired);
      if (shortage) {
        throw new Error(`Insufficient stock for component "${shortage.name}". Need ${shortage.totalRequired}, have ${shortage.available}`);
      }

      const batchNumber = `BATCH-MFG-${Date.now().toString().slice(-6)}`;

      // 1. Decrement component raw materials in _Inventory & log movement
      for (const comp of components) {
        const invRow = inventoryRows.find((i) => i.product_id === comp.productId);
        if (invRow) {
          updateRow('_Inventory', 'inventory_id', invRow.inventory_id, {
            quantity: Number(invRow.quantity || 0) - comp.totalRequired,
            updated_at: nowIso,
          });
        }
        addRow('_StockMovements', {
          movement_id: `mov_raw_${Date.now()}_${comp.productId}`,
          product_id: comp.productId,
          type: 'BOM_CONSUMPTION',
          quantity: -comp.totalRequired,
          reference_id: batchNumber,
          notes: `Consumed in Production Run for ${targetProd.name}`,
          created_at: nowIso,
        });
      }

      // 2. Increment Finished Good stock in _Inventory & log movement
      const targetInv = inventoryRows.find((i) => i.product_id === targetProd.product_id);
      if (targetInv) {
        updateRow('_Inventory', 'inventory_id', targetInv.inventory_id, {
          quantity: Number(targetInv.quantity || 0) + productionQty,
          updated_at: nowIso,
        });
      } else {
        addRow('_Inventory', {
          inventory_id: `inv_${Date.now()}`,
          product_id: targetProd.product_id,
          quantity: productionQty,
          minimum_stock: 5,
          updated_at: nowIso,
        });
      }

      addRow('_StockMovements', {
        movement_id: `mov_fg_${Date.now()}_${targetProd.product_id}`,
        product_id: targetProd.product_id,
        type: 'PRODUCTION_YIELD',
        quantity: productionQty,
        reference_id: batchNumber,
        notes: `Produced batch ${batchNumber} via BOM Assembly`,
        created_at: nowIso,
      });

      await saveWorkbook();

      setCompletedProduction({
        batchNumber,
        productName: targetProd.name,
        quantity: productionQty,
        components,
        producedAt: nowIso,
      });

      addNotification('success', 'Production Run Completed', `Manufactured ${productionQty} units of ${targetProd.name}`);
    } catch (err: any) {
      addNotification('error', 'Production Failed', err.message || 'Could not complete production run');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartFreshSale = () => {
    setCompletedOrder(null);
    setCompletedProduction(null);
    setCart([]);
    setNotes('');
    setPoNumber('');
    setDoctorName('');
    setPatientName('');
  };

  // Generic specialized transaction handler for Taxi, Hotel, School, Coaching, Payroll, Gym, Hospital
  const handleCompleteSpecializedOrder = async (flowType: string, data: any) => {
    setSubmitting(true);
    try {
      const nowIso = new Date().toISOString();
      const saleId = `TXN-${Date.now().toString().slice(-6)}`;

      // 1. Record in _Sales
      const saleRecord = {
        sale_id: saleId,
        customer_id: data.customerName || 'Direct Account',
        sale_date: nowIso,
        subtotal: data.subtotal || data.total,
        discount: 0,
        tax: data.tax || 0,
        total: data.total,
        payment_method: data.paymentMethod || 'Direct Payment',
        status: 'completed',
        created_at: nowIso,
      };
      addRow('_Sales', saleRecord);

      // 2. Record in _SaleItems
      addRow('_SaleItems', {
        sale_item_id: `item_${Date.now()}`,
        sale_id: saleId,
        product_id: flowType.toUpperCase(),
        quantity: 1,
        unit_price: data.subtotal || data.total,
        discount: 0,
        tax: data.tax || 0,
        line_total: data.total,
      });

      // 3. Ensure entity is archived in _Customers
      const existingCustomer = customerRows.find(
        (c) => (c.name || '').toLowerCase() === (data.customerName || '').toLowerCase()
      );
      if (!existingCustomer && data.customerName) {
        addRow('_Customers', {
          customer_id: `cust_${Date.now()}`,
          name: data.customerName,
          phone: data.passengerPhone || data.guestPhone || data.guardianPhone || data.studentPhone || data.memberPhone || data.patientPhone || '',
          email: '',
          address: data.pickupLocation || data.roomNo || data.studentGrade || data.department || '',
          gstin: data.guestIdProof || data.studentRollNo || data.employeeId || data.patientUhid || '',
          created_at: nowIso,
          updated_at: nowIso,
        });
      }

      await saveWorkbook();

      setCompletedOrder({
        saleId,
        saleRecord,
        flow: flowType,
        customerName: data.customerName,
        calculations: {
          subtotal: data.subtotal || data.total,
          totalDiscount: 0,
          totalTax: data.tax || 0,
          grandTotal: data.total,
        },
        cart: [
          {
            name: `${editionInfo.title}: ${data.customerName}`,
            sku: flowType.toUpperCase(),
            quantity: 1,
            unitPrice: data.subtotal || data.total,
            gstRate: data.tax && data.subtotal ? Math.round((data.tax / data.subtotal) * 100) : 0,
          }
        ],
        specializedData: data,
      });

      addNotification('success', 'Transaction Recorded', `${editionInfo.badge} transaction #${saleId} saved to Excel`);
    } catch (err: any) {
      addNotification('error', 'Operation Failed', err.message || 'Could not record transaction');
    } finally {
      setSubmitting(false);
    }
  };

  // If manufacturing run completed, show production certificate
  if (completedProduction) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-8 bg-background">
        <div className="max-w-3xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-sm">
                <Factory className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Production Batch Completed</h1>
                <p className="text-xs text-muted-foreground">Batch #{completedProduction.batchNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 text-xs bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl transition font-medium"
              >
                <Printer className="h-4 w-4" />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={handleStartFreshSale}
                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-primary text-primary-foreground font-semibold rounded-xl shadow-sm hover:bg-primary/90 transition"
              >
                <Plus className="h-4 w-4" />
                <span>New Run</span>
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-md space-y-6">
            <div className="flex justify-between border-b border-border pb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                  Assembly & Production Report
                </h2>
                <div className="text-xs text-muted-foreground mt-1">
                  Exdrow Manufacturing Engine • {appConfig?.businessName}
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold text-foreground font-mono text-sm">#{completedProduction.batchNumber}</div>
                <div className="text-muted-foreground mt-1">{formatDate(completedProduction.producedAt)}</div>
                <div className="text-emerald-500 font-bold mt-1">QC PASSED & RESTOCKED</div>
              </div>
            </div>

            <div className="bg-muted/30 border border-border rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Finished Product Manufactured</span>
                <div className="text-base font-bold text-foreground mt-0.5">{completedProduction.productName}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Quantity Produced</span>
                <div className="text-xl font-extrabold text-primary font-mono mt-0.5">+{completedProduction.quantity} Units</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-indigo-400" />
                <span>Bill of Materials (BOM) Raw Materials Consumed</span>
              </h4>
              <table className="w-full text-left text-xs border-collapse border border-border/80 rounded-xl overflow-hidden">
                <thead className="bg-muted/40 text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Component Material</th>
                    <th className="py-2.5 px-3 text-center">Req / Unit</th>
                    <th className="py-2.5 px-3 text-right">Total Consumed</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {completedProduction.components.map((comp: any, idx: number) => (
                    <tr key={idx} className="even:bg-muted/10">
                      <td className="py-2.5 px-3 font-medium text-foreground">{comp.name}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{comp.qtyPerUnit} pcs</td>
                      <td className="py-2.5 px-3 text-right font-mono text-destructive font-bold">-{comp.totalRequired} pcs</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-500 font-bold rounded-full">
                          Deducted from Inventory
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If order completed, show printable in-page invoice receipt with flow-specific metadata!
  if (completedOrder) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-8 bg-background">
        <div className="max-w-3xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center teal-glow-sm">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Order Completed Successfully</h1>
                <p className="text-xs text-muted-foreground">Order ID #{completedOrder.saleId} • {completedOrder.flow.toUpperCase()} Mode</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 text-xs bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl transition font-medium"
              >
                <Printer className="h-4 w-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={handleStartFreshSale}
                className="flex items-center gap-1.5 px-4 py-2 text-xs bg-primary text-primary-foreground font-semibold rounded-xl shadow-sm hover:bg-primary/90 transition"
              >
                <Plus className="h-4 w-4" />
                <span>New Sale</span>
              </button>
              <button
                onClick={() => setActiveSheet('_Sales')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl transition"
              >
                <span>View Sales History</span>
              </button>
            </div>
          </div>

          {/* Printable Invoice Sheet */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-md space-y-6" id="printable-area">
            <div className="flex justify-between border-b border-border pb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {appConfig?.businessName || 'Business Name'}
                </h2>
                <div className="text-xs text-muted-foreground mt-1">
                  Tax Invoice • {appConfig?.businessType}
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold text-foreground font-mono text-sm">#{completedOrder.saleId}</div>
                <div className="text-muted-foreground mt-1">Date: {formatDate(completedOrder.saleRecord.sale_date)}</div>
                <div className="text-primary font-bold mt-1">
                  {completedOrder.saleRecord.status === 'credit_pending' ? 'CREDIT ORDER' : 'PAID'} ({completedOrder.saleRecord.payment_method})
                </div>
              </div>
            </div>

            {/* Flow specific header details */}
            <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/70 text-xs">
              <div>
                <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Billed To</div>
                <div className="font-bold text-foreground text-sm mt-0.5">{completedOrder.customerName}</div>
                {completedOrder.customerObj?.gstin && (
                  <div className="text-muted-foreground font-mono text-[11px] mt-0.5">GSTIN: {completedOrder.customerObj.gstin}</div>
                )}
                {completedOrder.customerObj?.address && (
                  <div className="text-muted-foreground text-[11px] mt-0.5">{completedOrder.customerObj.address}</div>
                )}
              </div>

              {completedOrder.flow === 'wholesale' && (
                <div className="text-right">
                  <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Wholesale B2B Terms</div>
                  <div className="font-bold text-primary text-sm mt-0.5">Due: {completedOrder.creditDueDate}</div>
                  {completedOrder.poNumber && <div className="text-muted-foreground font-mono text-[11px] mt-0.5">PO #: {completedOrder.poNumber}</div>}
                  <div className="text-emerald-500 font-semibold text-[11px] mt-0.5">Dispatch: {completedOrder.dispatchStatus.toUpperCase()}</div>
                </div>
              )}

              {completedOrder.flow === 'pharmacy' && (
                <div className="text-right">
                  <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Prescription Details</div>
                  <div className="font-bold text-foreground text-sm mt-0.5">{completedOrder.doctorName ? `Dr. ${completedOrder.doctorName}` : 'Prescription Verified'}</div>
                  {completedOrder.patientName && <div className="text-muted-foreground text-[11px] mt-0.5">Patient: {completedOrder.patientName}</div>}
                  <div className="text-emerald-500 font-semibold text-[11px] mt-0.5">Schedule Compliance: Verified</div>
                </div>
              )}

              {completedOrder.flow === 'taxi' && completedOrder.specializedData && (
                <div className="text-right">
                  <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Trip Dispatch Voucher</div>
                  <div className="font-bold text-amber-500 text-sm mt-0.5">{completedOrder.specializedData.cabType} • {completedOrder.specializedData.vehicleNo}</div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">Driver: {completedOrder.specializedData.driverName}</div>
                  <div className="text-emerald-500 font-semibold text-[11px] mt-0.5">{completedOrder.specializedData.distanceKm} km • Payout: {formatCurrency(completedOrder.specializedData.driverPayout, currency, currencySymbol)}</div>
                </div>
              )}

              {completedOrder.flow === 'hotel' && completedOrder.specializedData && (
                <div className="text-right">
                  <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Stay Folio & Room Allocation</div>
                  <div className="font-bold text-blue-500 text-sm mt-0.5">{completedOrder.specializedData.roomNo} ({completedOrder.specializedData.roomCategory})</div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">{completedOrder.specializedData.nights} Nights ({completedOrder.specializedData.checkInDate} → {completedOrder.specializedData.checkOutDate})</div>
                  <div className="text-emerald-500 font-semibold text-[11px] mt-0.5">Guest ID: {completedOrder.specializedData.guestIdProof}</div>
                </div>
              )}

              {completedOrder.flow === 'school' && completedOrder.specializedData && (
                <div className="text-right">
                  <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Academic Fee Receipt</div>
                  <div className="font-bold text-emerald-500 text-sm mt-0.5">{completedOrder.specializedData.studentGrade}</div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">Roll #: {completedOrder.specializedData.studentRollNo} • {completedOrder.specializedData.academicTerm}</div>
                  <div className="text-primary font-semibold text-[11px] mt-0.5">Guardian: {completedOrder.specializedData.guardianName}</div>
                </div>
              )}

              {completedOrder.flow === 'coaching' && completedOrder.specializedData && (
                <div className="text-right">
                  <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Course Enrollment & Fee</div>
                  <div className="font-bold text-purple-500 text-sm mt-0.5">{completedOrder.specializedData.courseName}</div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">{completedOrder.specializedData.installmentNumber} • Next Due: {completedOrder.specializedData.nextDueDate}</div>
                  <div className="text-emerald-500 font-semibold text-[11px] mt-0.5">{completedOrder.specializedData.batchSchedule}</div>
                </div>
              )}

              {completedOrder.flow === 'payroll' && completedOrder.specializedData && (
                <div className="text-right">
                  <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Employee Monthly Payslip</div>
                  <div className="font-bold text-teal-500 text-sm mt-0.5">{completedOrder.specializedData.designation}</div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">Dept: {completedOrder.specializedData.department} • Code: {completedOrder.specializedData.employeeId}</div>
                  <div className="text-emerald-500 font-semibold text-[11px] mt-0.5">Net Take-Home Disbursed: {formatCurrency(completedOrder.specializedData.netTakeHome, currency, currencySymbol)}</div>
                </div>
              )}

              {completedOrder.flow === 'gym' && completedOrder.specializedData && (
                <div className="text-right">
                  <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Membership Pass & Agreement</div>
                  <div className="font-bold text-orange-500 text-sm mt-0.5">{completedOrder.specializedData.membershipPlan}</div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">Valid: {completedOrder.specializedData.planStartDate} → {completedOrder.specializedData.planExpiryDate}</div>
                  <div className="text-emerald-500 font-semibold text-[11px] mt-0.5">Trainer: {completedOrder.specializedData.trainerName}</div>
                </div>
              )}

              {completedOrder.flow === 'hospital' && completedOrder.specializedData && (
                <div className="text-right">
                  <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Hospital Medical Encounter</div>
                  <div className="font-bold text-rose-500 text-sm mt-0.5">{completedOrder.specializedData.patientUhid} ({completedOrder.specializedData.ageGender})</div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">{completedOrder.specializedData.doctorName} • {completedOrder.specializedData.department}</div>
                  <div className="text-emerald-500 font-semibold text-[11px] mt-0.5">{completedOrder.specializedData.encounterType} • Blood: {completedOrder.specializedData.bloodGroup}</div>
                </div>
              )}
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-[11px]">
                  <th className="py-2.5 font-semibold">Item & Details</th>
                  <th className="py-2.5 font-semibold text-center">Qty</th>
                  <th className="py-2.5 font-semibold text-right">Price</th>
                  <th className="py-2.5 font-semibold text-right">Tax</th>
                  <th className="py-2.5 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {completedOrder.cart.map((item: any, idx: number) => {
                  const lineBase = item.unitPrice * item.quantity;
                  const lineTax = (lineBase * item.gstRate) / 100;
                  const lineTotal = lineBase + lineTax;
                  return (
                    <tr key={idx}>
                      <td className="py-2.5 font-medium text-foreground">
                        <div>{item.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-2">
                          {item.sku && <span>SKU: {item.sku}</span>}
                          {item.batchNo && <span className="text-indigo-400">Batch: {item.batchNo}</span>}
                          {item.expiryDate && <span>Exp: {item.expiryDate}</span>}
                        </div>
                      </td>
                      <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono">{formatCurrency(item.unitPrice, currency, currencySymbol)}</td>
                      <td className="py-2.5 text-right text-muted-foreground font-mono">{item.gstRate}%</td>
                      <td className="py-2.5 text-right font-bold text-foreground font-mono">
                        {formatCurrency(lineTotal, currency, currencySymbol)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t border-border pt-4 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(completedOrder.calculations.subtotal, currency, currencySymbol)}</span>
                </div>
                {completedOrder.calculations.totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-medium">
                    <span>Total Discount</span>
                    <span className="font-mono">-{formatCurrency(completedOrder.calculations.totalDiscount, currency, currencySymbol)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Tax</span>
                  <span className="font-mono">+{formatCurrency(completedOrder.calculations.totalTax, currency, currencySymbol)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-base font-bold text-foreground">
                  <span>Grand Total</span>
                  <span className="text-primary font-mono">{formatCurrency(completedOrder.calculations.grandTotal, currency, currencySymbol)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Dedicated Business Solution Header */}
      <div className="h-14 border-b border-border bg-card/60 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSheet('dashboard')}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <editionInfo.icon className={`h-5 w-5 ${editionInfo.iconColor}`} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-foreground">{editionInfo.title}</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
                  {editionInfo.badge}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-foreground">{appConfig?.businessName || 'My Business'}</div>
            <div className="text-[10px] text-muted-foreground">{appConfig?.businessType || 'Retail'} Solution</div>
          </div>
          <button
            onClick={() => setActiveSheet('_Sales')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted/60 hover:bg-muted text-foreground border border-border rounded-lg transition font-medium"
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>Ledger</span>
          </button>
        </div>
      </div>

      {/* MANUFACTURING & ASSEMBLY CONSOLE MODE */}
      {currentFlow === 'manufacturing' ? (
        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Factory className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Production & Assembly Execution</h2>
                  <p className="text-xs text-muted-foreground">Convert component raw materials into finished inventory</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full">
                BOM Engine Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Select Finished Good to Manufacture
                </label>
                <select
                  value={selectedBomProduct}
                  onChange={(e) => setSelectedBomProduct(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                >
                  {productRows.map((p) => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.name} (Current Stock: {stockMap[p.product_id] || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Batch Units to Produce
                </label>
                <input
                  type="number"
                  min="1"
                  value={productionQty}
                  onChange={(e) => setProductionQty(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary font-mono font-bold"
                />
              </div>
            </div>

            {/* Bill of Materials Component Requirements */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Boxes className="h-4 w-4 text-primary" />
                <span>Required Bill of Materials Components (Per Batch)</span>
              </h3>

              <div className="border border-border/80 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/40 border-b border-border/80 font-semibold text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3">Component Material</th>
                      <th className="py-2.5 px-3 text-center">Req / Unit</th>
                      <th className="py-2.5 px-3 text-right">Total Needed</th>
                      <th className="py-2.5 px-3 text-right">In Stock</th>
                      <th className="py-2.5 px-3 text-center">Availability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {productRows.filter((p) => p.product_id !== selectedBomProduct).slice(0, 3).map((comp, idx) => {
                      const reqPerUnit = idx + 1;
                      const totalNeeded = reqPerUnit * productionQty;
                      const inStock = stockMap[comp.product_id] || 0;
                      const hasEnough = inStock >= totalNeeded;
                      return (
                        <tr key={comp.product_id} className="even:bg-muted/10">
                          <td className="py-2.5 px-3 font-medium text-foreground">{comp.name}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{reqPerUnit} pcs</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">{totalNeeded} pcs</td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{inStock} pcs</td>
                          <td className="py-2.5 px-3 text-center">
                            {hasEnough ? (
                              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-500 font-bold rounded-full">
                                Ready
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] bg-rose-500/10 text-rose-500 font-bold rounded-full">
                                Shortage
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleExecuteProductionRun}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md teal-glow transition disabled:opacity-50 text-xs"
              >
                <Wrench className="h-4 w-4" />
                <span>Execute Production Run ({productionQty} Units)</span>
              </button>
            </div>
          </div>
        </div>
      ) : currentFlow === 'taxi' ? (
        <TaxiConsole
          appConfig={appConfig}
          currency={currency}
          currencySymbol={currencySymbol}
          submitting={submitting}
          onComplete={(data) => handleCompleteSpecializedOrder('taxi', data)}
        />
      ) : currentFlow === 'hotel' ? (
        <HotelConsole
          appConfig={appConfig}
          currency={currency}
          currencySymbol={currencySymbol}
          submitting={submitting}
          onComplete={(data) => handleCompleteSpecializedOrder('hotel', data)}
        />
      ) : currentFlow === 'school' ? (
        <SchoolConsole
          appConfig={appConfig}
          currency={currency}
          currencySymbol={currencySymbol}
          submitting={submitting}
          onComplete={(data) => handleCompleteSpecializedOrder('school', data)}
        />
      ) : currentFlow === 'coaching' ? (
        <CoachingConsole
          appConfig={appConfig}
          currency={currency}
          currencySymbol={currencySymbol}
          submitting={submitting}
          onComplete={(data) => handleCompleteSpecializedOrder('coaching', data)}
        />
      ) : currentFlow === 'payroll' ? (
        <PayrollConsole
          appConfig={appConfig}
          currency={currency}
          currencySymbol={currencySymbol}
          submitting={submitting}
          onComplete={(data) => handleCompleteSpecializedOrder('payroll', data)}
        />
      ) : currentFlow === 'gym' ? (
        <GymConsole
          appConfig={appConfig}
          currency={currency}
          currencySymbol={currencySymbol}
          submitting={submitting}
          onComplete={(data) => handleCompleteSpecializedOrder('gym', data)}
        />
      ) : currentFlow === 'hospital' ? (
        <HospitalConsole
          appConfig={appConfig}
          currency={currency}
          currencySymbol={currencySymbol}
          submitting={submitting}
          onComplete={(data) => handleCompleteSpecializedOrder('hospital', data)}
        />
      ) : (
        /* MAIN TRANSACTION WORKSPACE (RETAIL / WHOLESALE / PHARMACY / SERVICES) */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left: Product / Service Catalog (6 cols) */}
          <div className="lg:col-span-6 border-r border-border flex flex-col overflow-hidden bg-muted/10 p-5 space-y-4">
            {/* SERVICES MODE: Quick Service Creator */}
            {currentFlow === 'services' && (
              <form onSubmit={handleAddCustomService} className="bg-card border border-border/80 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                    <span>Add Billable Service / Retainer</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">Non-Inventory Item</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Service Name (e.g. UX Consulting)"
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    className="md:col-span-2 px-2.5 py-1.5 text-xs bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                  <select
                    value={serviceBillingType}
                    onChange={(e) => setServiceBillingType(e.target.value as any)}
                    className="px-2 py-1.5 text-xs bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="hourly">Hourly Rate</option>
                    <option value="fixed_milestone">Fixed Milestone</option>
                    <option value="retainer">Monthly Retainer</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {serviceBillingType === 'hourly' ? (
                    <div>
                      <label className="text-[10px] text-muted-foreground">Hours Logged</label>
                      <input
                        type="number"
                        value={serviceHours}
                        onChange={(e) => setServiceHours(Number(e.target.value))}
                        className="w-full px-2.5 py-1 text-xs bg-muted/40 border border-border rounded-lg text-foreground font-mono"
                      />
                    </div>
                  ) : (
                    <div className="col-span-1"></div>
                  )}
                  <div>
                    <label className="text-[10px] text-muted-foreground">Rate ({currencySymbol})</label>
                    <input
                      type="number"
                      value={serviceHourlyRate}
                      onChange={(e) => setServiceHourlyRate(Number(e.target.value))}
                      className="w-full px-2.5 py-1 text-xs bg-muted/40 border border-border rounded-lg text-foreground font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-3.5 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs hover:bg-primary/90 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Service to Cart</span>
                  </button>
                </div>
              </form>
            )}

            {/* Search, Category Filters and View Mode Switcher */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search catalog by product name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground shadow-2xs"
                  />
                </div>

                {/* View Switcher */}
                <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border shrink-0">
                  <button
                    onClick={() => setCatalogViewMode('table')}
                    className={`p-1.5 rounded-lg transition ${
                      catalogViewMode === 'table' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="Tabular Spreadsheet View"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setCatalogViewMode('grid')}
                    className={`p-1.5 rounded-lg transition ${
                      catalogViewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="Grid Cards View"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Category Pills Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 text-xs rounded-lg transition font-medium shrink-0 ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All Items ({productRows.length})
                </button>
                {categoryRows.map((c) => (
                  <button
                    key={c.category_id}
                    onClick={() => setSelectedCategory(c.category_id)}
                    className={`px-3 py-1 text-xs rounded-lg transition font-medium shrink-0 ${
                      selectedCategory === c.category_id
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Display */}
            <div className="flex-1 overflow-y-auto border border-border/80 rounded-xl bg-card shadow-2xs">
              {filteredProducts.length === 0 ? (
                <div className="text-center p-8 text-xs text-muted-foreground">
                  No catalog items found matching your filters.
                </div>
              ) : catalogViewMode === 'table' ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-muted/50 border-b border-border/80 font-bold text-foreground z-10 select-none">
                    <tr>
                      <th className="py-2.5 px-3.5 border-r border-border/60">Product</th>
                      <th className="py-2.5 px-2 border-r border-border/60 text-center w-24">Stock</th>
                      <th className="py-2.5 px-3 border-r border-border/60 text-right w-24">Price</th>
                      <th className="py-2.5 px-2 text-center w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredProducts.map((prod) => {
                      const stock = stockMap[prod.product_id] ?? 0;
                      const isLow = stock <= Number(prod.minimum_stock || 5);
                      return (
                        <tr
                          key={prod.product_id}
                          className="even:bg-muted/10 odd:bg-card hover:bg-primary/5 transition cursor-pointer"
                          onClick={() => handleAddToCart(prod.product_id)}
                        >
                          <td className="py-2 px-3.5 border-r border-border/60">
                            <div className="font-bold text-foreground">{prod.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {prod.sku || 'NO-SKU'} • GST {prod.gst_rate || 18}%
                            </div>
                          </td>
                          <td className="py-2 px-2 border-r border-border/60 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                stock === 0
                                  ? 'bg-rose-500/20 text-rose-500'
                                  : isLow
                                  ? 'bg-amber-500/20 text-amber-500'
                                  : 'bg-primary/20 text-primary'
                              }`}
                            >
                              {stock} {prod.unit || 'pcs'}
                            </span>
                          </td>
                          <td className="py-2 px-3 border-r border-border/60 text-right font-mono font-bold text-foreground">
                            {formatCurrency(prod.selling_price, currency, currencySymbol)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(prod.product_id);
                              }}
                              className="px-2.5 py-1 text-[11px] bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-bold rounded-lg transition"
                            >
                              Add
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredProducts.map((prod) => {
                    const stock = stockMap[prod.product_id] ?? 0;
                    const isLow = stock <= Number(prod.minimum_stock || 5);
                    return (
                      <div
                        key={prod.product_id}
                        onClick={() => handleAddToCart(prod.product_id)}
                        className="bg-card hover:bg-primary/5 border border-border/80 hover:border-primary/50 rounded-xl p-3 flex flex-col justify-between transition cursor-pointer shadow-2xs group"
                      >
                        <div>
                          <div className="font-bold text-foreground text-xs line-clamp-2 group-hover:text-primary transition">
                            {prod.name}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono mt-1">
                            <span>{prod.sku || '-'}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-bold ${
                                isLow ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'
                              }`}
                            >
                              {stock} left
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/60">
                          <span className="text-xs font-extrabold text-foreground font-mono">
                            {formatCurrency(prod.selling_price, currency, currencySymbol)}
                          </span>
                          <span className="text-[11px] font-bold text-primary group-hover:underline flex items-center gap-0.5">
                            <Plus className="h-3 w-3" />
                            <span>Add</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Cart, Flow-Specific Fields & Billing (6 cols) */}
          <div className="lg:col-span-6 flex flex-col overflow-hidden p-6 space-y-4">
            {/* WHOLESALE B2B CONTROLS */}
            {currentFlow === 'wholesale' && (
              <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-3 shrink-0 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Wholesale B2B Distribution Controls</span>
                  </span>
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                    Credit Due: {creditDueDate}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Credit Terms
                    </label>
                    <select
                      value={creditTerms}
                      onChange={(e) => setCreditTerms(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="immediate">Immediate (Cash / Advance)</option>
                      <option value="net_15">Net 15 Days Credit</option>
                      <option value="net_30">Net 30 Days Credit</option>
                      <option value="net_60">Net 60 Days Credit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Bulk Wholesale Discount
                    </label>
                    <select
                      value={wholesaleTierDiscount}
                      onChange={(e) => setWholesaleTierDiscount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary font-bold text-primary"
                    >
                      <option value="0">Standard Pricing (0%)</option>
                      <option value="5">Wholesale Tier 1 (5% Off)</option>
                      <option value="10">Distributor Tier 2 (10% Off)</option>
                      <option value="15">Master Wholesale (15% Off)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Client PO Reference #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PO-8839"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Dispatch Status
                    </label>
                    <select
                      value={dispatchStatus}
                      onChange={(e) => setDispatchStatus(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="ready_for_dispatch">Ready for Dispatch</option>
                      <option value="in_transit">In Transit (Challan Issued)</option>
                      <option value="delivered">Delivered & Invoiced</option>
                      <option value="draft">Draft Order</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Transporter / Vehicle Details
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BlueDart Express • Truck MH-04-1234"
                      value={transporterName}
                      onChange={(e) => setTransporterName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PHARMACY RX CONTROLS */}
            {currentFlow === 'pharmacy' && (
              <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-3 shrink-0 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Stethoscope className="h-4 w-4 text-emerald-500" />
                    <span>Pharmacy Prescription & Compliance Record</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full">
                    Rx Schedule H Compliant
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Prescribing Doctor Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Rajesh Sharma, MD"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Patient / Prescription ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RX-2026-901"
                      value={prescriptionId}
                      onChange={(e) => setPrescriptionId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>

                {nearExpiryCartItems.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-center gap-2 text-amber-500 text-xs">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span><b>Near-Expiry Alert:</b> One or more selected medicines expire within 60 days. Verify with patient.</span>
                  </div>
                )}
              </div>
            )}

            {/* Customer & Payment method */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  {currentFlow === 'wholesale' ? 'B2B Client / Distributor' : 'Select Customer'}
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="walk_in">
                    {currentFlow === 'wholesale' ? 'Walk-in Trade Buyer' : 'Walk-in Retail Customer'}
                  </option>
                  {customerRows.map((c) => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.name} {c.gstin ? `[GSTIN: ${c.gstin}]` : c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Payment Mode
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Net Banking">Net Banking / NEFT</option>
                  <option value="Credit / Pay Later">Credit / Pay Later</option>
                </select>
              </div>
            </div>

            {/* Cart items list (Tabular Layout) */}
            <div className="flex-1 overflow-y-auto border border-border/80 rounded-xl bg-card shadow-2xs">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground text-xs space-y-2">
                  <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-muted-foreground/60" />
                  </div>
                  <div className="font-semibold text-foreground">Order cart is currently empty</div>
                  <div className="text-[11px]">Click items from the catalog or add a service above.</div>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-muted/50 border-b border-border/80 font-bold text-foreground z-10 select-none">
                    <tr>
                      <th className="py-2 px-3 border-r border-border/60">Item</th>
                      <th className="py-2 px-2 border-r border-border/60 text-center w-28">Qty</th>
                      <th className="py-2 px-2 border-r border-border/60 text-right w-20">Price</th>
                      <th className="py-2 px-2 border-r border-border/60 text-right w-16">Disc</th>
                      <th className="py-2 px-3 border-r border-border/60 text-right w-24">Total</th>
                      <th className="py-2 px-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {cart.map((item) => (
                      <tr key={item.productId} className="even:bg-muted/10 odd:bg-card hover:bg-primary/5 transition">
                        <td className="py-2 px-3 border-r border-border/60">
                          <div className="font-bold text-foreground truncate max-w-[130px]">{item.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {item.sku || '-'} • GST {item.gstRate}%
                          </div>
                          {currentFlow === 'pharmacy' && (
                            <div className="mt-1 flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="Batch"
                                value={item.batchNo || ''}
                                onChange={(e) => handleUpdateBatchExpiry(item.productId, e.target.value, item.expiryDate || '')}
                                className="w-16 px-1 py-0.5 text-[10px] bg-background border border-border rounded font-mono"
                              />
                              <input
                                type="date"
                                value={item.expiryDate || ''}
                                onChange={(e) => handleUpdateBatchExpiry(item.productId, item.batchNo || '', e.target.value)}
                                className="w-24 px-1 py-0.5 text-[10px] bg-background border border-border rounded font-mono"
                              />
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-2 border-r border-border/60 text-center">
                          <div className="inline-flex items-center gap-1 bg-muted/40 border border-border/60 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                              className="h-5 w-5 rounded bg-muted hover:bg-muted/80 flex items-center justify-center font-bold text-[11px]"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold text-foreground font-mono text-[11px]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                              className="h-5 w-5 rounded bg-muted hover:bg-muted/80 flex items-center justify-center font-bold text-[11px]"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-2 border-r border-border/60 text-right">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdatePrice(item.productId, Number(e.target.value))}
                            className="w-16 px-1 py-0.5 text-right font-mono text-xs bg-background border border-border rounded focus:border-primary outline-none"
                          />
                        </td>
                        <td className="py-2 px-2 border-r border-border/60 text-right">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) => handleUpdateDiscount(item.productId, Number(e.target.value))}
                            className="w-14 px-1 py-0.5 text-right font-mono text-xs bg-background border border-border rounded text-primary font-bold focus:border-primary outline-none"
                          />
                        </td>
                        <td className="py-2 px-3 border-r border-border/60 text-right font-bold text-foreground font-mono">
                          {formatCurrency(
                            (item.unitPrice * item.quantity - item.discount) * (1 + item.gstRate / 100),
                            currency,
                            currencySymbol
                          )}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-1 text-muted-foreground hover:text-destructive rounded transition"
                            title="Remove Item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Notes input */}
            <div className="shrink-0">
              <input
                type="text"
                placeholder="Order notes, dispatch terms or delivery instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {/* Summary Box */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-2 text-xs shrink-0 shadow-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(calculations.subtotal, currency, currencySymbol)}</span>
              </div>
              {calculations.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-500 font-medium">
                  <span>Total Discounts {wholesaleTierDiscount > 0 ? `(Includes ${wholesaleTierDiscount}% B2B Tier)` : ''}</span>
                  <span className="font-mono">-{formatCurrency(calculations.totalDiscount, currency, currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Calculated Tax (GST)</span>
                <span className="font-mono">+{formatCurrency(calculations.totalTax, currency, currencySymbol)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-base font-extrabold text-foreground">
                <span>Grand Total</span>
                <span className="text-primary font-mono text-lg">
                  {formatCurrency(calculations.grandTotal, currency, currencySymbol)}
                </span>
              </div>
            </div>

            {/* Complete sale action */}
            <div className="flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setCart([])}
                disabled={cart.length === 0}
                className="flex items-center gap-1 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground rounded-xl transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
              <button
                onClick={handleCompleteSale}
                disabled={submitting || cart.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md teal-glow transition disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Confirm {currentFlow.toUpperCase()} Order ({formatCurrency(calculations.grandTotal, currency, currencySymbol)})
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
