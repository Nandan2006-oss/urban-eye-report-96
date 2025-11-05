import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, MapPin } from "lucide-react";

// Fix Leaflet default marker icon issue
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks and update marker position
interface LocationMarkerProps {
  position: LatLngExpression | null;
  setPosition: (position: LatLngExpression) => void;
}

const LocationMarker = ({ position, setPosition }: LocationMarkerProps) => {
  // Listen for map click events
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

const ReportIssue = () => {
  // Authentication state
  const [user, setUser] = useState<any>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  // Map and location state
  const [markerPosition, setMarkerPosition] = useState<LatLngExpression | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([12.9716, 77.5946]); // Default: Bangalore
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication status on mount

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  /**
   * Get user's current location using browser geolocation API
   * Updates map center and marker position
   */
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition: LatLngExpression = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setMapCenter(newPosition);
          setMarkerPosition(newPosition);
          toast({
            title: "Location detected",
            description: "Your current location has been set on the map",
          });
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Could not get your location. Please click on the map to set location.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Not supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
    }
  };

  /**
   * Handle image file selection
   * Creates preview URL for selected image
   */

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handle form submission
   * Uploads image to Supabase Storage and creates issue in database
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that user is authenticated
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to report an issue",
        variant: "destructive",
      });
      return;
    }

    // Validate that location is set
    if (!markerPosition) {
      toast({
        title: "Location required",
        description: "Please click on the map or use current location to set the issue location",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;

      // Upload image to Supabase Storage if image is selected
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('issue-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        // Get public URL for the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from('issue-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Extract latitude and longitude from marker position
      const latitude = parseFloat((markerPosition as [number, number])[0].toString());
      const longitude = parseFloat((markerPosition as [number, number])[1].toString());

      // Insert issue into database
      const { error: insertError } = await supabase
        .from('issues')
        .insert([
          {
            title,
            description,
            latitude,
            longitude,
            image_url: imageUrl,
            created_by: user.id,
          },
        ]);

      if (insertError) throw insertError;

      // Show success message
      toast({
        title: "Issue reported!",
        description: "Your civic issue has been successfully reported.",
      });

      // Redirect to user's reports page
      navigate("/my-reports");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Report a Civic Issue</CardTitle>
              <CardDescription>
                Help make your city better by reporting problems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Large pothole on Main Street"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Description Textarea */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label htmlFor="image">Upload Photo</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="image" className="cursor-pointer">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload an image of the issue
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Location Picker Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Location</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Use Current Location
                    </Button>
                  </div>
                  
                  {/* Map Container */}
                  <div className="h-[400px] rounded-lg overflow-hidden border">
                    <MapContainer
                      center={mapCenter}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                      key={`${mapCenter[0]}-${mapCenter[1]}`}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker position={markerPosition} setPosition={setMarkerPosition} />
                    </MapContainer>
                  </div>

                  {/* Display selected coordinates */}
                  {markerPosition && (
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      <p className="font-medium mb-1">Selected Location:</p>
                      <p>Latitude: {(markerPosition as [number, number])[0].toFixed(6)}</p>
                      <p>Longitude: {(markerPosition as [number, number])[1].toFixed(6)}</p>
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground">
                    Click on the map to set the issue location or use your current location
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Issue"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
