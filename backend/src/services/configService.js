const { db } = require('../db/db');
const { settings } = require('../db/schema');
const { eq } = require('drizzle-orm');
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

const encrypt = (text) => {
  if (!text) return null;
  try {
    const iv = crypto.randomBytes(16);
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag ? cipher.getAuthTag().toString('hex') : '';
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error.message);
    return text;
  }
};

const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return encryptedText;
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
    if (decipher.setAuthTag) {
      decipher.setAuthTag(authTag);
    }
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    return encryptedText;
  }
};

const SENSITIVE_KEYS = [
  'sonarr_api_key',
  'qbittorrent_password'
];

const isSensitive = (key) => SENSITIVE_KEYS.includes(key);

const maskValue = (value) => {
  if (!value) return '';
  if (value.length <= 4) return '•'.repeat(value.length);
  return '•'.repeat(value.length - 4) + value.slice(-4);
};

const getSetting = async (key) => {
  try {
    const result = await db.select().from(settings).where(eq(settings.key, key));
    if (result.length > 0) {
      const setting = result[0];
      if (setting.isEncrypted) {
        return decrypt(setting.value);
      }
      return setting.value;
    }
    return null;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error.message);
    return null;
  }
};

const getSettingWithFallback = async (key, envVarName) => {
  const dbValue = await getSetting(key);
  if (dbValue !== null) {
    return dbValue;
  }
  return process.env[envVarName] || null;
};

const setSetting = async (key, value, shouldEncrypt = null) => {
  try {
    const encrypted = shouldEncrypt !== null 
      ? shouldEncrypt 
      : isSensitive(key);
    
    const valueToStore = encrypted ? encrypt(value) : value;
    const existing = await db.select().from(settings).where(eq(settings.key, key));
    
    if (existing.length > 0) {
      await db.update(settings)
        .set({ 
          value: valueToStore, 
          isEncrypted: encrypted,
          updatedAt: new Date()
        })
        .where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({
        key,
        value: valueToStore,
        isEncrypted: encrypted,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error setting ${key}:`, error.message);
    return { success: false, error: error.message };
  }
};

const getAllSettings = async () => {
  try {
    const allSettings = await db.select().from(settings);
    return allSettings.map(setting => ({
      key: setting.key,
      value: setting.isEncrypted 
        ? maskValue(decrypt(setting.value))
        : setting.value,
      isEncrypted: setting.isEncrypted,
      updatedAt: setting.updatedAt
    }));
  } catch (error) {
    console.error('Error getting all settings:', error.message);
    return [];
  }
};

const getConfig = async () => {
  return {
    sonarr: {
      url: await getSettingWithFallback('sonarr_url', 'SONARR_URL') || 'http://localhost:8989',
      apiKey: await getSettingWithFallback('sonarr_api_key', 'SONARR_API_KEY') || ''
    },
    qbittorrent: {
      url: await getSettingWithFallback('qbittorrent_url', 'QBITTORRENT_URL') || 'http://localhost:8080',
      username: await getSettingWithFallback('qbittorrent_username', 'QBITTORRENT_USERNAME') || 'admin',
      password: await getSettingWithFallback('qbittorrent_password', 'QBITTORRENT_PASSWORD') || 'adminadmin'
    }
  };
};

module.exports = {
  getSetting,
  setSetting,
  getAllSettings,
  getConfig,
  isSensitive,
  maskValue,
  encrypt,
  decrypt
};