import type { FieldValues, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  APPOINTMENT_TYPES,
  DEAL_STAGES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  TASK_PRIORITIES,
} from "@/lib/constants";

export function formResolver<TFieldValues extends FieldValues>(
  schema: z.ZodType,
): Resolver<TFieldValues> {
  return zodResolver(schema as never) as Resolver<TFieldValues>;
}

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  workspaceName: z.string().min(2, "Agency name is required"),
});

export const propertySchema = z.object({
  title: z.string().min(3, "Title is required"),
  address: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  propertyType: z.enum(PROPERTY_TYPES),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  area: z.coerce.number().positive("Area is required"),
  description: z.string().min(10, "Add a factual description"),
  features: z.string().min(2, "Add at least one feature"),
  status: z.enum(PROPERTY_STATUSES),
  agentId: z.string().min(1, "Assign an agent"),
  yearBuilt: z.coerce.number().optional(),
  parking: z.coerce.number().optional(),
});

export const leadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(6, "Phone is required"),
  budgetMin: z.coerce.number().min(0),
  budgetMax: z.coerce.number().positive(),
  preferredLocation: z.string().min(2),
  propertyType: z.enum(PROPERTY_TYPES),
  source: z.enum(LEAD_SOURCES),
  status: z.enum(LEAD_STATUSES),
  assignedAgentId: z.string().min(1),
  interestedPropertyId: z.string().optional(),
  timeline: z.string().min(2),
  notes: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  company: z.string().optional(),
  city: z.string().min(2),
  type: z.enum(["Buyer", "Seller", "Investor", "Partner"]),
  notes: z.string().optional(),
  agentId: z.string().min(1),
});

export const dealSchema = z.object({
  title: z.string().min(3),
  leadId: z.string().min(1),
  propertyId: z.string().min(1),
  agentId: z.string().min(1),
  stage: z.enum(DEAL_STAGES),
  value: z.coerce.number().positive(),
  commissionRate: z.coerce.number().min(0).max(20),
  expectedClose: z.string().min(4),
  notes: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  dueAt: z.string().min(4),
  priority: z.enum(TASK_PRIORITIES),
  agentId: z.string().min(1),
  leadId: z.string().optional(),
  propertyId: z.string().optional(),
});

export const appointmentSchema = z.object({
  title: z.string().min(3),
  type: z.enum(APPOINTMENT_TYPES),
  startAt: z.string().min(4),
  endAt: z.string().min(4),
  location: z.string().min(2),
  notes: z.string().optional(),
  agentId: z.string().min(1),
  leadId: z.string().optional(),
  propertyId: z.string().optional(),
});

export const followUpSchema = z.object({
  leadId: z.string(),
  tone: z.enum(["Friendly", "Professional", "Urgent", "Luxury"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type DealInput = z.infer<typeof dealSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
