export const selectTransform = (str: string[] | undefined) => {
  if (!str) return "";
  return str.join(",");
};

export const preloadTransform = (preload: boolean | undefined) => {
  if (preload === undefined) return "";
  return preload;
};
