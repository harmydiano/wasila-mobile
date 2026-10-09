const { withMainActivity } = require('@expo/config-plugins');

const FONT_SCALE_OVERRIDE = `
  override fun getResources(): android.content.res.Resources {
    val resources = super.getResources()
    val configuration = resources.configuration
    if (configuration.fontScale != 1.0f) {
      configuration.fontScale = 1.0f
      @Suppress("DEPRECATION")
      resources.updateConfiguration(configuration, resources.displayMetrics)
    }
    return resources
  }
`;

module.exports = function withFixedFontScale(config) {
  return withMainActivity(config, (cfg) => {
    let src = cfg.modResults.contents;
    if (src.includes('configuration.fontScale = 1.0f')) return cfg;

    const lastBrace = src.lastIndexOf('}');
    if (lastBrace === -1) {
      throw new Error('withFixedFontScale: could not find class closing brace in MainActivity');
    }
    src = src.slice(0, lastBrace) + FONT_SCALE_OVERRIDE + src.slice(lastBrace);
    cfg.modResults.contents = src;
    return cfg;
  });
};
