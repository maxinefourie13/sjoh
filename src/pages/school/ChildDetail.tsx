import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileDown, CalendarDays } from "lucide-react";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { SchoolShell, SchoolLoading } from "@/features/school/components/SchoolShell";
import { ProgressRing } from "@/features/school/components/ProgressStat";
import { GoalsPanel } from "@/features/school/components/GoalsPanel";
import { UpdatesPanel } from "@/features/school/components/UpdatesPanel";
import { PacksPanel } from "@/features/school/components/PacksPanel";
import {
  useChild, useGoals, useIep, useUpdates, usePacks, useRecommendations,
  useIsSchoolMember, useLogReport,
} from "@/features/school/api";
import { overallProgress } from "@/features/school/packLogic";
import { generateChildReportPdf } from "@/features/school/report";

export default function ChildDetail() {
  const { childId } = useParams();
  const { isStaff } = useIsSchoolMember();
  const { data: child, isLoading, error } = useChild(childId);
  const { data: iep } = useIep(childId);
  const { data: goals = [] } = useGoals(childId);
  const { data: updates = [] } = useUpdates(childId);
  const { data: packs = [] } = usePacks();
  const { data: recommendations = [] } = useRecommendations(childId);
  const logReport = useLogReport(childId ?? "");

  const pct = overallProgress(goals);

  const downloadReport = () => {
    if (!child) return;
    try {
      const summary = generateChildReportPdf({ child, goals, updates, recommendations });
      logReport.mutate({ summary, period_end: new Date().toISOString().slice(0, 10) });
      toast({ title: "Report downloaded", description: summary });
    } catch (e) {
      toast({ title: "Could not generate report", description: String((e as Error).message), variant: "destructive" });
    }
  };

  return (
    <SchoolShell>
      <SeoHead
        title={`${child ? `${child.first_name} ${child.last_name}` : "Child"} · Progress`}
        description="Individual education programme, progress and updates."
        noindex
      />
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/school"><ArrowLeft className="mr-1 h-4 w-4" /> All children</Link>
      </Button>

      {isLoading ? (
        <SchoolLoading />
      ) : !child ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {error ? "You don't have access to this child." : "Child not found."}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <Avatar className="h-16 w-16">
                {child.avatar_url && <AvatarImage src={child.avatar_url} alt="" />}
                <AvatarFallback className="text-lg">
                  {`${child.first_name[0] ?? ""}${child.last_name[0] ?? ""}`.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold">{child.first_name} {child.last_name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {child.date_of_birth && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> {child.date_of_birth}
                    </span>
                  )}
                  {child.diagnosis && <Badge variant="secondary">{child.diagnosis}</Badge>}
                  {iep?.review_date && <span>Review due {iep.review_date}</span>}
                </div>
                {iep?.summary && <p className="mt-2 text-sm">{iep.summary}</p>}
              </div>
              <div className="flex items-center gap-4">
                <ProgressRing value={pct} size={72} label="Overall progress" />
                <Button variant="outline" onClick={downloadReport}>
                  <FileDown className="mr-2 h-4 w-4" /> Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="goals">
            <TabsList>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="updates">
                Updates{updates.length ? ` (${updates.length})` : ""}
              </TabsTrigger>
              <TabsTrigger value="packs">
                Packs{recommendations.filter((r) => r.status === "suggested").length
                  ? ` (${recommendations.filter((r) => r.status === "suggested").length})`
                  : ""}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="goals" className="mt-4">
              <GoalsPanel childId={child.id} iepId={iep?.id ?? null} goals={goals} canEdit={isStaff} />
            </TabsContent>
            <TabsContent value="updates" className="mt-4">
              <UpdatesPanel childId={child.id} updates={updates} canEdit={isStaff} />
            </TabsContent>
            <TabsContent value="packs" className="mt-4">
              <PacksPanel
                childId={child.id}
                goals={goals}
                recommendations={recommendations}
                packs={packs}
                canEdit={isStaff}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </SchoolShell>
  );
}
