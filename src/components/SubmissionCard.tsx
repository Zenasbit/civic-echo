import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SubmissionCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "under_review" | "addressed" | "rejected" | "draft";
  isAnonymous: boolean;
  createdAt: string;
  onClick?: () => void;
}

const categoryLabels: Record<string, string> = {
  infrastructure: "Infrastructure",
  health: "Health",
  education: "Education",
  security: "Security",
  environment: "Environment",
  economic_development: "Economic Development",
  other: "Other",
};

export function SubmissionCard({
  title,
  description,
  category,
  status,
  isAnonymous,
  createdAt,
  onClick,
}: SubmissionCardProps) {
  return (
    <Card className="cursor-pointer transition-all hover:shadow-md" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <StatusBadge status={status} />
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{categoryLabels[category] || category}</Badge>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          </div>
          {isAnonymous && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>Anonymous</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
