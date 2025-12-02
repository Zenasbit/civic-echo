import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save } from "lucide-react";

const categories = [
  { value: "infrastructure", label: "Infrastructure" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "security", label: "Security" },
  { value: "environment", label: "Environment" },
  { value: "economic_development", label: "Economic Development" },
  { value: "other", label: "Other" },
];

export default function Submit() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    isAnonymous: false,
  });

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.from("submissions").insert([{
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        is_anonymous: formData.isAnonymous,
        user_id: session?.user?.id || null,
        status: isDraft ? 'draft' : 'pending',
      }]);

      if (error) throw error;

      toast.success(isDraft ? t('success_draft') : t('success_submit'));
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || t('error_submit'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back_to_home')}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('submit_page_title')}</CardTitle>
            <CardDescription>
              {t('submit_page_description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t('title')} {t('required')}</Label>
                <Input
                  id="title"
                  placeholder={t('title_placeholder')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t('category')} {t('required')}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('category_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {t(`categories.${cat.value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('description')} {t('required')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('description_placeholder')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={8}
                  maxLength={2000}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.description.length}/2000 {t('characters')}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isAnonymous: checked as boolean })
                  }
                />
                <Label htmlFor="anonymous" className="cursor-pointer font-normal">
                  {t('submit_anonymous')}
                </Label>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1" 
                  onClick={(e) => handleSubmit(e as any, true)}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  {t('save_draft')}
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('submit_button')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
