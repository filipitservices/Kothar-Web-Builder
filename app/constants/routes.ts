/**
 * Canonical in-app paths for navigation.
 * Use these with NuxtLink / navigateTo to avoid scattered string literals.
 */
export const ROUTES = {
  home: '/',
  gallery: '/gallery',
  sites: '/sites',
  reportIssue: '/report-issue',
} as const;

export type AppRoutePath = (typeof ROUTES)[keyof typeof ROUTES];
