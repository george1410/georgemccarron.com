const featureFlags = {
  blogSearch: false,
  topTags: false
};

export const isFeatureEnabled = (feature) =>
  process.env.NODE_ENV !== 'production' || featureFlags[feature];
