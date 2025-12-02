import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/supabase";
import { SubmissionCard } from "@/components/SubmissionCard";
import { toast } from "sonner";
import { BarChart3, FileText, LogOut, Loader2 } from "lucide-react";

type Submission = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "under_review" | "addressed" | "rejected" | "draft";
  is_anonymous: boolean;
  created_at: string;
};

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [response, setResponse] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const adminStatus = await checkIsAdmin(session.user.id);
      if (!adminStatus) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      loadSubmissions();
    };

    checkAuth();
  }, [navigate]);

  const loadSubmissions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load submissions");
    } else {
      setSubmissions(data || []);
    }
    setIsLoading(false);
  };

  const handleUpdateSubmission = async () => {
    if (!selectedSubmission || !newStatus) return;
    
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error: updateError } = await supabase
        .from("submissions")
        .update({ status: newStatus as any })
        .eq("id", selectedSubmission.id);

      if (updateError) throw updateError;

      if (response.trim()) {
        const { error: responseError } = await supabase
          .from("admin_responses")
          .insert({
            submission_id: selectedSubmission.id,
            response_text: response,
            admin_id: session!.user.id,
          });

        if (responseError) throw responseError;
      }

      toast.success("Submission updated successfully");
      setSelectedSubmission(null);
      setNewStatus("");
      setResponse("");
      loadSubmissions();
    } catch (error: any) {
      toast.error(error.message || "Failed to update submission");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    underReview: submissions.filter((s) => s.status === "under_review").length,
    addressed: submissions.filter((s) => s.status === "addressed").length,
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Under Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.underReview}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Addressed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.addressed}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Submissions</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="under_review">Under Review</TabsTrigger>
            <TabsTrigger value="addressed">Addressed</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : submissions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No submissions yet</p>
                </CardContent>
              </Card>
            ) : (
              submissions.map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  {...submission}
                  isAnonymous={submission.is_anonymous}
                  createdAt={submission.created_at}
                  onClick={() => {
                    setSelectedSubmission(submission);
                    setNewStatus(submission.status);
                  }}
                />
              ))
            )}
          </TabsContent>

          {["pending", "under_review", "addressed", "draft"].map((statusFilter) => (
            <TabsContent key={statusFilter} value={statusFilter} className="space-y-4">
              {submissions
                .filter((s) => s.status === statusFilter)
                .map((submission) => (
                  <SubmissionCard
                    key={submission.id}
                    {...submission}
                    isAnonymous={submission.is_anonymous}
                    createdAt={submission.created_at}
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setNewStatus(submission.status);
                    }}
                  />
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedSubmission?.title}</DialogTitle>
            <DialogDescription>Update status and respond to submission</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Description:</p>
              <p>{selectedSubmission?.description}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="addressed">Addressed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="response">Response (Optional)</Label>
              <Textarea
                id="response"
                placeholder="Provide feedback or updates to the citizen"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={5}
              />
            </div>

            <Button
              onClick={handleUpdateSubmission}
              className="w-full"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Submission
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
