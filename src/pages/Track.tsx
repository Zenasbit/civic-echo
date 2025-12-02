import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { ArrowLeft, Search, Loader2, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Submission = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "under_review" | "addressed" | "rejected" | "draft";
  is_anonymous: boolean;
  created_at: string;
  admin_responses: Array<{
    response_text: string;
    created_at: string;
  }>;
};

export default function Track() {
  const navigate = useNavigate();
  const [submissionId, setSubmissionId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionId.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select(`
          *,
          admin_responses (
            response_text,
            created_at
          )
        `)
        .eq("id", submissionId.trim())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("Submission not found. Please check the ID and try again.");
        setSubmission(null);
      } else {
        setSubmission(data);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to search for submission");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Track Your Submission</CardTitle>
            <CardDescription>
              Enter your submission ID to check its status and view any responses from leaders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="submission-id">Submission ID</Label>
                <Input
                  id="submission-id"
                  placeholder="Enter your submission ID"
                  value={submissionId}
                  onChange={(e) => setSubmissionId(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {submission && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle>{submission.title}</CardTitle>
                    <CardDescription>ID: {submission.id}</CardDescription>
                  </div>
                  <StatusBadge status={submission.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold">Description</h4>
                  <p className="text-muted-foreground">{submission.description}</p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Submitted{" "}
                      {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {submission.is_anonymous && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Anonymous submission</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {submission.admin_responses && submission.admin_responses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Official Responses</CardTitle>
                  <CardDescription>
                    Updates and feedback from leaders regarding your submission
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {submission.admin_responses.map((response, index) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <p className="mb-2">{response.response_text}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
