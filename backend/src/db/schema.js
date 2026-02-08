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

const series = pgTable('series', {
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
  downloadStatus: integer('download_status').default(0),
  lastSyncedAt: timestamp('last_synced_at').defaultNow(),
  rawData: jsonb('raw_data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_series_title').on(table.title),
  index('idx_series_status').on(table.status),
  index('idx_series_last_synced').on(table.lastSyncedAt),
  index('idx_series_imdb').on(table.imdbId),
  index('idx_series_tmdb').on(table.tmdbId),
  index('idx_series_tvdb').on(table.tvdbId),
]);

const rss = pgTable('rss', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  description: text('description'),
  url: varchar('url').notNull(),
  templateId: integer('template_id').default(0),
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

const qbittorrentDownloads = pgTable('qbittorrent_downloads', {
  id: serial('id').primaryKey(),
  torrentHash: varchar('torrent_hash').unique(),
  magnetLink: text('magnet_link').notNull(),
  seriesId: integer('series_id').references(() => series.id),
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
  index('idx_qbittorrent_downloads_series').on(table.seriesId),
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
  autoDownloadStatus: integer('auto_download_status').default(0),
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
  autoDownloadStatus: integer('auto_download_status').default(0),
  downloadedAt: timestamp('downloaded_at'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('idx_episodes_series').on(table.seriesId),
  index('idx_episodes_season').on(table.seasonId),
  index('idx_episodes_sonarr_id').on(table.sonarrEpisodeId),
]);

module.exports = {
  series,
  rss,
  rssItem,
  qbittorrentDownloads,
  settings,
  seriesImages,
  seriesAlternateTitles,
  seriesSeasons,
  seriesEpisodes
};
