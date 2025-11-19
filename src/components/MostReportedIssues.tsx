import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { issueTypes } from "@/data/issueTypes";
import { TrendingUp } from "lucide-react";

interface MostReportedData {
  issue_type: string;
  report_count: number;
}

const MostReportedIssues = () => {
  const [mostReported, setMostReported] = useState<MostReportedData[]>([]);

  useEffect(() => {
    fetchMostReported();
  }, []);

  const fetchMostReported = async () => {
    const { data, error } = await supabase
      .from("most_reported_issues")
      .select("*")
      .limit(5);

    if (!error && data) {
      setMostReported(data);
    }
  };

  const getIssueInfo = (issueTypeId: string) => {
    return issueTypes.find(type => type.id === issueTypeId);
  };

  if (mostReported.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Most Reported Issues</h2>
          </div>
          
          <div className="grid gap-4">
            {mostReported.map((item, index) => {
              const issueInfo = getIssueInfo(item.issue_type);
              if (!issueInfo) return null;
              
              const IconComponent = issueInfo.icon;
              const maxCount = mostReported[0]?.report_count || 1;
              const percentage = (item.report_count / maxCount) * 100;

              return (
                <Card key={item.issue_type} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{issueInfo.name}</h3>
                          <span className="text-sm font-bold text-primary">
                            {item.report_count} reports
                          </span>
                        </div>
                        
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MostReportedIssues;
