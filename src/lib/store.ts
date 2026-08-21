"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SEED_VERSION } from "@/lib/constants";
import { createSeedData } from "@/lib/demo-data";
import { nid } from "@/lib/format";
import { scoreLead } from "@/lib/ai/scoring";
import type {
  Agent,
  AIGeneration,
  Appointment,
  Contact,
  CRMSnapshot,
  Deal,
  Lead,
  LeadActivity,
  LeadStatus,
  Property,
  PropertyImage,
  Task,
  Workspace,
} from "@/lib/types";

type CRMState = CRMSnapshot & {
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  resetDemo: () => void;
  updateWorkspace: (patch: Partial<Workspace>) => void;
  upsertAgent: (agent: Agent) => void;
  addProperty: (
    property: Omit<Property, "id" | "createdAt" | "updatedAt" | "workspaceId" | "views" | "listedAt"> & {
      imageUrls?: string[];
    },
  ) => string;
  updateProperty: (id: string, patch: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  addLead: (
    lead: Omit<Lead, "id" | "createdAt" | "updatedAt" | "workspaceId" | "score" | "scoreReason" | "nextAction">,
  ) => string;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  updateLeadStatus: (id: string, status: LeadStatus, agentId: string) => void;
  deleteLead: (id: string) => void;
  rescoreLead: (id: string) => void;
  addActivity: (activity: Omit<LeadActivity, "id" | "createdAt">) => void;
  addContact: (contact: Omit<Contact, "id" | "createdAt" | "updatedAt" | "workspaceId">) => string;
  updateContact: (id: string, patch: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  addDeal: (deal: Omit<Deal, "id" | "createdAt" | "updatedAt" | "workspaceId">) => string;
  updateDeal: (id: string, patch: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  addAppointment: (
    apt: Omit<Appointment, "id" | "createdAt" | "updatedAt" | "workspaceId">,
  ) => string;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "workspaceId">) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addGeneration: (gen: Omit<AIGeneration, "id" | "createdAt" | "workspaceId">) => void;
  imagesFor: (propertyId: string) => PropertyImage[];
  agentById: (id: string) => Agent | undefined;
  propertyById: (id: string) => Property | undefined;
  leadById: (id: string) => Lead | undefined;
};

function stamp() {
  return new Date().toISOString();
}

function withSeed(seed: CRMSnapshot): Omit<
  CRMState,
  | "hydrated"
  | "setHydrated"
  | "resetDemo"
  | "updateWorkspace"
  | "upsertAgent"
  | "addProperty"
  | "updateProperty"
  | "deleteProperty"
  | "addLead"
  | "updateLead"
  | "updateLeadStatus"
  | "deleteLead"
  | "rescoreLead"
  | "addActivity"
  | "addContact"
  | "updateContact"
  | "deleteContact"
  | "addDeal"
  | "updateDeal"
  | "deleteDeal"
  | "addAppointment"
  | "updateAppointment"
  | "deleteAppointment"
  | "addTask"
  | "updateTask"
  | "toggleTask"
  | "deleteTask"
  | "addGeneration"
  | "imagesFor"
  | "agentById"
  | "propertyById"
  | "leadById"
> {
  return seed;
}

export const useCRM = create<CRMState>()(
  persist(
    (set, get) => ({
      ...withSeed(createSeedData()),
      hydrated: false,
      setHydrated: (v) => set((s) => (s.hydrated === v ? s : { hydrated: v })),
      resetDemo: () => set({ ...createSeedData(), hydrated: true }),
      updateWorkspace: (patch) =>
        set((s) => ({
          workspace: { ...s.workspace, ...patch, updatedAt: stamp() },
        })),
      upsertAgent: (agent) =>
        set((s) => {
          const exists = s.agents.some((a) => a.id === agent.id);
          return {
            agents: exists
              ? s.agents.map((a) => (a.id === agent.id ? agent : a))
              : [...s.agents, agent],
          };
        }),
      addProperty: (input) => {
        const id = nid("prp");
        const t = stamp();
        const { imageUrls = [], ...rest } = input;
        const property: Property = {
          ...rest,
          id,
          workspaceId: get().workspace.id,
          views: 0,
          listedAt: t,
          createdAt: t,
          updatedAt: t,
        };
        const images: PropertyImage[] = imageUrls.map((url, i) => ({
          id: nid("img"),
          propertyId: id,
          url,
          alt: `${property.title} — photo ${i + 1}`,
          sortOrder: i,
        }));
        set((s) => ({
          properties: [property, ...s.properties],
          propertyImages: [...images, ...s.propertyImages],
        }));
        return id;
      },
      updateProperty: (id, patch) =>
        set((s) => ({
          properties: s.properties.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: stamp() } : p,
          ),
        })),
      deleteProperty: (id) =>
        set((s) => ({
          properties: s.properties.filter((p) => p.id !== id),
          propertyImages: s.propertyImages.filter((i) => i.propertyId !== id),
        })),
      addLead: (input) => {
        const id = nid("led");
        const t = stamp();
        const lead: Lead = {
          ...input,
          id,
          workspaceId: get().workspace.id,
          score: 0,
          scoreReason: "",
          nextAction: "",
          createdAt: t,
          updatedAt: t,
        };
        const scored = scoreLead(lead, get().properties, []);
        const saved = {
          ...lead,
          score: scored.score,
          scoreReason: scored.reason,
          nextAction: scored.nextAction,
        };
        set((s) => ({ leads: [saved, ...s.leads] }));
        return id;
      },
      updateLead: (id, patch) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id ? { ...l, ...patch, updatedAt: stamp() } : l,
          ),
        })),
      updateLeadStatus: (id, status, agentId) => {
        const prev = get().leads.find((l) => l.id === id);
        if (!prev) return;
        const t = stamp();
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id ? { ...l, status, updatedAt: t, lastContactedAt: t } : l,
          ),
          leadActivities: [
            {
              id: nid("act"),
              leadId: id,
              agentId,
              type: "status_change",
              title: `Moved to ${status}`,
              body: `Pipeline status changed from ${prev.status} to ${status}.`,
              createdAt: t,
            },
            ...s.leadActivities,
          ],
        }));
        get().rescoreLead(id);
      },
      deleteLead: (id) =>
        set((s) => ({
          leads: s.leads.filter((l) => l.id !== id),
          leadActivities: s.leadActivities.filter((a) => a.leadId !== id),
        })),
      rescoreLead: (id) => {
        const lead = get().leads.find((l) => l.id === id);
        if (!lead) return;
        const acts = get().leadActivities.filter((a) => a.leadId === id);
        const result = scoreLead(lead, get().properties, acts);
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id
              ? {
                  ...l,
                  score: result.score,
                  scoreReason: result.reason,
                  nextAction: result.nextAction,
                  updatedAt: stamp(),
                }
              : l,
          ),
        }));
      },
      addActivity: (activity) =>
        set((s) => ({
          leadActivities: [
            { ...activity, id: nid("act"), createdAt: stamp() },
            ...s.leadActivities,
          ],
        })),
      addContact: (input) => {
        const id = nid("ctc");
        const t = stamp();
        set((s) => ({
          contacts: [
            { ...input, id, workspaceId: s.workspace.id, createdAt: t, updatedAt: t },
            ...s.contacts,
          ],
        }));
        return id;
      },
      updateContact: (id, patch) =>
        set((s) => ({
          contacts: s.contacts.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: stamp() } : c,
          ),
        })),
      deleteContact: (id) =>
        set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),
      addDeal: (input) => {
        const id = nid("deal");
        const t = stamp();
        set((s) => ({
          deals: [
            { ...input, id, workspaceId: s.workspace.id, createdAt: t, updatedAt: t },
            ...s.deals,
          ],
        }));
        return id;
      },
      updateDeal: (id, patch) =>
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === id ? { ...d, ...patch, updatedAt: stamp() } : d,
          ),
        })),
      deleteDeal: (id) =>
        set((s) => ({ deals: s.deals.filter((d) => d.id !== id) })),
      addAppointment: (input) => {
        const id = nid("apt");
        const t = stamp();
        set((s) => ({
          appointments: [
            { ...input, id, workspaceId: s.workspace.id, createdAt: t, updatedAt: t },
            ...s.appointments,
          ],
        }));
        return id;
      },
      updateAppointment: (id, patch) =>
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, ...patch, updatedAt: stamp() } : a,
          ),
        })),
      deleteAppointment: (id) =>
        set((s) => ({
          appointments: s.appointments.filter((a) => a.id !== id),
        })),
      addTask: (input) => {
        const id = nid("tsk");
        const t = stamp();
        set((s) => ({
          tasks: [
            { ...input, id, workspaceId: s.workspace.id, createdAt: t, updatedAt: t },
            ...s.tasks,
          ],
        }));
        return id;
      },
      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: stamp() } : t,
          ),
        })),
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed, updatedAt: stamp() } : t,
          ),
        })),
      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      addGeneration: (gen) =>
        set((s) => ({
          aiGenerations: [
            {
              ...gen,
              id: nid("ai"),
              workspaceId: s.workspace.id,
              createdAt: stamp(),
            },
            ...s.aiGenerations,
          ],
        })),
      imagesFor: (propertyId) =>
        get()
          .propertyImages.filter((i) => i.propertyId === propertyId)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      agentById: (id) => get().agents.find((a) => a.id === id),
      propertyById: (id) => get().properties.find((p) => p.id === id),
      leadById: (id) => get().leads.find((l) => l.id === id),
    }),
    {
      name: "proppilot-crm",
      storage: createJSONStorage(() => localStorage),
      version: SEED_VERSION,
      migrate: () => createSeedData(),
      partialize: (state) => ({
        seedVersion: state.seedVersion,
        workspace: state.workspace,
        agents: state.agents,
        properties: state.properties,
        propertyImages: state.propertyImages,
        contacts: state.contacts,
        leads: state.leads,
        leadActivities: state.leadActivities,
        deals: state.deals,
        appointments: state.appointments,
        tasks: state.tasks,
        aiGenerations: state.aiGenerations,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
