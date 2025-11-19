import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { issueTypes } from "@/data/issueTypes";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const IssueLibrary = () => {
  const [user, setUser] = useState<any>(null);
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

  const handleSelectIssue = (issueType: any) => {
    // Navigate to report page with prefilled data
    navigate("/report", {
      state: {
        prefillTitle: issueType.name,
        prefillDescription: issueType.defaultDescription,
        issueTypeId: issueType.id
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Common Issues Library</h1>
            <p className="text-lg text-muted-foreground">
              Select a common civic issue to quickly report it. We'll prefill the details for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issueTypes.map((issueType) => {
              const IconComponent = issueType.icon;
              return (
                <Card 
                  key={issueType.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{issueType.name}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="mt-2">
                      {issueType.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      onClick={() => handleSelectIssue(issueType)}
                    >
                      Select Issue
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueLibrary;
