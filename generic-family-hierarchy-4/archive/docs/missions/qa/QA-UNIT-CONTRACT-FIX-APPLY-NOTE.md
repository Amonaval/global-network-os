# QA unit contract fix

Fixes three local qa:unit failures:
- Organization relationship `to_id` now declares multi-sheet references to People / Teams / Projects.
- Import parser validates reference values across declared `referenceSheets` while preserving single `referenceSheet` support.
- Guided workbook Column Guide renders multi-sheet targets.
- QA workbook serialization accepts both ArrayBuffer and Uint8Array returned by SheetJS/XLSX in Node.

Apply over the latest POC v7 tree, then run:

    npm run qa:unit

No Supabase/network calls are made by this unit command.
