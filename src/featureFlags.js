const featureFlags = {
  blogSearch: false,
  topTags: false,
};

export const isFeatureEnabled = (feature) => featureFlags[feature];
