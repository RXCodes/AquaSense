export const Settings = {
  sanitize_settings,
};

// sanitize settings to ensure they are valid
function sanitize_settings(settings, default_settings) {
  const sanitized = {};

  for (const key in default_settings) {
    const config = default_settings[key];
    let value = settings[key];

    // If value is null use default
    if (value === undefined || value === null) {
      sanitized[key] = config.default;
      continue;
    }

    // Handle number type
    if (config.type === "number") {
      let num = Number(value);

      // If not valid use default
      if (isNaN(num)) {
        sanitized[key] = config.default;
      } else {
        // Clamp to min/max
        if (config.minimum !== undefined) {
          num = Math.max(num, config.minimum);
        }
        if (config.maximum !== undefined) {
          num = Math.min(num, config.maximum);
        }
        sanitized[key] = num;
      }
    } else if (config.type === "string") {
      if (typeof value !== "string") {
        sanitized[key] = config.default;
      } else {
        if (
          (config.min_length !== undefined &&
            value.length < config.min_length) ||
          (config.max_length !== undefined && value.length > config.max_length)
        ) {
          sanitized[key] = config.default;
        } else {
          sanitized[key] = value;
        }
      }
    } else {
      sanitized[key] = config.default;
    }
  }

  return sanitized;
}
