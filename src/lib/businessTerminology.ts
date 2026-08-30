import { BusinessFlowType } from '../types';

export interface BusinessSheetMeta {
  sheetDisplayName: string;
  addRecordTitle: string;
  editRecordTitle: string;
  columnDisplayNames: Record<string, string>;
  recommendedVisibleColumns: string[];
}

export function getBusinessTerminology(flowType: BusinessFlowType, sheetName: string): BusinessSheetMeta {
  switch (flowType) {
    case 'taxi':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Cabs & Rate Slabs',
          addRecordTitle: 'Add New Cab / Rate Slab',
          editRecordTitle: 'Edit Cab / Rate Slab',
          columnDisplayNames: {
            sku: 'Vehicle Code / Plate',
            name: 'Cab Model & Category',
            selling_price: 'Fare Rate (per km / base)',
            purchase_price: 'Driver Base Payout',
            minimum_stock: 'Fleet Target Cabs',
            status: 'Operational Status',
            category_id: 'Fleet Category',
            created_at: 'Added Date',
            updated_at: 'Modified Date',
          },
          recommendedVisibleColumns: ['sku', 'name', 'selling_price', 'minimum_stock', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Vehicle Fleet Status',
          addRecordTitle: 'Register Fleet Vehicle',
          editRecordTitle: 'Update Vehicle Status',
          columnDisplayNames: {
            product_id: 'Assigned Cab Model',
            quantity: 'Active Cabs Available',
            minimum_stock: 'Minimum Standby Target',
            updated_at: 'Last Status Check',
          },
          recommendedVisibleColumns: ['product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Passengers & Corporate Accounts',
          addRecordTitle: 'Add New Passenger / Account',
          editRecordTitle: 'Edit Passenger Details',
          columnDisplayNames: {
            name: 'Passenger / Client Name',
            phone: 'Contact Mobile #',
            email: 'Email Receipt Address',
            address: 'Default Pickup Address',
            gstin: 'Corporate GSTIN / Tax ID',
          },
          recommendedVisibleColumns: ['name', 'phone', 'email', 'address', 'gstin'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Fleet Drivers & Vehicle Owners',
          addRecordTitle: 'Onboard New Fleet Driver',
          editRecordTitle: 'Edit Driver Profile',
          columnDisplayNames: {
            name: 'Driver Full Name',
            phone: 'Driver Mobile #',
            email: 'Email',
            address: 'Driver City / Region',
            gstin: 'Driving License #',
            notes: 'Commission / Vehicle Reg #',
          },
          recommendedVisibleColumns: ['name', 'phone', 'gstin', 'notes'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Trips & Dispatch Ledger',
          addRecordTitle: 'Book New Cab Trip',
          editRecordTitle: 'Edit Trip Details',
          columnDisplayNames: {
            customer_id: 'Passenger Name',
            sale_date: 'Trip Dispatch Date',
            total: 'Total Trip Fare',
            payment_method: 'Payment Mode',
            status: 'Trip Status',
          },
          recommendedVisibleColumns: ['customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      break;

    case 'hotel':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Rooms & Suites Catalog',
          addRecordTitle: 'Add New Room / Suite',
          editRecordTitle: 'Edit Room Configuration',
          columnDisplayNames: {
            sku: 'Room Number',
            name: 'Room Category & View',
            selling_price: 'Tariff per Night',
            purchase_price: 'Operating Cost',
            minimum_stock: 'Capacity (Guests)',
            status: 'Availability Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'selling_price', 'minimum_stock', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Room Occupancy & Housekeeping',
          addRecordTitle: 'Log Room Status',
          editRecordTitle: 'Update Room Status',
          columnDisplayNames: {
            product_id: 'Room Category',
            quantity: 'Available Rooms',
            minimum_stock: 'Minimum Vacancy Reserve',
            updated_at: 'Last Inspected',
          },
          recommendedVisibleColumns: ['product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Guests & Visitors Folios',
          addRecordTitle: 'Register New Guest',
          editRecordTitle: 'Edit Guest Details',
          columnDisplayNames: {
            name: 'Primary Guest Name',
            phone: 'Contact Phone',
            email: 'Email',
            address: 'City / Nationality',
            gstin: 'Govt ID Proof / Passport',
          },
          recommendedVisibleColumns: ['name', 'phone', 'address', 'gstin'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Stay Bookings & Billing Folios',
          addRecordTitle: 'Check-in Guest & Reserve',
          editRecordTitle: 'Edit Stay Folio',
          columnDisplayNames: {
            customer_id: 'Guest Name',
            sale_date: 'Check-in Date',
            total: 'Total Stay Bill',
            payment_method: 'Settlement Mode',
            status: 'Stay Status',
          },
          recommendedVisibleColumns: ['customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      break;

    case 'school':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Academic Fee Heads & Slabs',
          addRecordTitle: 'Add New Fee Head',
          editRecordTitle: 'Edit Fee Structure',
          columnDisplayNames: {
            sku: 'Fee Code',
            name: 'Fee Head Description',
            selling_price: 'Term Fee Amount',
            status: 'Active Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'selling_price', 'status'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Students & Parents Registry',
          addRecordTitle: 'Enroll New Student',
          editRecordTitle: 'Edit Student Record',
          columnDisplayNames: {
            name: 'Student Full Name',
            phone: 'Guardian Contact Phone',
            email: 'Parent Email',
            address: 'Grade / Class Section',
            gstin: 'Admission / Roll Number',
          },
          recommendedVisibleColumns: ['name', 'address', 'gstin', 'phone', 'email'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Teachers & Academic Staff',
          addRecordTitle: 'Add Faculty Member',
          editRecordTitle: 'Edit Faculty Profile',
          columnDisplayNames: {
            name: 'Teacher Full Name',
            phone: 'Mobile #',
            email: 'Staff Email',
            address: 'Department / Subject',
            gstin: 'Employee Staff ID',
          },
          recommendedVisibleColumns: ['name', 'address', 'gstin', 'phone'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Fee Collections & Receipts',
          addRecordTitle: 'Issue School Fee Receipt',
          editRecordTitle: 'Edit Fee Receipt',
          columnDisplayNames: {
            customer_id: 'Student Name',
            sale_date: 'Receipt Date',
            total: 'Fee Paid',
            payment_method: 'Payment Channel',
            status: 'Payment Status',
          },
          recommendedVisibleColumns: ['customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      break;

    case 'coaching':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Courses & Batches Catalog',
          addRecordTitle: 'Add New Course / Batch',
          editRecordTitle: 'Edit Course Details',
          columnDisplayNames: {
            sku: 'Course Code',
            name: 'Course & Target Exam Name',
            selling_price: 'Total Course Fee',
            status: 'Enrollment Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'selling_price', 'status'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Enrolled Students Roster',
          addRecordTitle: 'Enroll Candidate',
          editRecordTitle: 'Edit Candidate Profile',
          columnDisplayNames: {
            name: 'Student Candidate Name',
            phone: 'Candidate / WhatsApp Phone',
            email: 'Student Email',
            address: 'Target Exam / Batch Timing',
            gstin: 'Registration Roll #',
          },
          recommendedVisibleColumns: ['name', 'address', 'phone', 'email', 'gstin'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Fee Installments Ledger',
          addRecordTitle: 'Record Fee Installment',
          editRecordTitle: 'Edit Installment',
          columnDisplayNames: {
            customer_id: 'Student Name',
            sale_date: 'Installment Paid Date',
            total: 'Amount Received',
            payment_method: 'Payment Channel',
            status: 'Status',
          },
          recommendedVisibleColumns: ['customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      break;

    case 'payroll':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Salary Structures & Components',
          addRecordTitle: 'Add Salary Component',
          editRecordTitle: 'Edit Salary Component',
          columnDisplayNames: {
            sku: 'Pay Code',
            name: 'Salary Component (Basic/HRA/etc.)',
            selling_price: 'Standard Base Amount',
            status: 'Active Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'selling_price', 'status'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Employees & Staff Directory',
          addRecordTitle: 'Onboard New Employee',
          editRecordTitle: 'Edit Employee Profile',
          columnDisplayNames: {
            name: 'Employee Full Name',
            phone: 'Contact Phone',
            email: 'Official Work Email',
            address: 'Designation & Department',
            gstin: 'Employee ID / PAN Number',
          },
          recommendedVisibleColumns: ['name', 'address', 'gstin', 'phone', 'email'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Monthly Payroll Disbursals',
          addRecordTitle: 'Process Pay Run',
          editRecordTitle: 'Edit Pay Run',
          columnDisplayNames: {
            customer_id: 'Employee Name',
            sale_date: 'Disbursal Date',
            total: 'Net Take-Home Pay',
            payment_method: 'Transfer Method',
            status: 'Status',
          },
          recommendedVisibleColumns: ['customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      break;

    case 'gym':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Membership Plans & Passes',
          addRecordTitle: 'Add New Gym Plan',
          editRecordTitle: 'Edit Plan Configuration',
          columnDisplayNames: {
            sku: 'Plan Code',
            name: 'Membership Tier Duration',
            selling_price: 'Subscription Price',
            status: 'Plan Availability',
          },
          recommendedVisibleColumns: ['sku', 'name', 'selling_price', 'status'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Gym Members Directory',
          addRecordTitle: 'Enroll New Member',
          editRecordTitle: 'Edit Member Details',
          columnDisplayNames: {
            name: 'Member Full Name',
            phone: 'Contact Phone / WhatsApp',
            email: 'Email',
            address: 'Assigned Locker / Coach',
            gstin: 'Emergency Contact Phone',
          },
          recommendedVisibleColumns: ['name', 'phone', 'address', 'email'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Membership Subscriptions',
          addRecordTitle: 'Activate / Renew Membership',
          editRecordTitle: 'Edit Subscription',
          columnDisplayNames: {
            customer_id: 'Member Name',
            sale_date: 'Activation Date',
            total: 'Total Subscription Fee',
            payment_method: 'Payment Channel',
            status: 'Membership Status',
          },
          recommendedVisibleColumns: ['customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      break;

    case 'hospital':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Medical Services & Investigations',
          addRecordTitle: 'Add Medical Service / Test',
          editRecordTitle: 'Edit Service Details',
          columnDisplayNames: {
            sku: 'Service Code',
            name: 'Procedure / Consultation / Test',
            selling_price: 'Standard Charge / Fee',
            status: 'Service Availability',
          },
          recommendedVisibleColumns: ['sku', 'name', 'selling_price', 'status'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Patients Medical Registry',
          addRecordTitle: 'Register New Patient',
          editRecordTitle: 'Edit Patient Medical Record',
          columnDisplayNames: {
            name: 'Patient Full Name',
            phone: 'Emergency Contact Phone',
            email: 'Email',
            address: 'Age / Gender / Blood Group',
            gstin: 'Universal Health ID (UHID)',
          },
          recommendedVisibleColumns: ['name', 'address', 'gstin', 'phone'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Doctors & Medical Specialists',
          addRecordTitle: 'Add Doctor / Consultant',
          editRecordTitle: 'Edit Doctor Profile',
          columnDisplayNames: {
            name: 'Doctor Full Name & Degree',
            phone: 'Contact Mobile #',
            email: 'Email',
            address: 'Department / OPD Schedule',
            gstin: 'Medical Registration #',
          },
          recommendedVisibleColumns: ['name', 'address', 'gstin', 'phone'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'OPD Encounters & Medical Bills',
          addRecordTitle: 'Bill Patient Encounter',
          editRecordTitle: 'Edit Medical Bill',
          columnDisplayNames: {
            customer_id: 'Patient Name',
            sale_date: 'Consultation Date',
            total: 'Total Medical Bill',
            payment_method: 'Payment / Insurance Mode',
            status: 'Bill Status',
          },
          recommendedVisibleColumns: ['customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      break;

    case 'pharmacy':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Medicines & Drugs Catalog',
          addRecordTitle: 'Add Medicine / Drug',
          editRecordTitle: 'Edit Medicine Details',
          columnDisplayNames: {
            sku: 'Drug Code / Barcode',
            name: 'Brand & Generic Name',
            selling_price: 'MRP / Selling Price',
            purchase_price: 'Purchase Cost',
            minimum_stock: 'Re-order Threshold',
            status: 'Schedule Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'selling_price', 'minimum_stock', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Batches & Expiry Tracking',
          addRecordTitle: 'Receive New Batch',
          editRecordTitle: 'Update Batch Stock',
          columnDisplayNames: {
            product_id: 'Medicine Name',
            quantity: 'Pack Units in Stock',
            minimum_stock: 'Minimum Target',
            updated_at: 'Expiry Check Date',
          },
          recommendedVisibleColumns: ['product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      break;

    case 'wholesale':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Wholesale B2B Catalog',
          addRecordTitle: 'Add Wholesale SKU',
          editRecordTitle: 'Edit Wholesale SKU',
          columnDisplayNames: {
            sku: 'SKU / Barcode',
            name: 'Wholesale Product Name',
            selling_price: 'Bulk Selling Price',
            purchase_price: 'Wholesale Cost Price',
            minimum_stock: 'Minimum Case Pack',
            status: 'Stock Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'selling_price', 'purchase_price', 'minimum_stock', 'status'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'B2B Sales & Dispatches',
          addRecordTitle: 'Create B2B Invoice',
          editRecordTitle: 'Edit B2B Invoice',
          columnDisplayNames: {
            customer_id: 'B2B Client Company',
            sale_date: 'Invoice Date',
            total: 'Total Amount',
            payment_method: 'Credit Terms (Net 15/30/60)',
            status: 'Dispatch Status',
          },
          recommendedVisibleColumns: ['customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      break;

    case 'restaurant':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Dishes & Menu Catalog',
          addRecordTitle: 'Add New Menu Dish',
          editRecordTitle: 'Edit Dish Recipe & Price',
          columnDisplayNames: {
            sku: 'Dish Code',
            name: 'Menu Item / Dish Name',
            selling_price: 'Menu Price',
            purchase_price: 'Food Cost (Raw)',
            minimum_stock: 'Target Portions',
            status: 'Kitchen Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'selling_price', 'minimum_stock', 'status'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Dine-in Guests & Tables',
          addRecordTitle: 'Add Table / Guest Record',
          editRecordTitle: 'Edit Guest Preferences',
          columnDisplayNames: {
            name: 'Guest / Customer Name',
            phone: 'Contact Phone',
            address: 'Table # / Area',
            gstin: 'Dietary Notes',
          },
          recommendedVisibleColumns: ['name', 'address', 'phone', 'gstin'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'KOT & Table Orders Ledger',
          addRecordTitle: 'Settle Food Bill (KOT)',
          editRecordTitle: 'Edit Table Order',
          columnDisplayNames: {
            customer_id: 'Guest / Table #',
            sale_date: 'Order Time',
            total: 'Total Bill Paid',
            payment_method: 'Settlement Mode',
            status: 'Kitchen Status',
          },
          recommendedVisibleColumns: ['customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      break;

    case 'realestate':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Rental Units & Properties',
          addRecordTitle: 'Add Rental Unit Type',
          editRecordTitle: 'Edit Property Details',
          columnDisplayNames: {
            sku: 'Plan Code',
            name: 'Unit Classification',
            selling_price: 'Monthly Rent',
            purchase_price: 'Maintenance Share',
            status: 'Availability',
          },
          recommendedVisibleColumns: ['sku', 'name', 'selling_price', 'status'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Tenants & Lease Agreements',
          addRecordTitle: 'Enroll New Tenant',
          editRecordTitle: 'Edit Lease Agreement',
          columnDisplayNames: {
            name: 'Tenant Full Name',
            phone: 'Contact Mobile #',
            email: 'Email',
            address: 'Leased Unit Address',
            gstin: 'Agreement / ID #',
          },
          recommendedVisibleColumns: ['name', 'address', 'phone', 'gstin'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Rent Collections Ledger',
          addRecordTitle: 'Record Rent Receipt',
          editRecordTitle: 'Edit Rent Receipt',
          columnDisplayNames: {
            customer_id: 'Tenant Name',
            sale_date: 'Rent Month Date',
            total: 'Total Rent Collected',
            payment_method: 'Payment Channel',
            status: 'Status',
          },
          recommendedVisibleColumns: ['customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      break;

    case 'garage':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Service Packages & Spares',
          addRecordTitle: 'Add Service Package / Part',
          editRecordTitle: 'Edit Service / Part',
          columnDisplayNames: {
            sku: 'Part # / Code',
            name: 'Service / Spare Part Name',
            selling_price: 'Customer Retail Price',
            purchase_price: 'Trade / Cost Price',
            minimum_stock: 'Bin Reorder Level',
            status: 'Stock Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'selling_price', 'minimum_stock', 'status'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Vehicle Owners & Job Cards',
          addRecordTitle: 'Create Vehicle Job Card',
          editRecordTitle: 'Edit Job Card',
          columnDisplayNames: {
            name: 'Vehicle Owner Name',
            phone: 'Mobile #',
            address: 'Vehicle Model & Plate #',
            gstin: 'Odometer (km) / VIN',
          },
          recommendedVisibleColumns: ['name', 'address', 'gstin', 'phone'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Repair Invoices Ledger',
          addRecordTitle: 'Issue Repair Bill',
          editRecordTitle: 'Edit Repair Invoice',
          columnDisplayNames: {
            customer_id: 'Vehicle Owner',
            sale_date: 'Invoice Date',
            total: 'Total Repair Bill',
            payment_method: 'Payment Mode',
            status: 'Delivery Status',
          },
          recommendedVisibleColumns: ['customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      break;

    case 'salon':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Salon Treatments & Cosmetics',
          addRecordTitle: 'Add Treatment / Product',
          editRecordTitle: 'Edit Salon Service',
          columnDisplayNames: {
            sku: 'Treatment Code',
            name: 'Treatment / Product Name',
            selling_price: 'Service Charge / MRP',
            purchase_price: 'Consumable Cost',
            status: 'Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'selling_price', 'status'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Salon Clients Directory',
          addRecordTitle: 'Register Salon Client',
          editRecordTitle: 'Edit Client Profile',
          columnDisplayNames: {
            name: 'Client Full Name',
            phone: 'Mobile / WhatsApp',
            email: 'Email',
            address: 'Preferred Stylist',
            gstin: 'Allergy / Style Notes',
          },
          recommendedVisibleColumns: ['name', 'address', 'phone', 'gstin'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Appointment Invoices',
          addRecordTitle: 'Bill Appointment Session',
          editRecordTitle: 'Edit Appointment Bill',
          columnDisplayNames: {
            customer_id: 'Client Name',
            sale_date: 'Appointment Date',
            total: 'Total Bill Amount',
            payment_method: 'Settlement Mode',
            status: 'Status',
          },
          recommendedVisibleColumns: ['customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      break;

    default:
      break;
  }

  // Universal fallback for retail & generic tables
  const defaultTitle = sheetName.replace('_', '');
  return {
    sheetDisplayName: defaultTitle,
    addRecordTitle: `Add New ${defaultTitle.slice(0, -1) || defaultTitle}`,
    editRecordTitle: `Edit ${defaultTitle} Record`,
    columnDisplayNames: {
      sku: 'SKU / Code',
      name: 'Item / Product Name',
      selling_price: 'Selling Price',
      purchase_price: 'Cost Price',
      minimum_stock: 'Min Alert Qty',
      created_at: 'Date Created',
      updated_at: 'Last Modified',
      customer_id: 'Customer',
      sale_date: 'Date',
      total: 'Total Amount',
      payment_method: 'Payment Method',
    },
    recommendedVisibleColumns: ['sku', 'name', 'selling_price', 'minimum_stock', 'status'],
  };
}
