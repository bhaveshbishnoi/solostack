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
    case 'gym':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Membership Plans & Passes',
          addRecordTitle: 'Add New Gym Plan',
          editRecordTitle: 'Edit Plan Configuration',
          columnDisplayNames: {
            product_id: 'Plan Code',
            sku: 'Tier Code',
            name: 'Membership Plan Name',
            category_id: 'Duration Tier',
            purchase_price: 'Maintenance Cost',
            selling_price: 'Subscription Fee',
            gst_rate: 'GST %',
            unit: 'Validity Unit',
            minimum_stock: 'Target Active Members',
            status: 'Plan Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'selling_price', 'unit', 'minimum_stock', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Gym Equipment & Pro-Shop',
          addRecordTitle: 'Register Gym Asset / Pro-Shop Item',
          editRecordTitle: 'Edit Equipment / Stock Details',
          columnDisplayNames: {
            inventory_id: 'Asset / Stock ID',
            product_id: 'Associated Tier / Area',
            quantity: 'Units Available',
            minimum_stock: 'Reorder / Alert Threshold',
            updated_at: 'Last Audited',
          },
          recommendedVisibleColumns: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Gym Members Directory',
          addRecordTitle: 'Enroll New Gym Member',
          editRecordTitle: 'Edit Member Profile',
          columnDisplayNames: {
            customer_id: 'Member ID',
            name: 'Member Full Name',
            phone: 'Contact Phone / WhatsApp',
            email: 'Email Address',
            address: 'Assigned Locker & Coach',
            gstin: 'Emergency Contact & Blood Group',
            created_at: 'Join Date',
            updated_at: 'Membership Valid Till',
          },
          recommendedVisibleColumns: ['customer_id', 'name', 'phone', 'address', 'gstin', 'updated_at'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Personal Trainers & Coaches',
          addRecordTitle: 'Onboard Personal Trainer',
          editRecordTitle: 'Edit Trainer Profile',
          columnDisplayNames: {
            supplier_id: 'Trainer ID',
            name: 'Personal Trainer Name',
            phone: 'Phone',
            email: 'Email',
            address: 'Specialization & Shift',
            gstin: 'Certification ID',
            notes: 'Commission & Payout Terms',
            created_at: 'Onboarded Date',
          },
          recommendedVisibleColumns: ['supplier_id', 'name', 'phone', 'address', 'gstin', 'notes'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Subscriptions & Renewals',
          addRecordTitle: 'Activate / Renew Membership',
          editRecordTitle: 'Edit Subscription Record',
          columnDisplayNames: {
            sale_id: 'Subscription Invoice #',
            customer_id: 'Member Name',
            sale_date: 'Activation Date',
            subtotal: 'Base Plan Fee',
            discount: 'Promo Discount',
            tax: 'Gym GST (18%)',
            total: 'Total Fee Paid',
            payment_method: 'Payment Channel',
            status: 'Membership Status',
          },
          recommendedVisibleColumns: ['sale_id', 'customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      if (sheetName === '_SaleItems') {
        return {
          sheetDisplayName: 'Subscription Item Breakdown',
          addRecordTitle: 'Add Plan / Addon Item',
          editRecordTitle: 'Edit Subscription Line Item',
          columnDisplayNames: {
            sale_item_id: 'Item ID',
            sale_id: 'Subscription Invoice #',
            product_id: 'Plan Code',
            quantity: 'Duration (Months/Units)',
            unit_price: 'Plan Fee',
            discount: 'Discount',
            tax: 'GST (18%)',
            line_total: 'Total',
          },
          recommendedVisibleColumns: ['sale_id', 'product_id', 'quantity', 'unit_price', 'line_total'],
        };
      }
      if (sheetName === '_Expenses') {
        return {
          sheetDisplayName: 'Gym Operating Expenses',
          addRecordTitle: 'Record Gym Expense',
          editRecordTitle: 'Edit Expense Entry',
          columnDisplayNames: {
            expense_id: 'Expense ID',
            date: 'Date',
            category: 'Expense Category',
            description: 'Description',
            amount: 'Amount',
            gst: 'GST Input',
            payment_method: 'Payment Method',
            notes: 'Reference / Invoice #',
          },
          recommendedVisibleColumns: ['date', 'category', 'description', 'amount', 'payment_method'],
        };
      }
      if (sheetName === '_Categories') {
        return {
          sheetDisplayName: 'Membership Tiers',
          addRecordTitle: 'Add Membership Tier',
          editRecordTitle: 'Edit Tier Configuration',
          columnDisplayNames: {
            category_id: 'Category ID',
            name: 'Tier Category Name',
            description: 'Access Scope & Privileges',
            status: 'Status',
          },
          recommendedVisibleColumns: ['category_id', 'name', 'description', 'status'],
        };
      }
      break;

    case 'school':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Fee Heads & Slabs',
          addRecordTitle: 'Add New Fee Head',
          editRecordTitle: 'Edit Fee Head Configuration',
          columnDisplayNames: {
            product_id: 'Fee Head ID',
            sku: 'Fee Code',
            name: 'Fee Head Description',
            category_id: 'Academic Grade Wing',
            purchase_price: 'Institutional Cost',
            selling_price: 'Term Fee Amount',
            gst_rate: 'Tax %',
            unit: 'Billing Term',
            minimum_stock: 'Target Enrollment',
            status: 'Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'category_id', 'selling_price', 'unit', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Classroom, Lab & Transport Assets',
          addRecordTitle: 'Register Campus Asset',
          editRecordTitle: 'Edit Asset Details',
          columnDisplayNames: {
            inventory_id: 'Asset / Stock ID',
            product_id: 'Associated Facility / Wing',
            quantity: 'Working Units / Capacity',
            minimum_stock: 'Minimum Threshold',
            updated_at: 'Last Verified Date',
          },
          recommendedVisibleColumns: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Students Roster',
          addRecordTitle: 'Admit New Student',
          editRecordTitle: 'Edit Student Details',
          columnDisplayNames: {
            customer_id: 'Student ID',
            name: 'Student Full Name',
            phone: 'Guardian Primary Mobile',
            email: 'Parent Email',
            address: 'Grade & Section',
            gstin: 'Admission / Roll No',
            created_at: 'Admission Date',
            updated_at: 'Academic Session',
          },
          recommendedVisibleColumns: ['customer_id', 'name', 'address', 'gstin', 'phone', 'email'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Faculty & Teachers Roster',
          addRecordTitle: 'Onboard Faculty Member',
          editRecordTitle: 'Edit Teacher Profile',
          columnDisplayNames: {
            supplier_id: 'Teacher ID',
            name: 'Teacher Full Name',
            phone: 'Mobile #',
            email: 'Official Staff Email',
            address: 'Subject & Department',
            gstin: 'Employee Staff Code',
            notes: 'Designation & Mentorship',
            created_at: 'Joining Date',
          },
          recommendedVisibleColumns: ['supplier_id', 'name', 'address', 'gstin', 'phone', 'notes'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Term Fee Receipts Ledger',
          addRecordTitle: 'Collect Fee / Issue Receipt',
          editRecordTitle: 'Edit Fee Receipt',
          columnDisplayNames: {
            sale_id: 'Fee Receipt #',
            customer_id: 'Student Name',
            sale_date: 'Receipt Date',
            subtotal: 'Tuition & Lab Fee',
            discount: 'Sibling / Merit Concession',
            tax: 'Tax',
            total: 'Total Fee Paid',
            payment_method: 'Payment Channel',
            status: 'Receipt Status',
          },
          recommendedVisibleColumns: ['sale_id', 'customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      if (sheetName === '_SaleItems') {
        return {
          sheetDisplayName: 'Receipt Fee Line Items',
          addRecordTitle: 'Add Fee Line Item',
          editRecordTitle: 'Edit Fee Line Item',
          columnDisplayNames: {
            sale_item_id: 'Item ID',
            sale_id: 'Receipt No',
            product_id: 'Fee Head',
            quantity: 'Terms / Qty',
            unit_price: 'Fee Amount',
            discount: 'Concession',
            tax: 'Tax',
            line_total: 'Total Paid',
          },
          recommendedVisibleColumns: ['sale_id', 'product_id', 'quantity', 'unit_price', 'line_total'],
        };
      }
      if (sheetName === '_Expenses') {
        return {
          sheetDisplayName: 'Educational & Campus Expenses',
          addRecordTitle: 'Record School Expense',
          editRecordTitle: 'Edit Expense Voucher',
          columnDisplayNames: {
            expense_id: 'Expense ID',
            date: 'Date',
            category: 'Institutional Category',
            description: 'Description',
            amount: 'Amount',
            gst: 'Tax',
            payment_method: 'Disbursement Mode',
            notes: 'Voucher / Ref #',
          },
          recommendedVisibleColumns: ['date', 'category', 'description', 'amount', 'payment_method'],
        };
      }
      if (sheetName === '_Categories') {
        return {
          sheetDisplayName: 'Academic Grade Wings',
          addRecordTitle: 'Add Grade Wing',
          editRecordTitle: 'Edit Grade Wing',
          columnDisplayNames: {
            category_id: 'Category ID',
            name: 'Academic Wing Name',
            description: 'Grades & Curriculum Covered',
            status: 'Status',
          },
          recommendedVisibleColumns: ['category_id', 'name', 'description', 'status'],
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
            product_id: 'Dish ID',
            sku: 'Dish Code',
            name: 'Menu Item / Dish Name',
            category_id: 'Course / Category',
            purchase_price: 'Food Cost (Raw Materials)',
            selling_price: 'Menu Price',
            gst_rate: 'Restaurant GST %',
            unit: 'Serving Unit',
            minimum_stock: 'Daily Prep Target',
            status: 'Kitchen Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'category_id', 'selling_price', 'purchase_price', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Raw Ingredients & Pantry Stock',
          addRecordTitle: 'Log Kitchen Ingredient Stock',
          editRecordTitle: 'Edit Ingredient Stock',
          columnDisplayNames: {
            inventory_id: 'Ingredient / Stock ID',
            product_id: 'Linked Dish / Station',
            quantity: 'Stock On-Hand (Qty/Kg)',
            minimum_stock: 'Reorder / Prep Threshold',
            updated_at: 'Kitchen Stock Time',
          },
          recommendedVisibleColumns: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Dine-in Guests & Tables',
          addRecordTitle: 'Add Table / Guest Record',
          editRecordTitle: 'Edit Guest Preferences',
          columnDisplayNames: {
            customer_id: 'Guest / Table ID',
            name: 'Guest / Customer Name',
            phone: 'Mobile / WhatsApp',
            email: 'Email',
            address: 'Table # / Delivery Destination',
            gstin: 'Special Dietary Notes',
            created_at: 'Visit Date',
            updated_at: 'Updated At',
          },
          recommendedVisibleColumns: ['customer_id', 'name', 'address', 'phone', 'gstin'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Kitchen Vendors & Dairies',
          addRecordTitle: 'Onboard Food Vendor',
          editRecordTitle: 'Edit Vendor Profile',
          columnDisplayNames: {
            supplier_id: 'Vendor ID',
            name: 'Kitchen Vendor / Wholesale Partner',
            phone: 'Phone',
            email: 'Email',
            address: 'Supplies Category',
            gstin: 'Vendor GSTIN',
            notes: 'Delivery Schedule & Payment Terms',
            created_at: 'Added Date',
          },
          recommendedVisibleColumns: ['supplier_id', 'name', 'address', 'phone', 'gstin', 'notes'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'KOT & Table Orders Ledger',
          addRecordTitle: 'Settle Food Bill (KOT)',
          editRecordTitle: 'Edit Table Order',
          columnDisplayNames: {
            sale_id: 'Order / KOT ID',
            customer_id: 'Guest / Table Name',
            sale_date: 'Order Date & Time',
            subtotal: 'Food Subtotal',
            discount: 'Happy Hour Concession',
            tax: 'Restaurant GST (5%)',
            total: 'Total Bill Paid',
            payment_method: 'Settlement Mode',
            status: 'Kitchen Status',
          },
          recommendedVisibleColumns: ['sale_id', 'customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      if (sheetName === '_SaleItems') {
        return {
          sheetDisplayName: 'KOT Itemized Dishes',
          addRecordTitle: 'Add Dish Item to KOT',
          editRecordTitle: 'Edit KOT Line Item',
          columnDisplayNames: {
            sale_item_id: 'Item ID',
            sale_id: 'KOT Bill #',
            product_id: 'Dish ID',
            quantity: 'Portions Ordered',
            unit_price: 'Menu Price',
            discount: 'Discount',
            tax: 'GST (5%)',
            line_total: 'Line Total',
          },
          recommendedVisibleColumns: ['sale_id', 'product_id', 'quantity', 'unit_price', 'line_total'],
        };
      }
      if (sheetName === '_Expenses') {
        return {
          sheetDisplayName: 'Kitchen & Restaurant Expenses',
          addRecordTitle: 'Log Kitchen Expense',
          editRecordTitle: 'Edit Kitchen Expense',
          columnDisplayNames: {
            expense_id: 'Expense ID',
            date: 'Date',
            category: 'Expense Category',
            description: 'Description',
            amount: 'Amount',
            gst: 'GST',
            payment_method: 'Disbursement Mode',
            notes: 'Voucher / Bill #',
          },
          recommendedVisibleColumns: ['date', 'category', 'description', 'amount', 'payment_method'],
        };
      }
      if (sheetName === '_Categories') {
        return {
          sheetDisplayName: 'Course Menu Categories',
          addRecordTitle: 'Add Menu Category',
          editRecordTitle: 'Edit Menu Category',
          columnDisplayNames: {
            category_id: 'Category ID',
            name: 'Course Menu Category',
            description: 'Kitchen Department & Prep Station',
            status: 'Status',
          },
          recommendedVisibleColumns: ['category_id', 'name', 'description', 'status'],
        };
      }
      break;

    case 'hotel':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Rooms & Tariffs Catalog',
          addRecordTitle: 'Add Room Type / Tariff',
          editRecordTitle: 'Edit Room Configuration',
          columnDisplayNames: {
            product_id: 'Room Category Code',
            sku: 'Category Code',
            name: 'Room Type & View',
            category_id: 'Wing / Floor Tier',
            purchase_price: 'Turnaround Cost',
            selling_price: 'Nightly Tariff',
            gst_rate: 'GST %',
            unit: 'Unit',
            minimum_stock: 'Max Occupancy',
            status: 'Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'category_id', 'selling_price', 'minimum_stock', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Physical Rooms & Housekeeping',
          addRecordTitle: 'Register Physical Room',
          editRecordTitle: 'Update Housekeeping Status',
          columnDisplayNames: {
            inventory_id: 'Room / Asset ID',
            product_id: 'Room Category',
            quantity: 'Available Units / Rooms',
            minimum_stock: 'Standby Reserve',
            updated_at: 'Housekeeping Check',
          },
          recommendedVisibleColumns: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Hotel Guests & Folios',
          addRecordTitle: 'Check-in New Guest',
          editRecordTitle: 'Edit Guest Profile',
          columnDisplayNames: {
            customer_id: 'Guest ID',
            name: 'Guest Full Name',
            phone: 'Mobile #',
            email: 'Email Address',
            address: 'City / Country of Origin',
            gstin: 'Govt ID Proof / Passport #',
            created_at: 'First Stay',
            updated_at: 'Last Visit Date',
          },
          recommendedVisibleColumns: ['customer_id', 'name', 'address', 'gstin', 'phone', 'email'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Hotel Vendors & Laundry Partners',
          addRecordTitle: 'Onboard Hotel Vendor',
          editRecordTitle: 'Edit Vendor Profile',
          columnDisplayNames: {
            supplier_id: 'Vendor ID',
            name: 'Vendor / Supply Partner',
            phone: 'Contact Phone',
            email: 'Email',
            address: 'Supplies Category',
            gstin: 'Vendor GSTIN',
            notes: 'Service SLA & Terms',
            created_at: 'Added Date',
          },
          recommendedVisibleColumns: ['supplier_id', 'name', 'address', 'phone', 'gstin', 'notes'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Stay Folios Ledger',
          addRecordTitle: 'Open / Settle Stay Folio',
          editRecordTitle: 'Edit Folio Charges',
          columnDisplayNames: {
            sale_id: 'Stay Folio #',
            customer_id: 'Guest Name',
            sale_date: 'Check-out Date',
            subtotal: 'Room & Dining Charges',
            discount: 'Corporate / Loyalty Concession',
            tax: 'Hospitality GST (12%)',
            total: 'Total Folio Bill',
            payment_method: 'Payment Mode',
            status: 'Folio Status',
          },
          recommendedVisibleColumns: ['sale_id', 'customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      if (sheetName === '_Expenses') {
        return {
          sheetDisplayName: 'Hospitality Operating Expenses',
          addRecordTitle: 'Record Hotel Expense',
          editRecordTitle: 'Edit Hotel Expense',
          columnDisplayNames: {
            expense_id: 'Expense ID',
            date: 'Date',
            category: 'Operating Category',
            description: 'Description',
            amount: 'Amount',
            gst: 'GST Input',
            payment_method: 'Disbursement Mode',
            notes: 'Voucher / Bill #',
          },
          recommendedVisibleColumns: ['date', 'category', 'description', 'amount', 'payment_method'],
        };
      }
      if (sheetName === '_Categories') {
        return {
          sheetDisplayName: 'Wings & Room Categories',
          addRecordTitle: 'Add Hotel Wing / Tier',
          editRecordTitle: 'Edit Wing Details',
          columnDisplayNames: {
            category_id: 'Category ID',
            name: 'Wing / Tier Name',
            description: 'Floor & Amenities Description',
            status: 'Status',
          },
          recommendedVisibleColumns: ['category_id', 'name', 'description', 'status'],
        };
      }
      break;

    case 'hospital':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Procedures & OPD Consultations',
          addRecordTitle: 'Add Clinical Procedure / Test',
          editRecordTitle: 'Edit Procedure Charge',
          columnDisplayNames: {
            product_id: 'Service Code',
            sku: 'Billing Code',
            name: 'Procedure / Consultation / Test',
            category_id: 'Clinical Department',
            purchase_price: 'Consumable Cost',
            selling_price: 'Standard Patient Charge',
            gst_rate: 'GST %',
            unit: 'Unit',
            minimum_stock: 'Daily Capacity',
            status: 'Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'category_id', 'selling_price', 'minimum_stock', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Hospital Beds & Medical Supplies',
          addRecordTitle: 'Register Inpatient Bed / Medical Stock',
          editRecordTitle: 'Edit Bed / Stock Status',
          columnDisplayNames: {
            inventory_id: 'Bed / Supply Code',
            product_id: 'Service Code',
            quantity: 'Available Beds / Units',
            minimum_stock: 'Safety Reserve Threshold',
            updated_at: 'Last Audited',
          },
          recommendedVisibleColumns: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Patients Registry (UHID)',
          addRecordTitle: 'Register New Patient',
          editRecordTitle: 'Edit Patient Medical Record',
          columnDisplayNames: {
            customer_id: 'Patient UHID',
            name: 'Patient Full Name',
            phone: 'Contact Phone',
            email: 'Email Address',
            address: 'Age, Gender & Blood Group',
            gstin: 'Emergency Contact Person',
            created_at: 'Registered Date',
            updated_at: 'Last Encounter Date',
          },
          recommendedVisibleColumns: ['customer_id', 'name', 'address', 'gstin', 'phone', 'email'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Doctors & Consulting Specialists',
          addRecordTitle: 'Roster Doctor / Surgeon',
          editRecordTitle: 'Edit Doctor Details',
          columnDisplayNames: {
            supplier_id: 'Doctor ID',
            name: 'Doctor Full Name & Degree',
            phone: 'Phone',
            email: 'Email',
            address: 'Department & OPD Timings',
            gstin: 'Medical Council Reg #',
            notes: 'Consultation Share %',
            created_at: 'Joined Date',
          },
          recommendedVisibleColumns: ['supplier_id', 'name', 'address', 'gstin', 'phone', 'notes'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Clinical Encounter Bills',
          addRecordTitle: 'Generate Encounter Bill',
          editRecordTitle: 'Edit Medical Bill',
          columnDisplayNames: {
            sale_id: 'Encounter Bill #',
            customer_id: 'Patient Name',
            sale_date: 'Encounter Date',
            subtotal: 'Consultation & Diagnostics',
            discount: 'Senior Citizen Concession',
            tax: 'Tax',
            total: 'Total Medical Bill',
            payment_method: 'Payment Mode',
            status: 'Bill Status',
          },
          recommendedVisibleColumns: ['sale_id', 'customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      if (sheetName === '_Expenses') {
        return {
          sheetDisplayName: 'Healthcare & Clinical Expenses',
          addRecordTitle: 'Record Healthcare Expense',
          editRecordTitle: 'Edit Expense Entry',
          columnDisplayNames: {
            expense_id: 'Expense ID',
            date: 'Date',
            category: 'Clinical Expense Category',
            description: 'Description',
            amount: 'Amount',
            gst: 'Tax',
            payment_method: 'Disbursement Mode',
            notes: 'Voucher / Bill #',
          },
          recommendedVisibleColumns: ['date', 'category', 'description', 'amount', 'payment_method'],
        };
      }
      if (sheetName === '_Categories') {
        return {
          sheetDisplayName: 'Clinical Departments',
          addRecordTitle: 'Add Clinical Department',
          editRecordTitle: 'Edit Department',
          columnDisplayNames: {
            category_id: 'Category ID',
            name: 'Clinical Department',
            description: 'Department Scope & Specialty',
            status: 'Status',
          },
          recommendedVisibleColumns: ['category_id', 'name', 'description', 'status'],
        };
      }
      break;

    case 'taxi':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Cab Rates & Fare Slabs',
          addRecordTitle: 'Add New Cab / Rate Slab',
          editRecordTitle: 'Edit Cab / Rate Slab',
          columnDisplayNames: {
            product_id: 'Cab Slab ID',
            sku: 'Vehicle Model / Code',
            name: 'Cab Category & Model',
            category_id: 'Fleet Category',
            purchase_price: 'Driver Base Payout',
            selling_price: 'Base Fare / Per Km Rate',
            gst_rate: 'Transport GST %',
            unit: 'Billing Unit',
            minimum_stock: 'Target Standby Cabs',
            status: 'Service Status',
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
            inventory_id: 'Vehicle Reg ID',
            product_id: 'Cab Model',
            quantity: 'Active Cabs on Duty',
            minimum_stock: 'Standby Target',
            updated_at: 'Last Status Check',
          },
          recommendedVisibleColumns: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Passengers & Corporate Accounts',
          addRecordTitle: 'Add Passenger / Corporate Client',
          editRecordTitle: 'Edit Passenger Profile',
          columnDisplayNames: {
            customer_id: 'Passenger ID',
            name: 'Passenger / Client Name',
            phone: 'Contact Phone',
            email: 'Email Address',
            address: 'Default Pickup Point',
            gstin: 'Corporate GSTIN',
          },
          recommendedVisibleColumns: ['name', 'phone', 'email', 'address', 'gstin'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Fleet Drivers & Cab Owners',
          addRecordTitle: 'Onboard Fleet Driver',
          editRecordTitle: 'Edit Driver Details',
          columnDisplayNames: {
            supplier_id: 'Driver ID',
            name: 'Driver Full Name',
            phone: 'Driver Phone',
            email: 'Email',
            address: 'Assigned Vehicle Plate #',
            gstin: 'Commercial Driving License #',
            notes: 'Driver Commission %',
          },
          recommendedVisibleColumns: ['supplier_id', 'name', 'phone', 'address', 'gstin', 'notes'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Trips & Dispatch Ledger',
          addRecordTitle: 'Book / Dispatch Trip',
          editRecordTitle: 'Edit Trip Details',
          columnDisplayNames: {
            sale_id: 'Trip ID',
            customer_id: 'Passenger Name',
            sale_date: 'Trip Date',
            subtotal: 'Base Fare',
            discount: 'Promo Discount',
            tax: 'GST (5%)',
            total: 'Total Trip Fare',
            payment_method: 'Payment Mode',
            status: 'Trip Status',
          },
          recommendedVisibleColumns: ['sale_id', 'customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      if (sheetName === '_Expenses') {
        return {
          sheetDisplayName: 'Fleet Fuel & Maintenance Expenses',
          addRecordTitle: 'Record Fleet Expense',
          editRecordTitle: 'Edit Fleet Expense',
          columnDisplayNames: {
            expense_id: 'Expense ID',
            date: 'Expense Date',
            category: 'Category',
            description: 'Details',
            amount: 'Amount',
            gst: 'Tax',
            payment_method: 'Payment Channel',
            notes: 'Vehicle / Driver Reference',
          },
          recommendedVisibleColumns: ['date', 'category', 'description', 'amount', 'payment_method'],
        };
      }
      if (sheetName === '_Categories') {
        return {
          sheetDisplayName: 'Fleet Categories',
          addRecordTitle: 'Add Fleet Category',
          editRecordTitle: 'Edit Category',
          columnDisplayNames: {
            category_id: 'Category ID',
            name: 'Fleet Category Name',
            description: 'Description & Vehicle Types',
            status: 'Status',
          },
          recommendedVisibleColumns: ['category_id', 'name', 'description', 'status'],
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
            product_id: 'Service / Part ID',
            sku: 'Part # / Service Code',
            name: 'Service Package / Spare Part',
            category_id: 'Repair Category',
            purchase_price: 'Cost / Trade Price',
            selling_price: 'Customer Retail Price',
            gst_rate: 'GST %',
            unit: 'Unit',
            minimum_stock: 'Reorder Level',
            status: 'Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'category_id', 'selling_price', 'minimum_stock', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Spare Parts & Lubricants Stock',
          addRecordTitle: 'Stock Spare Parts / Oils',
          editRecordTitle: 'Edit Parts Stock',
          columnDisplayNames: {
            inventory_id: 'Bin Shelf ID',
            product_id: 'Part ID',
            quantity: 'Quantity in Store Room',
            minimum_stock: 'Minimum Stock',
            updated_at: 'Stock Checked',
          },
          recommendedVisibleColumns: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Vehicle Owners & Job Cards',
          addRecordTitle: 'Create Vehicle Job Card',
          editRecordTitle: 'Edit Job Card',
          columnDisplayNames: {
            customer_id: 'Job Card ID',
            name: 'Vehicle Owner Name',
            phone: 'Mobile / WhatsApp',
            email: 'Email',
            address: 'Vehicle Make, Model & Plate #',
            gstin: 'Odometer (km) / Chassis #',
          },
          recommendedVisibleColumns: ['customer_id', 'name', 'address', 'gstin', 'phone'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Auto Spares Wholesalers',
          addRecordTitle: 'Onboard Parts Wholesaler',
          editRecordTitle: 'Edit Supplier Details',
          columnDisplayNames: {
            supplier_id: 'Distributor ID',
            name: 'Auto Spares Wholesaler',
            phone: 'Phone',
            email: 'Email',
            address: 'Parts Category',
            gstin: 'Vendor GSTIN',
            notes: 'Terms',
          },
          recommendedVisibleColumns: ['supplier_id', 'name', 'address', 'phone', 'gstin', 'notes'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Repair Invoices Ledger',
          addRecordTitle: 'Issue Repair Bill',
          editRecordTitle: 'Edit Repair Invoice',
          columnDisplayNames: {
            sale_id: 'Invoice #',
            customer_id: 'Vehicle Owner',
            sale_date: 'Invoice Date',
            subtotal: 'Parts & Labor Subtotal',
            discount: 'Service Discount',
            tax: 'GST (18%)',
            total: 'Total Job Invoice',
            payment_method: 'Payment Mode',
            status: 'Status',
          },
          recommendedVisibleColumns: ['sale_id', 'customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      if (sheetName === '_Expenses') {
        return {
          sheetDisplayName: 'Workshop Operating Expenses',
          addRecordTitle: 'Record Workshop Expense',
          editRecordTitle: 'Edit Expense Entry',
          columnDisplayNames: {
            expense_id: 'Expense ID',
            date: 'Date',
            category: 'Category',
            description: 'Description',
            amount: 'Amount',
            gst: 'GST',
            payment_method: 'Payment Channel',
            notes: 'Job Reference',
          },
          recommendedVisibleColumns: ['date', 'category', 'description', 'amount', 'payment_method'],
        };
      }
      if (sheetName === '_Categories') {
        return {
          sheetDisplayName: 'Repair Categories',
          addRecordTitle: 'Add Repair Category',
          editRecordTitle: 'Edit Category',
          columnDisplayNames: {
            category_id: 'Category ID',
            name: 'Repair Category Name',
            description: 'Scope of Work',
            status: 'Status',
          },
          recommendedVisibleColumns: ['category_id', 'name', 'description', 'status'],
        };
      }
      break;

    case 'salon':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Treatments & Cosmetics Catalog',
          addRecordTitle: 'Add Treatment / Product',
          editRecordTitle: 'Edit Salon Service',
          columnDisplayNames: {
            product_id: 'Service / Product ID',
            sku: 'Treatment Code',
            name: 'Service / Treatment Name',
            category_id: 'Beauty Category',
            purchase_price: 'Product Consumable Cost',
            selling_price: 'Service Price / MRP',
            gst_rate: 'Salon GST %',
            unit: 'Session Unit',
            minimum_stock: 'Target Daily Sessions',
            status: 'Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'category_id', 'selling_price', 'minimum_stock', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Cosmetics & Consumable Stock',
          addRecordTitle: 'Stock Cosmetics / Serums',
          editRecordTitle: 'Edit Consumables Stock',
          columnDisplayNames: {
            inventory_id: 'Shelf Bin ID',
            product_id: 'Product ID',
            quantity: 'Kits / Units in Stock',
            minimum_stock: 'Reorder Level',
            updated_at: 'Last Audited',
          },
          recommendedVisibleColumns: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Salon Clients Directory',
          addRecordTitle: 'Register Salon Client',
          editRecordTitle: 'Edit Client Profile',
          columnDisplayNames: {
            customer_id: 'Client ID',
            name: 'Client Name',
            phone: 'Mobile / WhatsApp',
            email: 'Email',
            address: 'Preferred Stylist & Timing',
            gstin: 'Skin / Hair Allergy Notes',
          },
          recommendedVisibleColumns: ['customer_id', 'name', 'address', 'phone', 'gstin'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Cosmetics Brands & Distributors',
          addRecordTitle: 'Onboard Beauty Brand',
          editRecordTitle: 'Edit Supplier Profile',
          columnDisplayNames: {
            supplier_id: 'Vendor ID',
            name: 'Cosmetics & Salon Brand Supplier',
            phone: 'Phone',
            email: 'Email',
            address: 'Product Category',
            gstin: 'Vendor GSTIN',
            notes: 'Brand Authorization',
          },
          recommendedVisibleColumns: ['supplier_id', 'name', 'address', 'phone', 'gstin', 'notes'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Appointment Invoices',
          addRecordTitle: 'Bill Appointment Session',
          editRecordTitle: 'Edit Appointment Bill',
          columnDisplayNames: {
            sale_id: 'Appointment Bill #',
            customer_id: 'Client Name',
            sale_date: 'Appointment Date',
            subtotal: 'Services Subtotal',
            discount: 'Membership Discount',
            tax: 'GST (18%)',
            total: 'Total Bill Paid',
            payment_method: 'Mode',
            status: 'Status',
          },
          recommendedVisibleColumns: ['sale_id', 'customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      if (sheetName === '_Expenses') {
        return {
          sheetDisplayName: 'Salon Operating Expenses',
          addRecordTitle: 'Record Salon Expense',
          editRecordTitle: 'Edit Expense Entry',
          columnDisplayNames: {
            expense_id: 'Expense ID',
            date: 'Date',
            category: 'Category',
            description: 'Description',
            amount: 'Amount',
            gst: 'Tax',
            payment_method: 'Mode',
            notes: 'Notes',
          },
          recommendedVisibleColumns: ['date', 'category', 'description', 'amount', 'payment_method'],
        };
      }
      if (sheetName === '_Categories') {
        return {
          sheetDisplayName: 'Salon Service Categories',
          addRecordTitle: 'Add Service Category',
          editRecordTitle: 'Edit Category',
          columnDisplayNames: {
            category_id: 'Category ID',
            name: 'Salon Section / Category',
            description: 'Treatments & Rituals Included',
            status: 'Status',
          },
          recommendedVisibleColumns: ['category_id', 'name', 'description', 'status'],
        };
      }
      break;

    case 'coaching':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Courses & Batches',
          addRecordTitle: 'Add Course / Batch',
          editRecordTitle: 'Edit Course Slabs',
          columnDisplayNames: {
            product_id: 'Course Code',
            sku: 'Batch Code',
            name: 'Course & Target Exam',
            category_id: 'Program Track',
            purchase_price: 'Faculty & Material Cost',
            selling_price: 'Full Tuition Fee',
            gst_rate: 'GST %',
            unit: 'Unit',
            minimum_stock: 'Batch Capacity',
            status: 'Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'category_id', 'selling_price', 'minimum_stock', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Study Material Kits & Test Series',
          addRecordTitle: 'Stock Study Material Kits',
          editRecordTitle: 'Edit Kit Stock',
          columnDisplayNames: {
            inventory_id: 'Kit ID',
            product_id: 'Course Association',
            quantity: 'Study Material Kits in Stock',
            minimum_stock: 'Reorder Level',
            updated_at: 'Last Count',
          },
          recommendedVisibleColumns: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Enrolled Students Roster',
          addRecordTitle: 'Enroll New Student',
          editRecordTitle: 'Edit Student Details',
          columnDisplayNames: {
            customer_id: 'Student ID',
            name: 'Student Full Name',
            phone: 'Parent Mobile #',
            email: 'Parent Email',
            address: 'Target Exam & Enrolled Batch',
            gstin: 'Roll No / Scholarship %',
          },
          recommendedVisibleColumns: ['customer_id', 'name', 'address', 'gstin', 'phone', 'email'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Faculty & Subject Mentors',
          addRecordTitle: 'Onboard Faculty Instructor',
          editRecordTitle: 'Edit Instructor Profile',
          columnDisplayNames: {
            supplier_id: 'Faculty ID',
            name: 'Instructor Full Name',
            phone: 'Mobile',
            email: 'Email',
            address: 'Subject Specialization',
            gstin: 'Qualifications',
            notes: 'Lecture Rate / Monthly Payout',
          },
          recommendedVisibleColumns: ['supplier_id', 'name', 'address', 'phone', 'notes'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Installment Fees Ledger',
          addRecordTitle: 'Collect Fee Installment',
          editRecordTitle: 'Edit Installment Receipt',
          columnDisplayNames: {
            sale_id: 'Receipt #',
            customer_id: 'Student Name',
            sale_date: 'Receipt Date',
            subtotal: 'Tuition Installment',
            discount: 'Scholarship Concession',
            tax: 'GST (18%)',
            total: 'Total Fee Paid',
            payment_method: 'Payment Channel',
            status: 'Installment Status',
          },
          recommendedVisibleColumns: ['sale_id', 'customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      if (sheetName === '_Expenses') {
        return {
          sheetDisplayName: 'Center & Faculty Expenses',
          addRecordTitle: 'Record Coaching Expense',
          editRecordTitle: 'Edit Center Expense',
          columnDisplayNames: {
            expense_id: 'Expense ID',
            date: 'Date',
            category: 'Category',
            description: 'Description',
            amount: 'Amount',
            gst: 'Tax',
            payment_method: 'Payment Mode',
            notes: 'Batch Reference',
          },
          recommendedVisibleColumns: ['date', 'category', 'description', 'amount', 'payment_method'],
        };
      }
      if (sheetName === '_Categories') {
        return {
          sheetDisplayName: 'Exam Program Tracks',
          addRecordTitle: 'Add Exam Track',
          editRecordTitle: 'Edit Track Details',
          columnDisplayNames: {
            category_id: 'Category ID',
            name: 'Program Track Name',
            description: 'Curriculum & Exam Target',
            status: 'Status',
          },
          recommendedVisibleColumns: ['category_id', 'name', 'description', 'status'],
        };
      }
      break;

    case 'payroll':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Salary Bands & Pay Structures',
          addRecordTitle: 'Add Salary Band / Component',
          editRecordTitle: 'Edit Salary Structure',
          columnDisplayNames: {
            product_id: 'Component Code',
            sku: 'Salary Code',
            name: 'Component Name',
            category_id: 'Component Type',
            purchase_price: 'Employer Match',
            selling_price: 'Standard Component Base',
            gst_rate: 'Statutory Rate %',
            unit: 'Frequency',
            minimum_stock: 'Eligible Grade',
            status: 'Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'category_id', 'selling_price', 'unit', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Staff Allowances & Asset Pool',
          addRecordTitle: 'Register Department Pool / Asset',
          editRecordTitle: 'Edit Department Pool',
          columnDisplayNames: {
            inventory_id: 'Dept Pool ID',
            product_id: 'Head Component',
            quantity: 'Department Headcount',
            minimum_stock: 'Minimum Staff',
            updated_at: 'Audit Date',
          },
          recommendedVisibleColumns: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Employees Roster',
          addRecordTitle: 'Add Employee Profile',
          editRecordTitle: 'Edit Employee Details',
          columnDisplayNames: {
            customer_id: 'Employee ID',
            name: 'Employee Full Name',
            phone: 'Contact Phone',
            email: 'Official Work Email',
            address: 'Designation & Department',
            gstin: 'PAN / Bank Account / UAN',
          },
          recommendedVisibleColumns: ['customer_id', 'name', 'address', 'gstin', 'email', 'phone'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'HR Contractors & Auditors',
          addRecordTitle: 'Add Payroll Consultant / Vendor',
          editRecordTitle: 'Edit HR Vendor Profile',
          columnDisplayNames: {
            supplier_id: 'Vendor ID',
            name: 'Staffing Agency / Consultant',
            phone: 'Contact Phone',
            email: 'Email',
            address: 'Service Domain',
            gstin: 'GSTIN / PAN',
            notes: 'Contract Terms',
          },
          recommendedVisibleColumns: ['supplier_id', 'name', 'address', 'phone', 'notes'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Monthly Payslips Ledger',
          addRecordTitle: 'Run Monthly Payroll / Payslip',
          editRecordTitle: 'Edit Payslip Disbursal',
          columnDisplayNames: {
            sale_id: 'Payslip #',
            customer_id: 'Employee Name',
            sale_date: 'Pay Month Date',
            subtotal: 'Gross Salary Earnings',
            discount: 'Statutory Deductions (PF/TDS)',
            tax: 'Professional Tax',
            total: 'Net Salary Disbursed',
            payment_method: 'Bank Transfer Channel',
            status: 'Disbursal Status',
          },
          recommendedVisibleColumns: ['sale_id', 'customer_id', 'sale_date', 'subtotal', 'total', 'status'],
        };
      }
      if (sheetName === '_Expenses') {
        return {
          sheetDisplayName: 'Staff Welfare & Statutory Expenses',
          addRecordTitle: 'Record Corporate HR Expense',
          editRecordTitle: 'Edit Expense Record',
          columnDisplayNames: {
            expense_id: 'Expense ID',
            date: 'Date',
            category: 'Statutory Category',
            description: 'Description',
            amount: 'Amount',
            gst: 'Tax',
            payment_method: 'Remittance Mode',
            notes: 'Challan / Ref #',
          },
          recommendedVisibleColumns: ['date', 'category', 'description', 'amount', 'payment_method'],
        };
      }
      if (sheetName === '_Categories') {
        return {
          sheetDisplayName: 'Payroll Classifications',
          addRecordTitle: 'Add Payroll Classification',
          editRecordTitle: 'Edit Classification',
          columnDisplayNames: {
            category_id: 'Category ID',
            name: 'Pay Component Type',
            description: 'Taxability & Statutory Rules',
            status: 'Status',
          },
          recommendedVisibleColumns: ['category_id', 'name', 'description', 'status'],
        };
      }
      break;

    case 'realestate':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Rental Units & Tariffs',
          addRecordTitle: 'Add Rental Unit Type',
          editRecordTitle: 'Edit Property Details',
          columnDisplayNames: {
            product_id: 'Unit Type ID',
            sku: 'Plan Code',
            name: 'Property / Unit Classification',
            category_id: 'Sector / Wing',
            purchase_price: 'Society Maintenance Share',
            selling_price: 'Standard Monthly Rent',
            gst_rate: 'Commercial GST %',
            unit: 'Billing Cycle',
            minimum_stock: 'Target Units',
            status: 'Availability',
          },
          recommendedVisibleColumns: ['sku', 'name', 'category_id', 'selling_price', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Flats, Shops & Units Registry',
          addRecordTitle: 'Register Flat / Unit',
          editRecordTitle: 'Edit Unit Status',
          columnDisplayNames: {
            inventory_id: 'Flat / Unit No',
            product_id: 'Unit Type ID',
            quantity: 'Total Units in Inventory',
            minimum_stock: 'Vacant Units Threshold',
            updated_at: 'Last Inspection Date',
          },
          recommendedVisibleColumns: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Tenants & Lease Agreements',
          addRecordTitle: 'Enroll New Tenant',
          editRecordTitle: 'Edit Lease Agreement',
          columnDisplayNames: {
            customer_id: 'Tenant ID',
            name: 'Tenant Full Name',
            phone: 'Contact Mobile #',
            email: 'Email',
            address: 'Leased Unit Address',
            gstin: 'Agreement / Aadhaar / GSTIN',
          },
          recommendedVisibleColumns: ['customer_id', 'name', 'address', 'phone', 'gstin'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Property Maintenance Technicians',
          addRecordTitle: 'Onboard Maintenance Vendor',
          editRecordTitle: 'Edit Contractor Details',
          columnDisplayNames: {
            supplier_id: 'Contractor ID',
            name: 'Maintenance Agency / Technician',
            phone: 'Phone',
            email: 'Email',
            address: 'Trade Domain',
            gstin: 'GSTIN / Trade License',
            notes: 'Contract SLA',
          },
          recommendedVisibleColumns: ['supplier_id', 'name', 'address', 'phone', 'notes'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Rent Collections Ledger',
          addRecordTitle: 'Record Rent Receipt',
          editRecordTitle: 'Edit Rent Receipt',
          columnDisplayNames: {
            sale_id: 'Receipt #',
            customer_id: 'Tenant Name',
            sale_date: 'Rent Month Date',
            subtotal: 'Base Rent Amount',
            discount: 'Concession',
            tax: 'GST (18% if Commercial)',
            total: 'Total Rent Collected',
            payment_method: 'Payment Channel',
            status: 'Status',
          },
          recommendedVisibleColumns: ['sale_id', 'customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      if (sheetName === '_Expenses') {
        return {
          sheetDisplayName: 'Property Upkeep & Municipal Taxes',
          addRecordTitle: 'Log Property Expense',
          editRecordTitle: 'Edit Property Expense',
          columnDisplayNames: {
            expense_id: 'Expense ID',
            date: 'Date',
            category: 'Category',
            description: 'Description',
            amount: 'Amount',
            gst: 'GST',
            payment_method: 'Payment Channel',
            notes: 'Property Reference',
          },
          recommendedVisibleColumns: ['date', 'category', 'description', 'amount', 'payment_method'],
        };
      }
      if (sheetName === '_Categories') {
        return {
          sheetDisplayName: 'Property Sectors & Towers',
          addRecordTitle: 'Add Sector / Tower',
          editRecordTitle: 'Edit Sector',
          columnDisplayNames: {
            category_id: 'Category ID',
            name: 'Property Sector / Tower Name',
            description: 'Building Scope & Specifications',
            status: 'Status',
          },
          recommendedVisibleColumns: ['category_id', 'name', 'description', 'status'],
        };
      }
      break;

    case 'pharmacy':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Medicines & Generic Formulations',
          addRecordTitle: 'Add Medicine / Drug',
          editRecordTitle: 'Edit Drug Information',
          columnDisplayNames: {
            product_id: 'Drug Code',
            sku: 'Barcode / Item Code',
            name: 'Medicine Name & Salt Formulation',
            category_id: 'Therapeutic Category',
            purchase_price: 'Purchase Rate',
            selling_price: 'MRP / Strip Price',
            gst_rate: 'Pharma GST %',
            unit: 'Pack Unit',
            minimum_stock: 'Minimum Reorder Strips',
            status: 'Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'category_id', 'selling_price', 'minimum_stock', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Batch Lots & Expiry Tracker',
          addRecordTitle: 'Receive Drug Batch',
          editRecordTitle: 'Edit Batch / Expiry Info',
          columnDisplayNames: {
            inventory_id: 'Batch # / Rack Shelf',
            product_id: 'Drug Code',
            quantity: 'Strips / Units in Stock',
            minimum_stock: 'Buffer Stock',
            updated_at: 'Expiry Audit Date',
          },
          recommendedVisibleColumns: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Patients & Regular Prescriptions',
          addRecordTitle: 'Register Patient / Customer',
          editRecordTitle: 'Edit Patient Details',
          columnDisplayNames: {
            customer_id: 'Patient ID',
            name: 'Patient Full Name',
            phone: 'Contact Phone',
            email: 'Email',
            address: 'Doctor Clinic Reference & Notes',
            gstin: 'Chronic Condition Tag',
          },
          recommendedVisibleColumns: ['customer_id', 'name', 'phone', 'address', 'gstin'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Licensed Pharma Distributors',
          addRecordTitle: 'Onboard Pharma Stockist',
          editRecordTitle: 'Edit Stockist Profile',
          columnDisplayNames: {
            supplier_id: 'Stockist ID',
            name: 'Pharma Distribution Agency',
            phone: 'Phone',
            email: 'Email',
            address: 'Drug Supply Category',
            gstin: 'Drug License 20B/21B & GSTIN',
            notes: 'Credit Terms',
          },
          recommendedVisibleColumns: ['supplier_id', 'name', 'address', 'phone', 'gstin', 'notes'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Rx Dispensing Bills',
          addRecordTitle: 'Dispense Prescription Bill',
          editRecordTitle: 'Edit Pharmacy Invoice',
          columnDisplayNames: {
            sale_id: 'Bill #',
            customer_id: 'Patient Name',
            sale_date: 'Dispensed Date',
            subtotal: 'Medicines Subtotal',
            discount: 'Patient Discount',
            tax: 'Pharma GST',
            total: 'Total Net Bill',
            payment_method: 'Payment Mode',
            status: 'Dispense Status',
          },
          recommendedVisibleColumns: ['sale_id', 'customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      if (sheetName === '_Expenses') {
        return {
          sheetDisplayName: 'Pharmacy Cold-Chain & License Overheads',
          addRecordTitle: 'Record Pharmacy Expense',
          editRecordTitle: 'Edit Expense',
          columnDisplayNames: {
            expense_id: 'Expense ID',
            date: 'Date',
            category: 'Operating Category',
            description: 'Description',
            amount: 'Amount',
            gst: 'GST',
            payment_method: 'Payment Channel',
            notes: 'Reference #',
          },
          recommendedVisibleColumns: ['date', 'category', 'description', 'amount', 'payment_method'],
        };
      }
      if (sheetName === '_Categories') {
        return {
          sheetDisplayName: 'Therapeutic Classes',
          addRecordTitle: 'Add Therapeutic Category',
          editRecordTitle: 'Edit Category',
          columnDisplayNames: {
            category_id: 'Category ID',
            name: 'Therapeutic Class Name',
            description: 'Medical Indication & Formulations',
            status: 'Status',
          },
          recommendedVisibleColumns: ['category_id', 'name', 'description', 'status'],
        };
      }
      break;

    case 'wholesale':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Bulk Packs & Master Cartons',
          addRecordTitle: 'Add Master Carton SKU',
          editRecordTitle: 'Edit Wholesale Product',
          columnDisplayNames: {
            product_id: 'Product ID',
            sku: 'Case SKU / Barcode',
            name: 'Wholesale Product / Pack',
            category_id: 'Product Category',
            purchase_price: 'Factory Purchase Cost',
            selling_price: 'Dealer Wholesale Price',
            gst_rate: 'GST %',
            unit: 'Packaging Unit',
            minimum_stock: 'Warehouse Reorder',
            status: 'Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'category_id', 'selling_price', 'minimum_stock', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Warehouse Pallet Bins',
          addRecordTitle: 'Receive Pallet Lot',
          editRecordTitle: 'Edit Warehouse Inventory',
          columnDisplayNames: {
            inventory_id: 'Bin Location',
            product_id: 'Product ID',
            quantity: 'Cartons in Warehouse',
            minimum_stock: 'Buffer Stock',
            updated_at: 'Stock Audit Date',
          },
          recommendedVisibleColumns: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'B2B Dealers & Retail Accounts',
          addRecordTitle: 'Onboard Dealer Enterprise',
          editRecordTitle: 'Edit Dealer Account',
          columnDisplayNames: {
            customer_id: 'Dealer ID',
            name: 'Dealer / Retailer Enterprise',
            phone: 'Contact Phone',
            email: 'Billing Email',
            address: 'Delivery Warehouse Address',
            gstin: 'GSTIN Number',
          },
          recommendedVisibleColumns: ['customer_id', 'name', 'address', 'gstin', 'phone'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Manufacturing Mills & Importers',
          addRecordTitle: 'Add Primary Mill / Importer',
          editRecordTitle: 'Edit Mill Profile',
          columnDisplayNames: {
            supplier_id: 'Mill ID',
            name: 'Manufacturing Mill / Importer',
            phone: 'Phone',
            email: 'Email',
            address: 'Plant Address',
            gstin: 'Factory GSTIN',
            notes: 'Credit Terms',
          },
          recommendedVisibleColumns: ['supplier_id', 'name', 'address', 'phone', 'gstin', 'notes'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'B2B Tax Invoices & Dispatch Slips',
          addRecordTitle: 'Issue Wholesale Invoice',
          editRecordTitle: 'Edit B2B Invoice',
          columnDisplayNames: {
            sale_id: 'Invoice No',
            customer_id: 'Dealer Name',
            sale_date: 'Invoice Date',
            subtotal: 'Taxable Amount',
            discount: 'Trade Discount',
            tax: 'GST',
            total: 'Total Invoice Amount',
            payment_method: 'Payment Terms',
            status: 'Dispatch Status',
          },
          recommendedVisibleColumns: ['sale_id', 'customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      if (sheetName === '_Expenses') {
        return {
          sheetDisplayName: 'Warehouse Leases & Freight Expenses',
          addRecordTitle: 'Record Logistics Expense',
          editRecordTitle: 'Edit Logistics Expense',
          columnDisplayNames: {
            expense_id: 'Expense ID',
            date: 'Date',
            category: 'Category',
            description: 'Description',
            amount: 'Amount',
            gst: 'Tax',
            payment_method: 'Mode',
            notes: 'Transporter LR #',
          },
          recommendedVisibleColumns: ['date', 'category', 'description', 'amount', 'payment_method'],
        };
      }
      if (sheetName === '_Categories') {
        return {
          sheetDisplayName: 'Commodity Categories',
          addRecordTitle: 'Add Commodity Category',
          editRecordTitle: 'Edit Category',
          columnDisplayNames: {
            category_id: 'Category ID',
            name: 'Commodity Category Name',
            description: 'Product Class & Packaging',
            status: 'Status',
          },
          recommendedVisibleColumns: ['category_id', 'name', 'description', 'status'],
        };
      }
      break;

    case 'services':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Billable Services & Retainers',
          addRecordTitle: 'Add Billable Service',
          editRecordTitle: 'Edit Service Scope & Rate',
          columnDisplayNames: {
            product_id: 'Service ID',
            sku: 'Service Code',
            name: 'Service / Scope of Work',
            category_id: 'Service Practice',
            purchase_price: 'Contractor Cost',
            selling_price: 'Standard Hourly / Milestone Rate',
            gst_rate: 'Service GST %',
            unit: 'Billing Unit',
            minimum_stock: 'Target Hours',
            status: 'Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'category_id', 'selling_price', 'unit', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Deliverables Pool & Hours Capacity',
          addRecordTitle: 'Log Deliverable / Milestone',
          editRecordTitle: 'Edit Deliverable Status',
          columnDisplayNames: {
            inventory_id: 'Deliverable ID',
            product_id: 'Service ID',
            quantity: 'Available Hours / Milestones',
            minimum_stock: 'Committed Minimum',
            updated_at: 'Last Logged',
          },
          recommendedVisibleColumns: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Corporate Client Accounts',
          addRecordTitle: 'Onboard Corporate Client',
          editRecordTitle: 'Edit Client Account',
          columnDisplayNames: {
            customer_id: 'Client ID',
            name: 'Client Company Name',
            phone: 'Contact Phone',
            email: 'Accounts Email',
            address: 'Headquarters Address',
            gstin: 'Client GSTIN',
          },
          recommendedVisibleColumns: ['customer_id', 'name', 'address', 'gstin', 'email', 'phone'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Specialist Contractors & Freelancers',
          addRecordTitle: 'Onboard Subcontractor',
          editRecordTitle: 'Edit Contractor Details',
          columnDisplayNames: {
            supplier_id: 'Partner ID',
            name: 'Subcontractor / Specialist',
            phone: 'Phone',
            email: 'Email',
            address: 'Specialty Domain',
            gstin: 'PAN / GSTIN',
            notes: 'Payout Terms',
          },
          recommendedVisibleColumns: ['supplier_id', 'name', 'address', 'phone', 'notes'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Professional Tax Invoices',
          addRecordTitle: 'Issue Client Invoice',
          editRecordTitle: 'Edit Professional Invoice',
          columnDisplayNames: {
            sale_id: 'Invoice No',
            customer_id: 'Client Name',
            sale_date: 'Invoice Date',
            subtotal: 'Services Subtotal',
            discount: 'Client Discount',
            tax: 'GST (18%)',
            total: 'Total Invoice Due',
            payment_method: 'Payment Terms',
            status: 'Invoice Status',
          },
          recommendedVisibleColumns: ['sale_id', 'customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      if (sheetName === '_Expenses') {
        return {
          sheetDisplayName: 'Cloud SaaS & Practice Expenses',
          addRecordTitle: 'Log Practice Expense',
          editRecordTitle: 'Edit Practice Expense',
          columnDisplayNames: {
            expense_id: 'Expense ID',
            date: 'Date',
            category: 'Category',
            description: 'Description',
            amount: 'Amount',
            gst: 'GST',
            payment_method: 'Mode',
            notes: 'Client Billing Tag',
          },
          recommendedVisibleColumns: ['date', 'category', 'description', 'amount', 'payment_method'],
        };
      }
      if (sheetName === '_Categories') {
        return {
          sheetDisplayName: 'Consulting Practice Groups',
          addRecordTitle: 'Add Practice Group',
          editRecordTitle: 'Edit Practice Group',
          columnDisplayNames: {
            category_id: 'Category ID',
            name: 'Practice Group Name',
            description: 'Consulting Practice & Domain',
            status: 'Status',
          },
          recommendedVisibleColumns: ['category_id', 'name', 'description', 'status'],
        };
      }
      break;

    case 'manufacturing':
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Finished Goods (BOM Assemblies)',
          addRecordTitle: 'Add Finished Assembly / Product',
          editRecordTitle: 'Edit Assembly Details',
          columnDisplayNames: {
            product_id: 'Finished Good ID',
            sku: 'Assembly SKU / Part Code',
            name: 'Assembly / Finished Good Name',
            category_id: 'Production Line',
            purchase_price: 'Standard Production Cost',
            selling_price: 'Wholesale / Ex-Factory Price',
            gst_rate: 'GST %',
            unit: 'Batch Unit',
            minimum_stock: 'Buffer Stock Units',
            status: 'Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'category_id', 'selling_price', 'minimum_stock', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Raw Materials & Components Stock',
          addRecordTitle: 'Receive Raw Material Batch',
          editRecordTitle: 'Edit Component Stock',
          columnDisplayNames: {
            inventory_id: 'Material / Bin Code',
            product_id: 'Assembly Reference',
            quantity: 'Raw Units / Weight in Store',
            minimum_stock: 'Safety Reorder Threshold',
            updated_at: 'Last Physical Audit',
          },
          recommendedVisibleColumns: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Distributors & OEM Buyers',
          addRecordTitle: 'Onboard OEM / Distributor',
          editRecordTitle: 'Edit Buyer Account',
          columnDisplayNames: {
            customer_id: 'Buyer Code',
            name: 'Enterprise / Distributor Name',
            phone: 'Contact Phone',
            email: 'Official Procurement Email',
            address: 'Factory / Delivery Address',
            gstin: 'Corporate GSTIN',
          },
          recommendedVisibleColumns: ['customer_id', 'name', 'address', 'gstin', 'phone'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Component Mills & Fabricators',
          addRecordTitle: 'Onboard Material Vendor',
          editRecordTitle: 'Edit Fabricator Details',
          columnDisplayNames: {
            supplier_id: 'Vendor ID',
            name: 'Material Supplier / Fabricator',
            phone: 'Phone',
            email: 'Email',
            address: 'Material Category',
            gstin: 'Vendor GSTIN',
            notes: 'Delivery Lead Time & Payment Terms',
          },
          recommendedVisibleColumns: ['supplier_id', 'name', 'address', 'phone', 'gstin', 'notes'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Production Orders & Commercial Invoices',
          addRecordTitle: 'Issue Commercial Invoice',
          editRecordTitle: 'Edit Commercial Invoice',
          columnDisplayNames: {
            sale_id: 'Order / Invoice #',
            customer_id: 'Buyer Name',
            sale_date: 'Invoice Date',
            subtotal: 'Commercial Value',
            discount: 'Trade Discount',
            tax: 'Manufacturing GST',
            total: 'Total Invoice Value',
            payment_method: 'Payment Terms (LC/Net-30)',
            status: 'Dispatch Status',
          },
          recommendedVisibleColumns: ['sale_id', 'customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      if (sheetName === '_Expenses') {
        return {
          sheetDisplayName: 'Industrial Power, Tooling & Overheads',
          addRecordTitle: 'Record Factory Overhead',
          editRecordTitle: 'Edit Factory Expense',
          columnDisplayNames: {
            expense_id: 'Expense ID',
            date: 'Date',
            category: 'Operating Category',
            description: 'Description',
            amount: 'Amount',
            gst: 'Tax',
            payment_method: 'Mode',
            notes: 'Cost Center Tag',
          },
          recommendedVisibleColumns: ['date', 'category', 'description', 'amount', 'payment_method'],
        };
      }
      if (sheetName === '_Categories') {
        return {
          sheetDisplayName: 'Assembly Classifications',
          addRecordTitle: 'Add Production Line / Class',
          editRecordTitle: 'Edit Line Class',
          columnDisplayNames: {
            category_id: 'Category ID',
            name: 'Production Line / Class',
            description: 'Specifications & Standards',
            status: 'Status',
          },
          recommendedVisibleColumns: ['category_id', 'name', 'description', 'status'],
        };
      }
      break;

    case 'retail':
    default:
      if (sheetName === '_Products') {
        return {
          sheetDisplayName: 'Products & Inventory Catalog',
          addRecordTitle: 'Add New Product',
          editRecordTitle: 'Edit Product Details',
          columnDisplayNames: {
            product_id: 'Product ID',
            sku: 'SKU / Barcode',
            name: 'Item / Product Name',
            category_id: 'Category',
            purchase_price: 'Cost Price',
            selling_price: 'Selling Price / MRP',
            gst_rate: 'GST %',
            unit: 'Unit',
            minimum_stock: 'Min Alert Qty',
            status: 'Status',
          },
          recommendedVisibleColumns: ['sku', 'name', 'category_id', 'selling_price', 'minimum_stock', 'status'],
        };
      }
      if (sheetName === '_Inventory') {
        return {
          sheetDisplayName: 'Store Shelf & Warehouse Bins',
          addRecordTitle: 'Log Stock Inward / Bin',
          editRecordTitle: 'Edit Stock Level',
          columnDisplayNames: {
            inventory_id: 'Bin Shelf ID',
            product_id: 'Product ID',
            quantity: 'Quantity on Hand',
            minimum_stock: 'Reorder Level',
            updated_at: 'Last Stock Count Date',
          },
          recommendedVisibleColumns: ['inventory_id', 'product_id', 'quantity', 'minimum_stock', 'updated_at'],
        };
      }
      if (sheetName === '_Customers') {
        return {
          sheetDisplayName: 'Shoppers & Loyalty Directory',
          addRecordTitle: 'Add Customer Profile',
          editRecordTitle: 'Edit Customer Details',
          columnDisplayNames: {
            customer_id: 'Customer ID',
            name: 'Customer Full Name',
            phone: 'Contact Phone',
            email: 'Email Address',
            address: 'Delivery Address',
            gstin: 'GSTIN / Loyalty Number',
          },
          recommendedVisibleColumns: ['customer_id', 'name', 'phone', 'address', 'gstin'],
        };
      }
      if (sheetName === '_Suppliers') {
        return {
          sheetDisplayName: 'Merchandise Suppliers & Wholesalers',
          addRecordTitle: 'Onboard Supplier',
          editRecordTitle: 'Edit Supplier Profile',
          columnDisplayNames: {
            supplier_id: 'Supplier ID',
            name: 'Supplier Company Name',
            phone: 'Phone Number',
            email: 'Email',
            address: 'Office / Warehouse Address',
            gstin: 'Supplier GSTIN',
            notes: 'Payment Credit Days',
          },
          recommendedVisibleColumns: ['supplier_id', 'name', 'phone', 'address', 'gstin', 'notes'],
        };
      }
      if (sheetName === '_Sales') {
        return {
          sheetDisplayName: 'Point of Sale (POS) Receipts',
          addRecordTitle: 'Create POS Sale',
          editRecordTitle: 'Edit Sales Invoice',
          columnDisplayNames: {
            sale_id: 'Invoice #',
            customer_id: 'Customer Name',
            sale_date: 'Sale Date',
            subtotal: 'Taxable Subtotal',
            discount: 'Discount Concession',
            tax: 'GST Amount',
            total: 'Total Bill Amount',
            payment_method: 'Payment Mode',
            status: 'Status',
          },
          recommendedVisibleColumns: ['sale_id', 'customer_id', 'sale_date', 'total', 'payment_method', 'status'],
        };
      }
      if (sheetName === '_Expenses') {
        return {
          sheetDisplayName: 'Store Operating Expenses',
          addRecordTitle: 'Record Business Expense',
          editRecordTitle: 'Edit Expense Entry',
          columnDisplayNames: {
            expense_id: 'Expense ID',
            date: 'Date',
            category: 'Expense Category',
            description: 'Description',
            amount: 'Amount',
            gst: 'GST',
            payment_method: 'Payment Mode',
            notes: 'Notes / Invoice #',
          },
          recommendedVisibleColumns: ['date', 'category', 'description', 'amount', 'payment_method'],
        };
      }
      if (sheetName === '_Categories') {
        return {
          sheetDisplayName: 'Product Categories',
          addRecordTitle: 'Add Category',
          editRecordTitle: 'Edit Category',
          columnDisplayNames: {
            category_id: 'Category ID',
            name: 'Category Name',
            description: 'Aisle & Department Scope',
            status: 'Status',
          },
          recommendedVisibleColumns: ['category_id', 'name', 'description', 'status'],
        };
      }
      break;
  }

  // Universal fallback for custom / unmapped tables
  const defaultTitle = sheetName.replace('_', '');
  return {
    sheetDisplayName: defaultTitle,
    addRecordTitle: `Add New ${defaultTitle.slice(0, -1) || defaultTitle}`,
    editRecordTitle: `Edit ${defaultTitle} Record`,
    columnDisplayNames: {
      sku: 'SKU / Code',
      name: 'Item / Name',
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
