import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/supabase";
import { MessageSquare, Shield, TrendingUp, Users, ArrowRight, LogIn, LogOut } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export default function Index() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            checkIsAdmin(session.user.id).then(setIsAdmin);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkIsAdmin(session.user.id).then(setIsAdmin);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-primary">Have Your Say</h1>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {isAdmin && (
                  <Button variant="outline" onClick={() => navigate("/admin")}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Button>
                )}
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => navigate("/auth")}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Your Voice,
                <br />
                <span className="text-primary">Your Community</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Bridge the gap between citizens and leaders. Share your suggestions, report issues,
                and help build a better Kenya through transparent, accessible civic engagement.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate("/submit")} className="gap-2">
                  Submit Feedback
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/track")}>
                  Track Submission
                </Button>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg border shadow-2xl">
              <img
                src={heroImage}
                alt="Citizens engaging with digital civic platform"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h3 className="mb-4 text-3xl font-bold">How It Works</h3>
            <p className="text-lg text-muted-foreground">
              A simple, transparent platform for meaningful civic engagement
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <MessageSquare className="mb-4 h-12 w-12 text-primary" />
                <CardTitle>Submit Feedback</CardTitle>
                <CardDescription>
                  Share suggestions, complaints, or ideas anonymously or with your identity
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="mb-4 h-12 w-12 text-secondary" />
                <CardTitle>Leaders Respond</CardTitle>
                <CardDescription>
                  Your feedback reaches decision-makers who can review and respond directly
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="mb-4 h-12 w-12 text-accent" />
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>
                  Monitor the status of your submission from pending to addressed
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="mb-4 h-12 w-12 text-success" />
                <CardTitle>Transparent & Secure</CardTitle>
                <CardDescription>
                  All feedback is protected and stored securely with full transparency
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="mb-4 text-3xl font-bold">Ready to Make Your Voice Heard?</h3>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of citizens working together to improve our communities
          </p>
          <Button size="lg" onClick={() => navigate("/submit")} className="gap-2">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Have Your Say. Empowering civic engagement in Kenya.</p>
        </div>
      </footer>
    </div>
  );
}
