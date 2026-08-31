import { describe, it, expect } from 'vitest';
import { getAllBusinessTemplates, getBusinessTemplate } from '../src/lib/templates';
import { getBusinessTerminology } from '../src/lib/businessTerminology';
import { BusinessFlowType } from '../src/types';

describe('All 16 Business Templates Integrity & Schema Parity', () => {
  const templates = getAllBusinessTemplates();

  it('contains all 16 business templates', () => {
    expect(templates.length).toBe(16);
  });

  const expectedSheets = [
    '_Products',
    '_Inventory',
    '_Customers',
    '_Suppliers',
    '_Sales',
    '_SaleItems',
    '_Expenses',
    '_Categories',
  ];

  templates.forEach((tpl) => {
    describe(`Template: ${tpl.businessType} (${tpl.id})`, () => {
      it('has all 8 required business sheets', () => {
        const sheetNames = tpl.sheets.map((s) => s.name);
        expectedSheets.forEach((s) => {
          expect(sheetNames).toContain(s);
        });
      });

      it('has no duplicate column keys in any sheet', () => {
        tpl.sheets.forEach((sheet) => {
          const keys = sheet.columns.map((c) => c.key);
          const uniqueKeys = new Set(keys);
          expect(uniqueKeys.size).toBe(keys.length);
        });
      });

      it('has non-empty starter rows for every sheet', () => {
        tpl.sheets.forEach((sheet) => {
          expect(sheet.rows.length).toBeGreaterThan(0);
        });
      });

      it('has valid relationships with existing source and target sheets', () => {
        const sheetNames = tpl.sheets.map((s) => s.name);
        tpl.relationships.forEach((rel) => {
          expect(sheetNames).toContain(rel.sourceSheet);
          expect(sheetNames).toContain(rel.targetSheet);
        });
      });

      it('provides complete business terminology for all 8 sheets', () => {
        expectedSheets.forEach((sheetName) => {
          const meta = getBusinessTerminology(tpl.id as BusinessFlowType, sheetName);
          expect(meta).toBeDefined();
          expect(meta.sheetDisplayName).toBeTruthy();
          expect(meta.addRecordTitle).toBeTruthy();
          expect(meta.editRecordTitle).toBeTruthy();
          expect(meta.recommendedVisibleColumns.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
