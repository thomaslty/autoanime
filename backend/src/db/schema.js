const { pgTable, serial, text, varchar, boolean, timestamp, integer, jsonb, index, bigint, numeric, foreignKey } = require('drizzle-orm/pg-core');

// Reference table for download statuses
const downloadStatus = pgTable('download_status', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  label: varchar('label', { length: 50 }).notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_download_status_name').on(table.name),
  index('idx_download_status_sort').on(table.sortOrder),
]);

// Reference table for RSS templates
const rssTemplate = pgTable('rss_template', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  label: varchar('label', { length: 50 }).notNull(),
  description: text('description'),
  parser: varchar('parser', { length: 50 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_rss_template_name').on(table.name),
]);

// User-defined RSS parsers (linked to rss_template)
const rssParser = pgTable('rss_parser', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  description: text('description'),
  rssTemplateId: integer('rss_template_id').references(() => rssTemplate.id, { onDelete: 'cascade' }).unique(),
  itemPath: varchar('item_path').notNull(),
  fieldMappings: jsonb('field_mappings').notNull(),
  sampleUrl: text('sample_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_rss_parser_template').on(table.rssTemplateId),
  index('idx_rss_parser_name').on(table.name),
]);

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

const rss = pgTable('rss', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  description: text('description'),
  url: varchar('url').notNull(),
  templateId: integer('template_id').references(() => rssTemplate.id, { onDelete: 'set null' }),
  isEnabled: boolean('is_enabled').default(true),
  lastFetchedAt: timestamp('last_fetched_at'),
  refreshInterval: varchar('refresh_interval').default('1h'),
  refreshIntervalType: varchar('refresh_interval_type').default('human'),
  nextFetchAt: timestamp('next_fetch_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_rss_name').on(table.name),
  index('idx_rss_is_enabled').on(table.isEnabled),
  index('idx_rss_template_id').on(table.templateId),
]);

const rssItem = pgTable('rss_item', {
  id: serial('id').primaryKey(),
  rssId: integer('rss_id').references(() => rss.id, { onDelete: 'cascade' }),
  guid: varchar('guid').notNull(),
  title: text('title'),
  description: text('description'),
  link: varchar('link'),
  publishedDate: timestamp('published_date'),
  magnetLink: text('magnet_link'),
  author: varchar('author'),
  category: varchar('category'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('idx_rss_item_rss_id').on(table.rssId),
  index('idx_rss_item_guid').on(table.guid),
  index('idx_rss_item_published').on(table.publishedDate),
]);

const rssConfig = pgTable('rss_config', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  description: text('description'),
  regex: text('regex').notNull(),
  rssSourceId: integer('rss_source_id').references(() => rss.id, { onDelete: 'set null' }),
  offset: integer('offset'),
  isEnabled: boolean('is_enabled').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_rss_config_name').on(table.name),
  index('idx_rss_config_rss_source').on(table.rssSourceId),
]);

const seriesMetadata = pgTable('series_metadata', {
  id: serial('id').primaryKey(),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }).unique(),
  titleSlug: varchar('title_slug'),
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
  profileId: integer('profile_id'),
  languageProfileId: integer('language_profile_id'),
  episodeCount: integer('episode_count'),
  sizeOnDisk: bigint('size_on_disk', { mode: 'number' }),
  percentOfEpisodes: numeric('percent_of_episodes', { precision: 5, scale: 2 }),
  ratingValue: numeric('rating_value', { precision: 3, scale: 1 }),
  ratingVotes: integer('rating_votes'),
  rawData: jsonb('raw_data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_series_metadata_series').on(table.seriesId),
  index('idx_series_metadata_imdb').on(table.imdbId),
  index('idx_series_metadata_tmdb').on(table.tmdbId),
  index('idx_series_metadata_tvdb').on(table.tvdbId),
]);

const series = pgTable('series', {
  id: serial('id').primaryKey(),
  sonarrId: integer('sonarr_id').notNull().unique(),
  title: text('title').notNull(),
  overview: text('overview'),
  posterPath: varchar('poster_path'),
  status: varchar('status'),
  seasonCount: integer('season_count'),
  totalEpisodeCount: integer('total_episode_count'),
  episodeFileCount: integer('episode_file_count'),
  monitored: boolean('monitored').default(true),
  isAutoDownloadEnabled: boolean('is_auto_download_enabled').default(false),
  downloadStatusId: integer('download_status_id').references(() => downloadStatus.id, { onDelete: 'set null' }),
  rssConfigId: integer('rss_config_id').references(() => rssConfig.id, { onDelete: 'set null' }),
  path: text('path'),
  lastSyncedAt: timestamp('last_synced_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_series_title').on(table.title),
  index('idx_series_status').on(table.status),
  index('idx_series_last_synced').on(table.lastSyncedAt),
]);

const downloads = pgTable('downloads', {
  id: serial('id').primaryKey(),
  torrentHash: varchar('torrent_hash').unique(),
  magnetLink: text('magnet_link').notNull(),
  seriesEpisodeId: integer('series_episode_id').references(() => seriesEpisodes.id, { onDelete: 'set null' }),
  rssItemId: integer('rss_item_id').references(() => rssItem.id, { onDelete: 'set null' }),
  category: varchar('category'),
  downloadStatusId: integer('download_status_id').references(() => downloadStatus.id, { onDelete: 'set null' }),
  name: varchar('name'),
  size: bigint('size', { mode: 'number' }),
  progress: numeric('progress', { precision: 5, scale: 2 }).default('0'),
  contentPath: varchar('content_path'),
  rootPath: varchar('root_path'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_downloads_status').on(table.downloadStatusId),
  index('idx_downloads_hash').on(table.torrentHash),
  index('idx_downloads_episode').on(table.seriesEpisodeId),
  index('idx_downloads_rss_item').on(table.rssItemId),
]);

const seriesImages = pgTable('series_images', {
  id: serial('id').primaryKey(),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  coverType: varchar('cover_type', { length: 50 }).notNull(),
  url: text('url'),
  remoteUrl: text('remote_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_series_images_series').on(table.seriesId),
  index('idx_series_images_type').on(table.coverType),
]);

const seriesAlternateTitles = pgTable('series_alternate_titles', {
  id: serial('id').primaryKey(),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }).notNull(),
  sceneSeasonNumber: integer('scene_season_number'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_series_alt_titles_series').on(table.seriesId),
  index('idx_series_alt_titles_title').on(table.title),
]);

const seriesSeasons = pgTable('series_seasons', {
  id: serial('id').primaryKey(),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  seasonNumber: integer('season_number').notNull(),
  monitored: boolean('monitored').default(true),
  episodeCount: integer('episode_count'),
  episodeFileCount: integer('episode_file_count'),
  totalEpisodeCount: integer('total_episode_count'),
  sizeOnDisk: bigint('size_on_disk', { mode: 'number' }),
  percentOfEpisodes: numeric('percent_of_episodes', { precision: 5, scale: 2 }),
  nextAiring: timestamp('next_airing'),
  previousAiring: timestamp('previous_airing'),
  isAutoDownloadEnabled: boolean('is_auto_download_enabled').default(false),
  downloadStatusId: integer('download_status_id').references(() => downloadStatus.id, { onDelete: 'set null' }),
  rssConfigId: integer('rss_config_id').references(() => rssConfig.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_series_seasons_series').on(table.seriesId),
  index('idx_series_seasons_number').on(table.seasonNumber),
]);

const seriesEpisodes = pgTable('series_episodes', {
  id: serial('id').primaryKey(),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  seasonId: integer('season_id').references(() => seriesSeasons.id, { onDelete: 'cascade' }),
  sonarrEpisodeId: integer('sonarr_episode_id').notNull().unique(),

  // Episode metadata
  title: text('title'),
  episodeNumber: integer('episode_number').notNull(),
  seasonNumber: integer('season_number').notNull(),
  overview: text('overview'),
  airDate: timestamp('air_date'),

  // Status flags from Sonarr
  hasFile: boolean('has_file').default(false),
  monitored: boolean('monitored').default(true),

  // AutoAnime-specific tracking
  isAutoDownloadEnabled: boolean('is_auto_download_enabled').default(false),
  downloadStatusId: integer('download_status_id').references(() => downloadStatus.id, { onDelete: 'set null' }),
  downloadedAt: timestamp('downloaded_at'),
  rssItemId: integer('rss_item_id').references(() => rssItem.id, { onDelete: 'set null' }),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_episodes_series').on(table.seriesId),
  index('idx_episodes_season').on(table.seasonId),
  index('idx_episodes_sonarr_id').on(table.sonarrEpisodeId),
  index('idx_episodes_rss_item').on(table.rssItemId),
]);

module.exports = {
  series,
  seriesMetadata,
  rss,
  rssItem,
  rssConfig,
  downloads,
  qbittorrentDownloads: downloads, // Alias for backward compatibility
  settings,
  seriesImages,
  seriesAlternateTitles,
  seriesSeasons,
  seriesEpisodes,
  downloadStatus,
  rssTemplate,
  rssParser
};
