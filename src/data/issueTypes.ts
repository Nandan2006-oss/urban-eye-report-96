import { AlertCircle, Trash2, Lightbulb, Droplet, Car, Construction, PawPrint, CloudRain } from "lucide-react";

export interface IssueType {
  id: string;
  name: string;
  description: string;
  icon: any;
  defaultDescription: string;
}

export const issueTypes: IssueType[] = [
  {
    id: "pothole",
    name: "Pothole",
    description: "Road damage that needs repair",
    icon: AlertCircle,
    defaultDescription: "There is a pothole on the road that poses a safety hazard for vehicles and pedestrians. Immediate repair is needed to prevent accidents."
  },
  {
    id: "garbage",
    name: "Garbage Dump",
    description: "Illegal or overflowing garbage",
    icon: Trash2,
    defaultDescription: "Garbage has been dumped illegally or waste bins are overflowing in this area. This needs immediate attention for public health and cleanliness."
  },
  {
    id: "streetlight",
    name: "Broken Streetlight",
    description: "Non-functional street lighting",
    icon: Lightbulb,
    defaultDescription: "The streetlight at this location is not working. This creates safety concerns during nighttime and needs urgent repair."
  },
  {
    id: "water-leakage",
    name: "Water Leakage",
    description: "Pipe leakage or water wastage",
    icon: Droplet,
    defaultDescription: "There is a water leakage from a pipe or water main. This is causing water wastage and potential damage to the surrounding area."
  },
  {
    id: "illegal-parking",
    name: "Illegal Parking",
    description: "Vehicles blocking public spaces",
    icon: Car,
    defaultDescription: "Vehicles are parked illegally, blocking public access or creating traffic congestion in this area."
  },
  {
    id: "open-manhole",
    name: "Open Manhole",
    description: "Uncovered manhole posing danger",
    icon: Construction,
    defaultDescription: "An open or damaged manhole cover poses a serious safety risk to pedestrians and vehicles. Immediate action required."
  },
  {
    id: "stray-animals",
    name: "Stray Animals",
    description: "Stray animals causing issues",
    icon: PawPrint,
    defaultDescription: "Stray animals in this area are causing disturbance or pose safety concerns for residents and pedestrians."
  },
  {
    id: "flooding",
    name: "Flooding / Waterlogging",
    description: "Water accumulation in public areas",
    icon: CloudRain,
    defaultDescription: "Water accumulation or flooding in this area is causing inconvenience and potential health hazards. Drainage improvement needed."
  }
];
