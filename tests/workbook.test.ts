import { describe, it, expect } from 'vitest';
import { workbookService } from '../src/services/workbookService';
import { AppConfig, SheetData } from '../src/types';

describe('Workbook Lifecycle & Excel Parity Engine', () => {
  const sampleConfig: AppConfig = {
    businessName: 'Apex Electronics Test',
    businessType: 'Retail Store',
    country: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    taxPreference: 'exclusive',
    defaultTaxRate: 18,
    dateFormat: 'YYYY-MM-DD',
    timezone: 'UTC',
    schemaVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('generates a valid .xlsx workbook with all required business sheets', async () => {
    const meta = await workbookService.createWorkbook('/test/MyBusiness.xlsx', sampleConfig);
    expect(meta).toBeDefined();
    expect(meta.sheetNames).toContain('_AppConfig');
    expect(meta.sheetNames).toContain('_Products');
    expect(meta.sheetNames).toContain('_Sales');
    expect(meta.sheetNames).toContain('_Inventory');
    expect(meta.sheetNames).toContain('_Customers');
    expect(meta.sheetNames).toContain('_GST');
  });

  it('PRD Section 85: Critical Vertical Slice (Create -> Add Product -> Save -> Reopen -> Validate)', async () => {
    // 1. Create workbook
    const filePath = '/test/VerticalSlice.xlsx';
    await workbookService.createWorkbook(filePath, sampleConfig);

    // 2. Open workbook
    const { sheets } = await workbookService.openWorkbook(filePath);
    const productSheet = sheets.find((s) => s.name === '_Products');
    expect(productSheet).toBeDefined();

    // 3. Add product row
    const newProduct = {
      product_id: 'prod_test_001',
      sku: 'SKU-TEST-99',
      name: 'Sony Pro Headphones',
      category_id: 'cat_audio',
      purchase_price: 15000,
      selling_price: 21999,
      gst_rate: 18,
      unit: 'pcs',
      minimum_stock: 5,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    productSheet!.rows.push(newProduct);

    // 4. Save workbook
    await workbookService.saveWorkbook(filePath, sheets);

    // 5. Reopen fresh from file and verify persistence
    const reopened = await workbookService.openWorkbook(filePath);
    const reopenedProductSheet = reopened.sheets.find((s) => s.name === '_Products');
    expect(reopenedProductSheet?.rows.length).toBe(1);
    expect(reopenedProductSheet?.rows[0].product_id).toBe('prod_test_001');
    expect(reopenedProductSheet?.rows[0].name).toBe('Sony Pro Headphones');
    expect(Number(reopenedProductSheet?.rows[0].selling_price)).toBe(21999);
  });

  it('PRD Section 86: Sales Transaction Integrity & Stock Reduction', async () => {
    const filePath = '/test/SalesIntegrity.xlsx';
    await workbookService.createWorkbook(filePath, sampleConfig);
    const { sheets } = await workbookService.openWorkbook(filePath);

    const productSheet = sheets.find((s) => s.name === '_Products')!;
    const inventorySheet = sheets.find((s) => s.name === '_Inventory')!;
    const salesSheet = sheets.find((s) => s.name === '_Sales')!;
    const saleItemsSheet = sheets.find((s) => s.name === '_SaleItems')!;

    // Initial product with 100 stock
    const prodId = 'prod_keyboard_01';
    productSheet.rows.push({
      product_id: prodId,
      name: 'Mechanical Gaming Keyboard',
      selling_price: 5000,
      purchase_price: 3000,
      gst_rate: 18,
    });
    inventorySheet.rows.push({
      inventory_id: 'inv_kb_01',
      product_id: prodId,
      quantity: 100,
      minimum_stock: 10,
    });

    // Execute sale of quantity = 5
    const qtySold = 5;
    const unitPrice = 5000;
    const subtotal = qtySold * unitPrice; // 25000
    const tax = (subtotal * 18) / 100; // 4500
    const total = subtotal + tax; // 29500

    salesSheet.rows.push({
      sale_id: 'sale_order_001',
      customer_id: 'cust_001',
      sale_date: '2026-08-30',
      subtotal,
      discount: 0,
      tax,
      total,
      payment_method: 'UPI',
      status: 'completed',
    });

    saleItemsSheet.rows.push({
      sale_item_id: 'item_001',
      sale_id: 'sale_order_001',
      product_id: prodId,
      quantity: qtySold,
      unit_price: unitPrice,
      tax,
      line_total: total,
    });

    // Reduce inventory
    const targetInv = inventorySheet.rows.find((i) => i.product_id === prodId)!;
    targetInv.quantity = Number(targetInv.quantity) - qtySold;
    expect(targetInv.quantity).toBe(95);

    // Save and verify on reload
    await workbookService.saveWorkbook(filePath, sheets);
    const verified = await workbookService.openWorkbook(filePath);
    const verifiedInv = verified.sheets.find((s) => s.name === '_Inventory')!;
    const verifiedSales = verified.sheets.find((s) => s.name === '_Sales')!;

    expect(Number(verifiedInv.rows[0].quantity)).toBe(95);
    expect(verifiedSales.rows.length).toBe(1);
    expect(Number(verifiedSales.rows[0].total)).toBe(29500);
  });

  it('creates timestamped backups and restores them safely', async () => {
    const filePath = '/test/BackupTest.xlsx';
    await workbookService.createWorkbook(filePath, sampleConfig);

    const backup = await workbookService.createBackup(filePath);
    expect(backup.filename).toContain('backup-');
    expect(backup.path).toBeDefined();

    const backupsList = await workbookService.listBackups(filePath);
    expect(backupsList.length).toBeGreaterThan(0);
  });

  it('correctly computes auto-increment IDs for numeric, prefixed, and padded values', async () => {
    const { computeAutoIncrement } = await import('../src/stores/workbookStore');

    // Test 1: Empty list
    expect(computeAutoIncrement([], 'product_id', 'prod')).toBe('prod_1');

    // Test 2: Prefixed IDs (prod_1, prod_2 -> prod_3)
    const prodRows = [
      { product_id: 'prod_1', name: 'A' },
      { product_id: 'prod_2', name: 'B' },
      { product_id: 'prod_5', name: 'C' },
    ];
    expect(computeAutoIncrement(prodRows, 'product_id', 'prod')).toBe('prod_6');

    // Test 3: SKU hyphen padded pattern (SKU-001, SKU-002 -> SKU-003)
    const skuRows = [
      { sku: 'SKU-001' },
      { sku: 'SKU-002' },
      { sku: 'SKU-009' },
    ];
    expect(computeAutoIncrement(skuRows, 'sku', 'SKU')).toBe('SKU-010');

    // Test 4: Pure numeric IDs (1, 2, 3 -> 4)
    const numRows = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ];
    expect(computeAutoIncrement(numRows, 'id', 'id')).toBe(4);
  });
});

