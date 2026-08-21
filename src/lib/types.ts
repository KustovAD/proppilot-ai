export type PropertyType =
  | "Apartment"
  | "Villa"
  | "Townhouse"
  | "Penthouse"
  | "House"
  | "Commercial"
  | "Land";

export type PropertyStatus =
  | "Draft"
  | "Active"
  | "Under Offer"
  | "Sold"
  | "Archived";

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Viewing"
  | "Negotiating"
  | "Won"
  | "Lost";

export type LeadSource =
  | "Website"
  | "Referral"
  | "Instagram"
  | "Open House"
  | "Partner"
  | "Cold Call"
  | "Portal";

export type AppointmentType =
  | "Property Viewing"
  | "Call"
  | "Meeting"
  | "Follow-up";

export type DealStage =
  | "Qualified"
  | "Proposal"
  | "Negotiation"
  | "Due Diligence"
  | "Closed Won"
  | "Closed Lost";

export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export type ActivityType =
  | "note"
  | "call"
  | "email"
  | "viewing"
  | "status_change"
  | "ai_score"
  | "follow_up";

export type FollowUpTone = "Friendly" | "Professional" | "Urgent" | "Luxury";

export type FollowUpChannel = "email" | "sms" | "whatsapp";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  plan: "atelier" | "maison" | "private";
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  city: string;
  bio: string;
  avatarUrl: string;
  role: "owner" | "admin" | "agent";
  specializations: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  workspaceId: string;
  title: string;
  address: string;
  city: string;
  country: string;
  price: number;
  currency: "USD";
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string;
  features: string[];
  status: PropertyStatus;
  agentId: string;
  yearBuilt?: number;
  parking?: number;
  views: number;
  listedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  alt: string;
  sortOrder: number;
}

export interface Contact {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  city: string;
  type: "Buyer" | "Seller" | "Investor" | "Partner";
  notes: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  phone: string;
  budgetMin: number;
  budgetMax: number;
  preferredLocation: string;
  propertyType: PropertyType;
  source: LeadSource;
  status: LeadStatus;
  assignedAgentId: string;
  interestedPropertyId?: string;
  contactId?: string;
  timeline: string;
  notes: string;
  score: number;
  scoreReason: string;
  nextAction: string;
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  agentId: string;
  type: ActivityType;
  title: string;
  body: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  workspaceId: string;
  title: string;
  leadId: string;
  propertyId: string;
  agentId: string;
  stage: DealStage;
  value: number;
  commissionRate: number;
  expectedClose: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  workspaceId: string;
  title: string;
  type: AppointmentType;
  startAt: string;
  endAt: string;
  location: string;
  notes: string;
  agentId: string;
  leadId?: string;
  propertyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  dueAt: string;
  priority: TaskPriority;
  completed: boolean;
  agentId: string;
  leadId?: string;
  propertyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIGeneration {
  id: string;
  workspaceId: string;
  kind:
    | "property_description"
    | "social_post"
    | "email_campaign"
    | "lead_score"
    | "follow_up";
  targetType: "property" | "lead";
  targetId: string;
  prompt: string;
  output: string;
  model: string;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Agent["role"];
  agentId: string;
  workspaceId: string;
  avatarUrl: string;
}

export interface PropertyDescriptionResult {
  headline: string;
  longDescription: string;
  shortDescription: string;
  instagramCaption: string;
  facebookPost: string;
  seoDescription: string;
}

export interface LeadScoreResult {
  score: number;
  reason: string;
  nextAction: string;
  breakdown: {
    budgetFit: number;
    locationFit: number;
    preferenceFit: number;
    engagement: number;
    timeline: number;
    interactions: number;
  };
}

export interface FollowUpResult {
  email: { subject: string; body: string };
  sms: string;
  whatsapp: string;
}

export interface CRMSnapshot {
  seedVersion: number;
  workspace: Workspace;
  agents: Agent[];
  properties: Property[];
  propertyImages: PropertyImage[];
  contacts: Contact[];
  leads: Lead[];
  leadActivities: LeadActivity[];
  deals: Deal[];
  appointments: Appointment[];
  tasks: Task[];
  aiGenerations: AIGeneration[];
}
