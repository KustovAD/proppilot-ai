"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageHeader, EmptyState, Field, NativeSelect } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCRM } from "@/lib/store";
import { contactSchema, type ContactInput } from "@/lib/validations";

export default function ContactsPage() {
  const contacts = useCRM((s) => s.contacts);
  const agents = useCRM((s) => s.agents);
  const addContact = useCRM((s) => s.addContact);
  const deleteContact = useCRM((s) => s.deleteContact);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      type: "Buyer",
      agentId: agents[0]?.id ?? "",
      notes: "",
    },
  });

  const filtered = useMemo(
    () =>
      contacts.filter((c) =>
        `${c.name} ${c.email} ${c.city} ${c.type}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [contacts, q],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Book"
        title="Contacts"
        description="Buyers, sellers, investors, and introducers attached to the house."
        actions={
          <Button className="h-9" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            New contact
          </Button>
        }
      />
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search contacts…" className="max-w-sm" />
      {filtered.length === 0 ? (
        <EmptyState title="No contacts" description="Add a private-client record to the book." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-foreground/8">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.email} · {c.phone}
                    </p>
                  </td>
                  <td className="px-4 py-3">{c.type}</td>
                  <td className="px-4 py-3">{c.city}</td>
                  <td className="px-4 py-3">{agents.find((a) => a.id === c.agentId)?.name}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => deleteContact(c.id)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New contact</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={form.handleSubmit((values) => {
              addContact({ ...values, notes: values.notes ?? "" });
              toast.success("Contact added");
              setOpen(false);
              form.reset();
            })}
          >
            <Field label="Name" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email">
                <Input type="email" {...form.register("email")} />
              </Field>
              <Field label="Phone">
                <Input {...form.register("phone")} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City">
                <Input {...form.register("city")} />
              </Field>
              <Field label="Type">
                <NativeSelect {...form.register("type")}>
                  <option>Buyer</option>
                  <option>Seller</option>
                  <option>Investor</option>
                  <option>Partner</option>
                </NativeSelect>
              </Field>
            </div>
            <Field label="Agent">
              <NativeSelect {...form.register("agentId")}>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Notes">
              <Textarea rows={3} {...form.register("notes")} />
            </Field>
            <Button type="submit">Save contact</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
