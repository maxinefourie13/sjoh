import { Link, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { FlameButton } from "@/components/ui/flame-button";
import { Menu, X, LayoutDashboard, LogOut, Shield, GraduationCap } from "lucide-react";
import { useIsSchoolMember } from "@/features/school/api";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { ListingStatusBanner } from "@/components/ListingStatusBanner";
import { EarlyAccessRibbon } from "@/components/EarlyAccessRibbon";
import { SjohWordmark } from "@/components/SjohWordmark";
import { useBumpLastActive } from "@/hooks/useBumpLastActive";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BASE_NAV = [
  { to: "/directory", label: "Find a business" },
  { to: "/requests", label: "Ask for help" },
  { to: "/pricing", label: "Pricing" },
];
const PRO_NAV_ITEM = { to: "/leads", label: "Opportunities" };

const initials = (input: string) =>
  input
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const { session, user, signOut } = useAuth();
  const { isAdmin, roles } = useUserRoles();
  const { isMember: isSchoolMember } = useIsSchoolMember();
  const { business } = useMyBusiness();
  const navigate = useNavigate();
  useBumpLastActive();

  // Show "Opportunities" only to users who actually act as Pros — they have the role
  // or have started a business listing. Customers and logged-out browsers don't see it.
  const isPro = roles.includes("pro") || !!business;
  const NAV = isPro ? [...BASE_NAV.slice(0, 2), PRO_NAV_ITEM, ...BASE_NAV.slice(2)] : BASE_NAV;

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Account";

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-white/10 text-white backdrop-blur-md"
      style={{ background: "rgba(5, 5, 5, 0.94)" }}
    >
      <EarlyAccessRibbon />
      <ListingStatusBanner />
      <div className="container flex h-24 md:h-28 items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center" aria-label="Sjoh home">
            <SjohWordmark className="text-6xl md:text-7xl" />
          </Link>
          <nav className="hidden lg:flex items-center gap-7">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className="text-sm font-medium text-white/68 hover:text-white transition-colors"
                activeClassName="text-white"
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/list">List your business</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="size-9 rounded-full bg-sa-gold text-sa-dark text-xs font-semibold flex items-center justify-center hover:brightness-105 transition-colors"
                    aria-label="Account menu"
                  >
                    {initials(displayName)}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard"><LayoutDashboard className="size-4 mr-2" />Dashboard</Link>
                  </DropdownMenuItem>
                  {isSchoolMember && (
                    <DropdownMenuItem asChild>
                      <Link to="/school"><GraduationCap className="size-4 mr-2" />Care Portal</Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin"><Shield className="size-4 mr-2" />Admin · Ops</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/preview"><Shield className="size-4 mr-2" />Admin · Preview</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/founding-members"><Shield className="size-4 mr-2" />Admin · Founding</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/disputes"><Shield className="size-4 mr-2" />Admin · Disputes</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="size-4 mr-2" />Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10 hover:text-white">
                <Link to="/login">Log In</Link>
              </Button>
              <FlameButton asChild>
                <Link to="/list">List your business</Link>
              </FlameButton>
            </>
          )}
        </div>
        <button
          className="lg:hidden p-2 -mr-2"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-white/10 bg-[#050505]">
          <div className="container py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-medium text-white/75"
              >
                {n.label}
              </Link>
            ))}
            <div className="flex gap-3 mt-3">
              {session ? (
                <>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                  </Button>
                  {isSchoolMember && (
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to="/school" onClick={() => setOpen(false)}>Care Portal</Link>
                    </Button>
                  )}
                  <Button className="flex-1" onClick={() => { setOpen(false); handleSignOut(); }}>
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/login" onClick={() => setOpen(false)}>Log In</Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link to="/list" onClick={() => setOpen(false)}>List your business</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
