import { Link } from "react-router-dom";
import { GraduationCap, Users, Stethoscope, ArrowRight, ShieldCheck } from "lucide-react";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { SchoolShell, SchoolLoading } from "@/features/school/components/SchoolShell";
import { ProgressRing } from "@/features/school/components/ProgressStat";
import { useIsSchoolMember, useMyChildren, useGoals } from "@/features/school/api";
import { overallProgress } from "@/features/school/packLogic";
import type { Child } from "@/features/school/types";

function ChildProgressCard({ child, staff }: { child: Child; staff: boolean }) {
  const { data: goals = [] } = useGoals(child.id);
  const pct = overallProgress(goals);
  const initials = `${child.first_name[0] ?? ""}${child.last_name[0] ?? ""}`.toUpperCase();
  return (
    <Link to={`/school/child/${child.id}`} className="block">
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-5">
          <Avatar className="h-12 w-12">
            {child.avatar_url && <AvatarImage src={child.avatar_url} alt="" />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              {child.first_name} {child.last_name}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {goals.length} goal{goals.length === 1 ? "" : "s"}
              {child.diagnosis ? ` · ${child.diagnosis}` : ""}
            </p>
            {staff && <Badge variant="secondary" className="mt-1">{child.status}</Badge>}
          </div>
          <ProgressRing value={pct} label={`${child.first_name}'s progress`} />
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}

function NotAMember() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-indigo-500" /> Care & Progress Portal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          This is the private Piece of Mind portal where parents follow their child's
          individual education programme and progress, and the care team keeps
          everyone informed.
        </p>
        <p>
          Your account isn't linked to the portal yet. Please ask the centre to add
          you as a parent, therapist, or coordinator.
        </p>
      </CardContent>
    </Card>
  );
}

export default function SchoolHome() {
  const { user } = useAuth();
  const { loading, isMember, isStaff, isAdmin, isParent } = useIsSchoolMember();
  const { data: children = [], isLoading: childrenLoading } = useMyChildren();

  return (
    <SchoolShell>
      <SeoHead
        title="Care & Progress Portal · Piece of Mind"
        description="Private portal for following each child's individual education programme and progress."
        noindex
      />
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <GraduationCap className="h-6 w-6 text-indigo-500" />
            {isParent && !isStaff ? "Your children" : "Care & Progress Portal"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isStaff
              ? "Your caseload — open a child to update goals, post progress, and recommend packs."
              : "Follow your child's programme, progress and the latest from the team."}
          </p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link to="/school/admin">
              <Users className="mr-2 h-4 w-4" /> Manage
            </Link>
          </Button>
        )}
      </div>

      {loading || childrenLoading ? (
        <SchoolLoading />
      ) : !isMember ? (
        <NotAMember />
      ) : children.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Stethoscope className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No children linked to your account yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {isAdmin
                ? "Enrol a child and link their parent and therapist to get started."
                : "Once the centre links a child to you, they'll appear here."}
            </p>
            {isAdmin && (
              <Button asChild className="mt-2">
                <Link to="/school/admin">Enrol a child</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {children.map((c) => (
            <ChildProgressCard key={c.id} child={c} staff={isStaff} />
          ))}
        </div>
      )}
    </SchoolShell>
  );
}
