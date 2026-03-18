const { withDangerousMod } = require("@expo/config-plugins");

const withHardwareKeyboard = (config) => {
  // This is a native module, no config plugin modifications needed
  // The expo-module.config.json handles the native module registration
  return config;
};

module.exports = withHardwareKeyboard;
