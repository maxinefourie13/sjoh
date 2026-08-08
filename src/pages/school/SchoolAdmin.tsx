import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Users, Package, Plus, Link2 } from "lucide-react";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { SchoolShell, SchoolLoading } from "@/features/school/components/SchoolShell";
import { DOMAINS, domainLabel } from "@/features/school/domains";
import { formatRand } from "@/features/school/packLogic";
import {
  useIsSchoolMember, useMyChildren, useCreateChild, useLinkGuardian, usePacks, useCreatePack,
} from "@/features/school/api";
import type { Child, Relationship } from "@/features/school/types";

function EnrolChild() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [dob, setDob] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const create = useCreateChild();

  const submit = () => {
    if (!first.trim() || !last.trim()) return;
    create.mutate(
      {
        first_name: first.trim(),
        last_name: last.trim(),
        date_of_birth: dob || undefined,
        diagnosis: diagnosis.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast({ title: "Child enrolled" });
          setFirst(""); setLast(""); setDob(""); setDiagnosis("");
        },
        onError: (e) => toast({ title: "Could not enrol", description: String((e as Error).message), variant: "destructive" }),
      },
    );
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><UserPlus className="h-4 w-4" /> Enrol a child</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>First name</Label><Input value={first} onChange={(e) => setFirst(e.target.value)} /></div>
          <div><Label>Last name</Label><Input value={last} onChange={(e) => setLast(e.target.value)} /></div>
          <div><Label>Date of birth</Label><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></div>
          <div><Label>Diagnosis / notes</Label><Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. ASD" /></div>
        </div>
        <Button onClick={submit} disabled={create.isPending || !first.trim() || !last.trim()}>Enrol child</Button>
      </CardContent>
    </Card>
  );
}

function LinkGuardian({ children }: { children: Child[] }) {
  const [childId, setChildId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState<Relationship>("parent");
  const link = useLinkGuardian();

  const submit = () => {
    if (!childId || !email.trim()) return;
    link.mutate(
      { child_id: childId, email: email.trim(), relationship },
      {
        onSuccess: () => { toast({ title: "Linked", description: `${email} can now access this child.` }); setEmail(""); },
        onError: (e) => toast({ title: "Could not link", description: String((e as Error).message), variant: "destructive" }),
      },
    );
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Link2 className="h-4 w-4" /> Link a parent or therapist</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">The person must already have a Sjoh account with this email.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Child</Label>
            <Select value={childId} onValueChange={setChildId}>
              <SelectTrigger><SelectValue placeholder="Select child" /></SelectTrigger>
              <SelectContent>
                {children.map((c) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Role</Label>
            <Select value={relationship} onValueChange={(v) => setRelationship(v as Relationship)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent / guardian</SelectItem>
                <SelectItem value="therapist">Therapist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" />
          </div>
        </div>
        <Button onClick={submit} disabled={link.isPending || !childId || !email.trim()}>Link</Button>
      </CardContent>
    </Card>
  );
}

function PackManager() {
  const { data: packs = [] } = usePacks();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [focus, setFocus] = useState<string[]>([]);
  const create = useCreatePack();

  const toggle = (key: string) =>
    setFocus((f) => (f.includes(key) ? f.filter((x) => x !== key) : [...f, key]));

  const submit = () => {
    if (!name.trim()) return;
    create.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        price_cents: Math.round(parseFloat(price || "0") * 100),
        focus_areas: focus,
        url: url.trim() || undefined,
      },
      {
        onSuccess: () => { toast({ title: "Pack added" }); setName(""); setPrice(""); setDescription(""); setUrl(""); setFocus([]); },
        onError: (e) => toast({ title: "Could not add pack", description: String((e as Error).message), variant: "destructive" }),
      },
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Plus className="h-4 w-4" /> Add a supplementary pack</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>Price (ZAR)</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="349" /></div>
          </div>
          <div><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div><Label>Store link</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." /></div>
          <div>
            <Label>Focus areas</Label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {DOMAINS.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => toggle(d.key)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    focus.includes(d.key) ? "border-indigo-500 bg-indigo-500 text-white" : "hover:bg-muted"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={submit} disabled={create.isPending || !name.trim()}>Add pack</Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Catalogue ({packs.length})</h3>
        {packs.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-medium">{p.name}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.focus_areas.map((f) => <Badge key={f} variant="outline" className="text-xs">{domainLabel(f)}</Badge>)}
                </div>
              </div>
              <span className="shrink-0 font-semibold tabular-nums">{formatRand(p.price_cents)}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function SchoolAdmin() {
  const { loading, isAdmin } = useIsSchoolMember();
  const { data: children = [] } = useMyChildren();

  if (loading) return <SchoolShell><SchoolLoading /></SchoolShell>;
  if (!isAdmin) return <Navigate to="/school" replace />;

  return (
    <SchoolShell>
      <SeoHead title="Manage · Care & Progress Portal" description="Enrol children and manage the pack catalogue." noindex />
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/school"><ArrowLeft className="mr-1 h-4 w-4" /> Portal</Link>
      </Button>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold"><Users className="h-6 w-6 text-indigo-500" /> Manage</h1>

      <Tabs defaultValue="children">
        <TabsList>
          <TabsTrigger value="children">Children & people</TabsTrigger>
          <TabsTrigger value="packs"><Package className="mr-1 h-4 w-4" /> Packs</TabsTrigger>
        </TabsList>
        <TabsContent value="children" className="mt-4 space-y-4">
          <EnrolChild />
          <LinkGuardian children={children} />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Enrolled children ({children.length})</h3>
            {children.map((c) => (
              <Card key={c.id}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <span className="font-medium">{c.first_name} {c.last_name}</span>
                  <Button asChild size="sm" variant="outline"><Link to={`/school/child/${c.id}`}>Open</Link></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="packs" className="mt-4">
          <PackManager />
        </TabsContent>
      </Tabs>
    </SchoolShell>
  );
}
