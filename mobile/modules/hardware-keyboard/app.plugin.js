const { withDangerousMod, IOSConfig } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

const withHardwareKeyboard = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const modulePath = path.join(projectRoot, "modules", "hardware-keyboard");
      
      // The Swift file will be automatically included by expo-modules-core
      // No additional configuration needed
      
      return config;
    },
  ]);
};

module.exports = withHardwareKeyboard;
