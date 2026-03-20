const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const config = getDefaultConfig(projectRoot)

// Avoid resolving packages from the repo root to prevent duplicate Tamagui instances.
config.resolver.nodeModulesPaths = [path.join(projectRoot, 'node_modules')]
config.resolver.disableHierarchicalLookup = true

// Fix for react-native-syntax-highlighter trying to import from old paths
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-syntax-highlighter': path.resolve(projectRoot, 'node_modules/react-syntax-highlighter/dist/cjs/index'),
  'react-syntax-highlighter/prism': path.resolve(projectRoot, 'node_modules/react-syntax-highlighter/dist/cjs/prism'),
  'react-syntax-highlighter/create-element': path.resolve(projectRoot, 'node_modules/react-syntax-highlighter/dist/cjs/create-element'),
  'react-syntax-highlighter/styles/prism': path.resolve(projectRoot, 'node_modules/react-syntax-highlighter/dist/cjs/styles/prism'),
  'react-syntax-highlighter/styles/hljs': path.resolve(projectRoot, 'node_modules/react-syntax-highlighter/dist/cjs/styles/hljs'),
}

module.exports = config
