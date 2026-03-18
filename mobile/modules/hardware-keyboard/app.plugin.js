const { withPlugins } = require('@expo/config-plugins');

module.exports = function withHardwareKeyboard(config) {
  return withPlugins(config, []);
};