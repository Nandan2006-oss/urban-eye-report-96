import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Mapbox token already configured
mapboxgl.accessToken = "pk.eyJ1IjoibmFuZGFuLTIwMDYiLCJhIjoiY21obmh2d2doMDBrdTJrc2Fqa3BzdW9sZyJ9.SJeymzfS4AiQAZ7XR6_cyQ";

// Global map state to persist across navigation
let globalMap: mapboxgl.Map | null = null;
let globalMapContainer: HTMLElement | null = null;

const MapView = () => {
  const [user, setUser] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const mapContainer = useRef<HTMLDivElement>(null);

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
    if (mapContainer.current && issues.length > 0) {
      initializeMap();
    }
    
    return () => {
      // Don't remove the map on unmount - keep it alive for navigation
    };
  }, [issues]);

  const fetchIssues = async () => {
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setIssues(data);
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current) return;

    // If map already exists globally, just reattach it to the current container
    if (globalMap && globalMapContainer) {
      // Move the map canvas to the new container
      if (mapContainer.current !== globalMapContainer) {
        const canvas = globalMapContainer.querySelector('.mapboxgl-canvas');
        if (canvas && canvas.parentElement) {
          mapContainer.current.appendChild(canvas.parentElement);
        }
        globalMapContainer = mapContainer.current;
      }
      return;
    }

    // Create new map instance
    globalMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: issues.length > 0 ? [issues[0].longitude, issues[0].latitude] : [77.5946, 12.9716], // Bangalore default
      zoom: 12,
    });

    globalMapContainer = mapContainer.current;

    globalMap.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add markers for each issue
    issues.forEach((issue) => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 12px; background: #1e293b; color: #e0e0e0; border-radius: 8px;">
          ${issue.image_url ? `<img src="${issue.image_url}" style="width: 200px; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />` : ""}
          <h3 style="font-weight: bold; margin-bottom: 4px; color: #00bcd4;">${issue.title}</h3>
          <p style="font-size: 14px; color: #b0b0b0; margin-bottom: 8px;">${issue.description}</p>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #b0b0b0;">
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
      el.style.border = "3px solid #1e293b";
      el.style.boxShadow = "0 2px 8px rgba(0, 188, 212, 0.4)";
      el.style.cursor = "pointer";

      new mapboxgl.Marker(el)
        .setLngLat([issue.longitude, issue.latitude])
        .setPopup(popup)
        .addTo(globalMap!);
    });
  };

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
