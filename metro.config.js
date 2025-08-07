const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure for web platform
config.resolver.platforms = ['web', 'ios', 'android', 'native'];

// Ensure proper asset resolution
config.resolver.assetExts.push('svg');

// Configure server for better web support
config.server = {
  port: 8081,
  host: '0.0.0.0',
};

module.exports = config;