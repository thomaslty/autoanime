const { pgTable, serial, text, varchar, boolean, timestamp, integer, jsonb, index, bigint, numeric, foreignKey } = require('drizzle-orm/pg-core');

const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: text('value'),
  isEncrypted: boolean('is_encrypted').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_settings_key').on(table.key),
]);

const sonarrSeries = pgTable('sonarr_series', {
  id: serial('id').primaryKey(),
  sonarrId: integer('sonarr_id').notNull().unique(),
  title: text('title').notNull(),
  titleSlug: varchar('title_slug'),
  overview: text('overview'),
  posterPath: varchar('poster_path'),
  bannerPath: varchar('banner_path'),
  fanartPath: varchar('fanart_path'),
  clearlogoPath: varchar('clearlogo_path'),
  year: integer('year'),
  ended: boolean('ended').default(false),
  genres: text('genres'),
  network: varchar('network'),
  runtime: integer('runtime'),
  certification: varchar('certification'),
  seriesType: varchar('series_type'),
  imdbId: varchar('imdb_id'),
  tmdbId: integer('tmdb_id'),
  tvdbId: integer('tvdb_id'),
  tvMazeId: integer('tv_maze_id'),
  airDay: varchar('air_day'),
  airTime: varchar('air_time'),
  firstAired: timestamp('first_aired'),
  lastAired: timestamp('last_aired'),
  nextAiring: timestamp('next_airing'),
  previousAiring: timestamp('previous_airing'),
  addedAt: timestamp('added_at'),
  showType: varchar('show_type'),
  status: varchar('status'),
  profileId: integer('profile_id'),
  languageProfileId: integer('language_profile_id'),
  seasonCount: integer('season_count'),
  episodeCount: integer('episode_count'),
  totalEpisodeCount: integer('total_episode_count'),
  episodeFileCount: integer('episode_file_count'),
  sizeOnDisk: bigint('size_on_disk', { mode: 'number' }),
  percentOfEpisodes: numeric('percent_of_episodes', { precision: 5, scale: 2 }),
  ratingValue: numeric('rating_value', { precision: 3, scale: 1 }),
  ratingVotes: integer('rating_votes'),
  monitored: boolean('monitored').default(true),
  isAutoDownloadEnabled: boolean('is_auto_download_enabled').default(false),
  downloadStatus: varchar('download_status'),
  lastSyncedAt: timestamp('last_synced_at').defaultNow(),
  rawData: jsonb('raw_data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_sonarr_series_title').on(table.title),
  index('idx_sonarr_series_status').on(table.status),
  index('idx_sonarr_series_last_synced').on(table.lastSyncedAt),
  index('idx_sonarr_series_imdb').on(table.imdbId),
  index('idx_sonarr_series_tmdb').on(table.tmdbId),
  index('idx_sonarr_series_tvdb').on(table.tvdbId),
]);

const rssSources = pgTable('rss_sources', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  url: varchar('url').notNull(),
  isEnabled: boolean('is_enabled').default(true),
  lastFetchedAt: timestamp('last_fetched_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_rss_sources_name').on(table.name),
  index('idx_rss_sources_is_enabled').on(table.isEnabled),
]);

const rssAnimeConfigs = pgTable('rss_anime_configs', {
  id: serial('id').primaryKey(),
  rssSourceId: integer('rss_source_id').references(() => rssSources.id),
  sonarrSeriesId: integer('sonarr_series_id').references(() => sonarrSeries.id),
  name: varchar('name').notNull(),
  url: varchar('url').notNull(),
  isEnabled: boolean('is_enabled').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_rss_anime_configs_name').on(table.name),
  index('idx_rss_anime_configs_is_enabled').on(table.isEnabled),
]);

const rssFeedItems = pgTable('rss_feed_items', {
  id: serial('id').primaryKey(),
  rssSourceId: integer('rss_source_id').references(() => rssSources.id),
  title: text('title').notNull(),
  link: varchar('link').notNull(),
  guid: varchar('guid'),
  pubDate: timestamp('pub_date'),
  isProcessed: boolean('is_processed').default(false),
  downloadedAt: timestamp('downloaded_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('idx_rss_feed_items_link').on(table.link),
  index('idx_rss_feed_items_is_processed').on(table.isProcessed),
  index('idx_rss_feed_items_rss_source').on(table.rssSourceId),
]);

const qbittorrentDownloads = pgTable('qbittorrent_downloads', {
  id: serial('id').primaryKey(),
  torrentHash: varchar('torrent_hash').unique(),
  magnetLink: text('magnet_link').notNull(),
  sonarrSeriesId: integer('sonarr_series_id').references(() => sonarrSeries.id),
  category: varchar('category'),
  status: varchar('status'),
  name: varchar('name'),
  size: bigint('size', { mode: 'number' }),
  progress: numeric('progress', { precision: 5, scale: 2 }),
  downloadPath: varchar('download_path'),
  savePath: varchar('save_path'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_qbittorrent_downloads_status').on(table.status),
  index('idx_qbittorrent_downloads_hash').on(table.torrentHash),
  index('idx_qbittorrent_downloads_series').on(table.sonarrSeriesId),
]);

const seriesImages = pgTable('series_images', {
  id: serial('id').primaryKey(),
  sonarrSeriesId: integer('sonarr_series_id').notNull().references(() => sonarrSeries.id, { onDelete: 'cascade' }),
  coverType: varchar('cover_type', { length: 50 }).notNull(),
  url: text('url'),
  remoteUrl: text('remote_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_series_images_series').on(table.sonarrSeriesId),
  index('idx_series_images_type').on(table.coverType),
]);

const seriesAlternateTitles = pgTable('series_alternate_titles', {
  id: serial('id').primaryKey(),
  sonarrSeriesId: integer('sonarr_series_id').notNull().references(() => sonarrSeries.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }).notNull(),
  sceneSeasonNumber: integer('scene_season_number'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_series_alt_titles_series').on(table.sonarrSeriesId),
  index('idx_series_alt_titles_title').on(table.title),
]);

const seriesSeasons = pgTable('series_seasons', {
  id: serial('id').primaryKey(),
  sonarrSeriesId: integer('sonarr_series_id').notNull().references(() => sonarrSeries.id, { onDelete: 'cascade' }),
  seasonNumber: integer('season_number').notNull(),
  monitored: boolean('monitored').default(true),
  episodeCount: integer('episode_count'),
  episodeFileCount: integer('episode_file_count'),
  totalEpisodeCount: integer('total_episode_count'),
  sizeOnDisk: bigint('size_on_disk', { mode: 'number' }),
  percentOfEpisodes: numeric('percent_of_episodes', { precision: 5, scale: 2 }),
  nextAiring: timestamp('next_airing'),
  previousAiring: timestamp('previous_airing'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_series_seasons_series').on(table.sonarrSeriesId),
  index('idx_series_seasons_number').on(table.seasonNumber),
]);

module.exports = {
  sonarrSeries,
  rssSources,
  rssAnimeConfigs,
  rssFeedItems,
  qbittorrentDownloads,
  settings,
  seriesImages,
  seriesAlternateTitles,
  seriesSeasons
};
