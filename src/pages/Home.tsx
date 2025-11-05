import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import IssueCard from "@/components/IssueCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Users, TrendingUp } from "lucide-react";

const Home = () => {
  const [user, setUser] = useState<any>(null);
  const [topIssues, setTopIssues] = useState<any[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

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
    fetchTopIssues();
    if (user) {
      fetchUserVotes();
    }
  }, [user]);

  const fetchTopIssues = async () => {
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .order("upvotes", { ascending: false })
      .limit(3);

    if (!error && data) {
      setTopIssues(data);
    }
  };

  const fetchUserVotes = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("votes")
      .select("issue_id")
      .eq("user_id", user.id);

    if (data) {
      setUserVotes(new Set(data.map(v => v.issue_id)));
    }
  };

  const handleUpvote = async (issueId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (userVotes.has(issueId)) return;

    const { error } = await supabase
      .from("votes")
      .insert({ user_id: user.id, issue_id: issueId });

    if (!error) {
      setUserVotes(prev => new Set([...prev, issueId]));
      fetchTopIssues();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Report Civic Problems, Make Your City Better
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Urban Eye empowers citizens to report and track civic issues like potholes, garbage, 
              and broken streetlights. Together, we can build better communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/report")} className="text-lg">
                Report an Issue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/map")}>
                View Map
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Location-Based</h3>
              <p className="text-muted-foreground">
                Pin issues on the map with exact coordinates for quick identification
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 text-secondary mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-muted-foreground">
                Upvote issues that matter to you and see what others care about
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-muted-foreground">
                Monitor your reports and see the most upvoted issues in your area
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Issues */}
      {topIssues.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Top Reported Issues</h2>
              <Button variant="ghost" onClick={() => navigate("/leaderboard")}>
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {topIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onUpvote={handleUpvote}
                  hasUpvoted={userVotes.has(issue.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t py-8 bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>Built by Nandan Nalwade | Powered by AI and Lovable Cloud</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
