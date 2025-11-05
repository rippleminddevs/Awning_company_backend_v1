const { join } = require('path')

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer.
  cacheDirectory: process.env.PUPPETEER_CACHE_DIR || join(__dirname, '.cache', 'puppeteer'),

  // Download Chrome browser for Puppeteer
  skipDownload: process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD === 'true',

  // Use Chrome instead of Chromium
  channel: process.env.NODE_ENV === 'production' ? undefined : 'chrome',
}
