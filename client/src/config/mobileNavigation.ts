const PRIMARY_MOBILE_ROUTES = [
  /^\/$/,
  /^\/(lab|tv|network|profile|settings|dashboard|healing|mobility|concepts|demos|music|enterprise|others|status)\/?$/,
  /^\/engineer\/dashboard\/?$/,
  /^\/(profiles|concepts|demos|ventures)\/[^/]+\/?$/,
];

/** The persistent bar is reserved for browsing and primary workspace screens. */
export const shouldShowMobileNavigation = (pathname: string) =>
  PRIMARY_MOBILE_ROUTES.some(pattern => pattern.test(pathname));

const navigationSuppressors = new Set<string>();

export const setMobileNavigationSuppressed = (source: string, suppressed: boolean) => {
  if (suppressed) navigationSuppressors.add(source);
  else navigationSuppressors.delete(source);
  document.body.classList.toggle('hide-mobile-nav', navigationSuppressors.size > 0);
};
