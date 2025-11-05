import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import IssueCard from "@/components/IssueCard";
import { useToast } from "@/hooks/use-toast";

const Leaderboard = () => {
  const [user, setUser] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchIssues();
    if (user) {
      fetchUserVotes();
    }
  }, [user]);

  const fetchIssues = async () => {
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .order("upvotes", { ascending: false });

    if (!error && data) {
      setIssues(data);
    }
  };

  const fetchUserVotes = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("votes")
      .select("issue_id")
      .eq("user_id", user.id);

    if (data) {
      setUserVotes(new Set(data.map((v) => v.issue_id)));
    }
  };

  const handleUpvote = async (issueId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to upvote issues",
      });
      navigate("/auth");
      return;
    }

    if (userVotes.has(issueId)) return;

    const { error } = await supabase
      .from("votes")
      .insert({ user_id: user.id, issue_id: issueId });

    if (!error) {
      setUserVotes((prev) => new Set([...prev, issueId]));
      fetchIssues();
      toast({
        title: "Upvoted!",
        description: "Your vote has been recorded",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            Issues ranked by community upvotes
          </p>
        </div>

        {issues.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No issues reported yet. Be the first to report one!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onUpvote={handleUpvote}
                hasUpvoted={userVotes.has(issue.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
