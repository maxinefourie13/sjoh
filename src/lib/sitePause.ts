// Master switch for the holding page. Set to false to bring the full site back.
export const SITE_PAUSED = true;

// Routes that stay reachable while paused: sign-in and admin for the owner,
// unsubscribe links in sent emails, legal pages, and existing quote/invoice links.
const OPEN_PREFIXES = [
  "/login",
  "/auth/",
  "/forgot-password",
  "/reset-password",
  "/admin",
  "/unsubscribe",
  "/email-preferences/",
  "/terms",
  "/privacy",
  "/quote/",
  "/invoice/",
];

export const isOpenWhilePaused = (pathname: string) =>
  OPEN_PREFIXES.some((prefix) => {
    const base = prefix.replace(/\/$/, "");
    return pathname === base || pathname.startsWith(`${base}/`);
  });
