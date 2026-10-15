# Analytics API

Snapshot: 5 paths and 5 operations covering reports, report paths, and test
operations.

## Cloud App cautions

- Analytics responses are XML-oriented. Do not assume JSON support.
- Report paths are configuration values, not user-facing labels.
- Follow operation-specific pagination or resumption-token behavior.
- Treat filters as report/query inputs and encode them through documented
  parameters.
- Large reports require bounded retrieval, progress feedback, and cancellation
  behavior.
- Distinguish an empty report from an invalid path, permission failure,
  timeout, or incomplete page sequence.
- Do not log report contents when they may contain user or institutional data.

Use `../api-catalog.md` for the current source and checksum.
