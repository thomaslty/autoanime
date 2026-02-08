# RSS Config enhancement

1. when adding / editing rss config, add a new setting
  - new setting: "offset"
  - this is for offsetting the episode number, some anime releases will continue with the episode number from the previous season, for example, S02E01 could also be E13 (assuming S01 has 12 episodes)
  - this offset is used to minus the episode number, so E13 - 12 = E1
    - let say offset = 12, then E13 - 12 = E1
  - add a question mark icon next to the offset setting, when hovered, it will show a tooltip explaining the offset setting
  - add "offset" column to rss_config table, default value is null (which means no offset, which is also means 0) 

2. linking of series_episode table and rss_item table
  - add "rss_item_id" column to series_episode table
  - this is to link the rss_item to the series_episode, if a match is found

3. in series detail page, add rss config preview button in the action dropdown (right after Configure Rss button)
  - this is to preview the matching rss item for the episode
  - show a table in a modal with the following columns:
    - season number
    - episode number
    - episode title
    - rss item title
    - rss item link
  - the table should be sortable, and also searchable
  - by default, it should be sorted by season number asc and episode number asc
    