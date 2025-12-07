
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
];

// Explicitly define platform extensions to ensure correct resolution
// The order matters: more specific platforms first
config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver?.sourceExts || []), 'tsx', 'ts', 'jsx', 'js', 'json'],
  platforms: ['ios', 'android', 'native', 'web'],
  resolverMainFields: ['react-native', 'browser', 'main'],
  // Ensure platform-specific files are resolved correctly
  resolveRequest: (context, moduleName, platform) => {
    // Let Metro handle the default resolution
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
