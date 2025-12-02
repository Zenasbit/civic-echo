import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/supabase";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MessageSquare, Shield, TrendingUp, Users, ArrowRight, LogIn, LogOut } from "lucide-react";
import heroImage from "@/assets/civic-engagement-hero.jpg";

export default function Index() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
          <h1 className="text-xl font-bold text-primary">{t('app_name')}</h1>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {user ? (
              <>
                {isAdmin && (
                  <Button variant="outline" onClick={() => navigate("/admin")}>
                    <Shield className="mr-2 h-4 w-4" />
                    {t('admin_dashboard')}
                  </Button>
                )}
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('sign_out')}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => navigate("/auth")}>
                <LogIn className="mr-2 h-4 w-4" />
                {t('sign_in')}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {t('hero_title')}
                <br />
                <span className="text-primary">{t('hero_title_highlight')}</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('hero_description')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate("/submit")} className="gap-2">
                  {t('submit_feedback')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/track")}>
                  {t('track_submission')}
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
            <h3 className="mb-4 text-3xl font-bold">{t('how_it_works')}</h3>
            <p className="text-lg text-muted-foreground">
              {t('how_it_works_description')}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <MessageSquare className="mb-4 h-12 w-12 text-primary" />
                <CardTitle>{t('feature_submit_title')}</CardTitle>
                <CardDescription>
                  {t('feature_submit_description')}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="mb-4 h-12 w-12 text-secondary" />
                <CardTitle>{t('feature_leaders_title')}</CardTitle>
                <CardDescription>
                  {t('feature_leaders_description')}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="mb-4 h-12 w-12 text-accent" />
                <CardTitle>{t('feature_track_title')}</CardTitle>
                <CardDescription>
                  {t('feature_track_description')}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="mb-4 h-12 w-12 text-success" />
                <CardTitle>{t('feature_secure_title')}</CardTitle>
                <CardDescription>
                  {t('feature_secure_description')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="mb-4 text-3xl font-bold">{t('cta_title')}</h3>
          <p className="mb-8 text-lg text-muted-foreground">
            {t('cta_description')}
          </p>
          <Button size="lg" onClick={() => navigate("/submit")} className="gap-2">
            {t('get_started')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>{t('footer_text')}</p>
        </div>
      </footer>
    </div>
  );
}
