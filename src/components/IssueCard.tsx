import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { ThumbsUp, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";

interface IssueCardProps {
  issue: {
    id: string;
    title: string;
    description: string;
    image_url: string | null;
    upvotes: number;
    created_at: string;
    latitude: number;
    longitude: number;
  };
  onUpvote?: (issueId: string) => void;
  hasUpvoted?: boolean;
  showUpvote?: boolean;
}

const IssueCard = ({ issue, onUpvote, hasUpvoted, showUpvote = true }: IssueCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-[var(--shadow-hover)] transition-shadow">
      {issue.image_url && (
        <div className="aspect-video overflow-hidden bg-muted">
          <img
            src={issue.image_url}
            alt={issue.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <h3 className="text-lg font-semibold">{issue.title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{issue.description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>
              {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(issue.created_at), "MMM d, yyyy")}</span>
          </div>
        </div>
      </CardContent>
      {showUpvote && (
        <CardFooter className="border-t pt-4">
          <Button
            onClick={() => onUpvote?.(issue.id)}
            disabled={hasUpvoted}
            variant={hasUpvoted ? "secondary" : "default"}
            className="w-full"
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            {hasUpvoted ? "Upvoted" : "Upvote"} ({issue.upvotes})
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default IssueCard;
