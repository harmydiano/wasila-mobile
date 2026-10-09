module.exports = ({ config }) => {
  const scheme = process.env.GOOGLE_IOS_URL_SCHEME;
  if (scheme) {
    config.plugins = [...(config.plugins ?? []), ['@react-native-google-signin/google-signin', { iosUrlScheme: scheme }]];
  }
  return config;
};
