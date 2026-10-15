# Users and fulfillment API

Snapshot: 22 paths and 42 operations.

Coverage includes users, loans, requests, resource-sharing requests, fines and
fees, deposits, purchase requests, staff login reports, and Leganto
notifications.

## Cloud App cautions

- User data is sensitive. Minimize display, retention, logging, and release
  artifacts.
- User `PUT` operations may replace most of the record. Retrieve the current
  user and preserve fields not intentionally changed.
- Distinguish identifiers and do not expose internal IDs unnecessarily.
- Loan, request, fee, deposit, and purchase-request operations have different
  roles and workflow consequences.
- Action-style `POST` calls must be named and confirmed according to the actual
  operation.
- Treat fee changes, request cancellation, and user deletion as consequential.
- Handle authorization separately from user-not-found and identifier errors.
- Establish circulation-desk, library, fulfillment, user-management, and other
  role requirements per operation rather than assigning one generic role.

Use `../api-catalog.md` for the current source and checksum.
