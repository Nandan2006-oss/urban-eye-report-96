import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// You'll need to add your Mapbox token as a secret
mapboxgl.accessToken = "pk.eyJ1IjoidXJiYW5leWUiLCJhIjoiY2x0ZXh0In0.demo"; // Placeholder - user will need to add their own

const MapView = () => {
  const [user, setUser] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [mapboxToken, setMapboxToken] = useState("");
  const [tokenSubmitted, setTokenSubmitted] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
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
  }, []);

  useEffect(() => {
    if (tokenSubmitted && mapContainer.current && !map.current) {
      initializeMap();
    }
  }, [tokenSubmitted, issues]);

  const fetchIssues = async () => {
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setIssues(data);
    }
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      mapboxgl.accessToken = mapboxToken;
      setTokenSubmitted(true);
      toast({
        title: "Token set!",
        description: "Loading map...",
      });
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: issues.length > 0 ? [issues[0].longitude, issues[0].latitude] : [72.8777, 19.0760],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add markers for each issue
    issues.forEach((issue) => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px;">
          ${issue.image_url ? `<img src="${issue.image_url}" style="width: 200px; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />` : ""}
          <h3 style="font-weight: bold; margin-bottom: 4px;">${issue.title}</h3>
          <p style="font-size: 14px; color: #666; margin-bottom: 8px;">${issue.description}</p>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #666;">
            <span>👍 ${issue.upvotes} upvotes</span>
          </div>
        </div>
      `);

      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "30px";
      el.style.height = "30px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#00bcd4";
      el.style.border = "3px solid white";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
      el.style.cursor = "pointer";

      new mapboxgl.Marker(el)
        .setLngLat([issue.longitude, issue.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
  };

  if (!tokenSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center space-y-4">
            <h2 className="text-2xl font-bold">Enter Mapbox Token</h2>
            <p className="text-muted-foreground">
              To display the map, please enter your Mapbox public token. 
              Get one for free at{" "}
              <a
                href="https://mapbox.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="pk.eyJ1Ijo..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <Button onClick={handleTokenSubmit} className="w-full">
                Load Map
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="h-[calc(100vh-73px)]">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
};

export default MapView;
