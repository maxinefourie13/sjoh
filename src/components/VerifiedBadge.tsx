interface Props {
  size?: "sm" | "md" | "lg";
  className?: string;
  withLabel?: boolean;
}

/**
 * ID verification was removed, so this badge no longer renders anywhere.
 * Kept as a no-op component so existing call sites (BusinessCard, profiles)
 * don't need touching; they simply show nothing.
 */
export const VerifiedBadge = (_props: Props) => null;
