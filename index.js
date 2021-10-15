const path = require("path");

module.exports = (opts = { configName: "values.config.js" }) => {
  const rawConfig = require(path.join(process.cwd(), opts.configName));
  const config = {};

  Object.keys(rawConfig).forEach((configName) => {
    const cfg = rawConfig[configName];
    if (!("raw" in cfg)) cfg.raw = {};

    if (cfg.colors) {
      Object.keys(cfg.colors).forEach((colorName) => {
        if (typeof cfg.colors[colorName] === "string") {
          cfg.raw[`${colorName}`] = cfg.colors[colorName];
          return;
        }

        Object.keys(cfg.colors[colorName]).forEach((colorOption) => {
          cfg.raw[`${colorName}-${colorOption}`] =
            cfg.colors[colorName][colorOption];
        });
      });
    }
    config[configName] = cfg;
  });

  return {
    postcssPlugin: "postcss-theme-rules",

    Declaration(decl) {
      if (!decl.value.includes("$")) return;
      const matches = decl.value.matchAll(/\$([a-zA-Z\-0-9]+)/gm);
      for (const [full, key] of matches) {
        while (decl.value.includes(full)) {
          decl.value = decl.value.replace(full, `var(--${key})`);
        }
      }
    },

    AtRule: {
      themevalues: (rule, { Declaration }) => {
        if (!(rule.params in config)) return;

        Object.keys(config[rule.params].raw).forEach((key) => {
          let newDecl = new Declaration({
            prop: `--${key}`,
            value: config[rule.params].raw[key],
          });

          rule.parent.append(newDecl);
        });

        rule.remove();
      },
    },
  };
};
module.exports.postcss = true;
