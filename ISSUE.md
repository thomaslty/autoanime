clean up series table, focus on actual data that is using
- create a new table called series_metadata
- identify all columns that are not used
- move the not in used columns to series_metadata table
- remove the not in used columns from series table
- update sonarr sync to use the new table to save the metadata
