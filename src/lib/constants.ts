import type {
  AppointmentType,
  DealStage,
  FollowUpTone,
  LeadSource,
  LeadStatus,
  PropertyStatus,
  PropertyType,
  TaskPriority,
} from "@/lib/types";

export const APP_NAME = "PropPilot AI";
export const APP_TAGLINE = "Private client CRM for modern real estate houses.";

export const DEMO_EMAIL = "oscar.d@example.net";
export const DEMO_PASSWORD = "demo1234";

export const SEED_VERSION = 3;

export const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Townhouse",
  "Penthouse",
  "House",
  "Commercial",
  "Land",
] as const satisfies readonly PropertyType[];

export const PROPERTY_STATUSES = [
  "Draft",
  "Active",
  "Under Offer",
  "Sold",
  "Archived",
] as const satisfies readonly PropertyStatus[];

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Viewing",
  "Negotiating",
  "Won",
  "Lost",
] as const satisfies readonly LeadStatus[];

export const LEAD_SOURCES = [
  "Website",
  "Referral",
  "Instagram",
  "Open House",
  "Partner",
  "Cold Call",
  "Portal",
] as const satisfies readonly LeadSource[];

export const APPOINTMENT_TYPES = [
  "Property Viewing",
  "Call",
  "Meeting",
  "Follow-up",
] as const satisfies readonly AppointmentType[];

export const DEAL_STAGES = [
  "Qualified",
  "Proposal",
  "Negotiation",
  "Due Diligence",
  "Closed Won",
  "Closed Lost",
] as const satisfies readonly DealStage[];

export const TASK_PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Urgent",
] as const satisfies readonly TaskPriority[];

export const FOLLOW_UP_TONES = [
  "Friendly",
  "Professional",
  "Urgent",
  "Luxury",
] as const satisfies readonly FollowUpTone[];

export const CITIES = [
  "London",
  "Dubai",
  "New York",
  "Miami",
  "Los Angeles",
  "Paris",
  "Barcelona",
  "Singapore",
  "Sydney",
  "Toronto",
] as const;
