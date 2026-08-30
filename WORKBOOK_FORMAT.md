# Exdrow Workbook Format Specification

## File Structure

Every business managed by Exdrow is saved as a standard OpenXML Spreadsheet (`.xlsx`).
The file can be directly opened, viewed, and modified in Microsoft Excel, Apple Numbers, LibreOffice Calc, or Google Sheets.

## Default Sheet Schemas

### 1. `_AppConfig`
Key-value configuration store for the business:
- `business_name`: Text
- `business_type`: Text
- `country`: Text
- `currency`: 3-letter currency code (e.g. `INR`, `USD`, `EUR`)
- `currency_symbol`: Symbol (e.g. `₹`, `$`, `€`)
- `tax_preference`: `exclusive` | `inclusive`
- `default_tax_rate`: Number (e.g. 18)
- `date_format`: `YYYY-MM-DD`
- `timezone`: Text
- `schema_version`: Semantic version string

### 2. `_Products`
- `product_id`: Stable UUID string
- `sku`: Stock Keeping Unit text
- `name`: Product display name
- `category_id`: Foreign key reference to `_Categories.category_id`
- `purchase_price`: Decimal cost
- `selling_price`: Decimal retail price
- `gst_rate`: Percent tax slab
- `unit`: Unit of measurement (e.g. `pcs`, `box`, `kg`)
- `minimum_stock`: Threshold for low stock warnings
- `status`: `active` | `archived`
- `created_at`: ISO timestamp
- `updated_at`: ISO timestamp

### 3. `_Inventory`
- `inventory_id`: Stable UUID string
- `product_id`: Foreign key reference to `_Products.product_id`
- `quantity`: Current physical count in stock
- `minimum_stock`: Minimum reorder threshold
- `updated_at`: ISO timestamp

### 4. `_Sales`
- `sale_id`: Unique order identifier
- `customer_id`: Foreign key reference to `_Customers.customer_id`
- `sale_date`: Date string (`YYYY-MM-DD`)
- `subtotal`: Pre-tax and pre-discount amount
- `discount`: Total discount applied
- `tax`: Total calculated GST/tax
- `total`: Grand total collected
- `payment_method`: `Cash` | `UPI` | `Credit Card` | `Net Banking`
- `status`: `completed` | `void`
- `created_at`: ISO timestamp

### 5. `_SaleItems`
- `sale_item_id`: Unique line item identifier
- `sale_id`: Foreign key reference to `_Sales.sale_id`
- `product_id`: Foreign key reference to `_Products.product_id`
- `quantity`: Number of units sold
- `unit_price`: Base selling price at time of sale
- `discount`: Line level discount
- `tax`: Line level tax amount
- `line_total`: Grand line total

### 6. `_StockMovements`
- `movement_id`: Unique movement identifier
- `product_id`: Foreign key reference to `_Products.product_id`
- `type`: `IN` | `OUT` | `SALE` | `ADJUSTMENT`
- `quantity`: Signed integer (+ for stock in, - for sales/write-offs)
- `reference_id`: Associated sale ID or transaction note
- `notes`: Audit explanation
- `created_at`: ISO timestamp

### 7. `_Customers`
- `customer_id`: Unique customer identifier
- `name`: Full name / company name
- `phone`: Contact phone number
- `email`: Contact email address
- `address`: Street and city address
- `gstin`: Tax identification number
- `created_at`: ISO timestamp
- `updated_at`: ISO timestamp

### 8. `_Expenses`
- `expense_id`: Unique expense identifier
- `date`: Date of expense (`YYYY-MM-DD`)
- `category`: Classification
- `description`: Expense line explanation
- `amount`: Base amount
- `gst`: Applicable tax portion
- `payment_method`: Method of disbursement
- `notes`: Additional notes

### 9. `_GST`
- `gst_id`: Unique tax slab ID
- `name`: Display label (e.g. `GST 18%`)
- `rate`: Combined tax percentage
- `cgst_rate`: Central tax portion
- `sgst_rate`: State tax portion
- `igst_rate`: Integrated tax portion
- `status`: `active` | `inactive`
