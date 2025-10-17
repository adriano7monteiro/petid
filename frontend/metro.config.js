const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Reduce file watchers by blacklisting unnecessary folders
config.watchFolders = [path.resolve(__dirname, 'app'), path.resolve(__dirname, 'assets'), path.resolve(__dirname, 'utils'), path.resolve(__dirname, 'services')];

config.resolver = {
  ...config.resolver,
  sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx'],
  blacklistRE: /node_modules\/.*\/node_modules\/.*/,
};

// Disable file watching for node_modules
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Skip watching node_modules
      if (req.url && req.url.includes('node_modules')) {
        req.url = req.url.replace(/(\?|&)platform=/, '');
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
