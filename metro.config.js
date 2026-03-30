const { getDefaultConfig }= require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;

// Add platform specific file extension support
config.resolver.sourceExts = [...config.resolver.sourceExts];

config.resolver.assetExts.push("pte");
config.resolver.assetExts.push("bin");
// Configure platform extension resolution order
config.resolver.platforms = ["ios", "android", "native", "web"];

module.exports = config;
