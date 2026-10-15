# Acquisitions API

Snapshot: 31 paths and 59 operations.

Coverage includes currencies, fiscal periods, funds and transactions, vendors,
purchase-order lines, invoices, licenses, and purchase requests.

## Cloud App cautions

- Financial and purchasing writes can have broad institutional consequences.
- Distinguish query, create, complete-replacement update, workflow action, and
  delete operations even when resources are closely related.
- Preserve fund, ledger, fiscal-period, library, vendor, and currency context.
- Treat invoice and purchase-order-line status transitions as business actions,
  not ordinary field edits.
- Check whether an operation can create transactions or trigger downstream
  processing.
- Confirm destructive or financially consequential actions explicitly.
- Establish the required acquisitions role for each operation independently.
- Validate list pagination and bounded processing for large institutional data.

Use `../api-catalog.md` for the current source and checksum.
