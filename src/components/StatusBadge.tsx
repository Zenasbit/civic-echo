import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";

type Status = "pending" | "under_review" | "addressed" | "rejected";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig = {
  pending: {
    label: "Pending",
    variant: "secondary" as const,
    icon: Clock,
    className: "",
  },
  under_review: {
    label: "Under Review",
    variant: "default" as const,
    icon: AlertCircle,
    className: "",
  },
  addressed: {
    label: "Addressed",
    variant: "default" as const,
    icon: CheckCircle2,
    className: "bg-success text-white",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive" as const,
    icon: XCircle,
    className: "",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
