"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, NativeSelect } from "@/components/ui-kit";
import { formResolver, propertySchema, type PropertyInput } from "@/lib/validations";
import { PROPERTY_STATUSES, PROPERTY_TYPES } from "@/lib/constants";
import { useCRM } from "@/lib/store";
import type { Property } from "@/lib/types";

export function PropertyFormDialog({
  open,
  onOpenChange,
  property,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  property?: Property;
  onSaved?: (id: string) => void;
}) {
  const agents = useCRM((s) => s.agents);
  const addProperty = useCRM((s) => s.addProperty);
  const updateProperty = useCRM((s) => s.updateProperty);
  const form = useForm<PropertyInput>({
    resolver: formResolver(propertySchema),
    values: property
      ? {
          title: property.title,
          address: property.address,
          city: property.city,
          country: property.country,
          price: property.price,
          propertyType: property.propertyType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
          description: property.description,
          features: property.features.join(", "),
          status: property.status,
          agentId: property.agentId,
          yearBuilt: property.yearBuilt,
          parking: property.parking,
        }
      : {
          title: "",
          address: "",
          city: "",
          country: "",
          price: 0,
          propertyType: "Apartment",
          bedrooms: 1,
          bathrooms: 1,
          area: 800,
          description: "",
          features: "",
          status: "Draft",
          agentId: agents[0]?.id ?? "",
        },
  });

  function onSubmit(values: PropertyInput) {
    const features = values.features
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    if (property) {
      updateProperty(property.id, { ...values, features });
      onSaved?.(property.id);
    } else {
      const id = addProperty({
        ...values,
        features,
        currency: "USD",
        imageUrls: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80",
        ],
      });
      onSaved?.(id);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{property ? "Edit listing" : "New listing"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <Field label="Title" error={form.formState.errors.title?.message}>
            <Input {...form.register("title")} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Address" error={form.formState.errors.address?.message}>
              <Input {...form.register("address")} />
            </Field>
            <Field label="City" error={form.formState.errors.city?.message}>
              <Input {...form.register("city")} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Country">
              <Input {...form.register("country")} />
            </Field>
            <Field label="Price (USD)" error={form.formState.errors.price?.message}>
              <Input type="number" {...form.register("price")} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Type">
              <NativeSelect {...form.register("propertyType")}>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Status">
              <NativeSelect {...form.register("status")}>
                {PROPERTY_STATUSES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Agent">
              <NativeSelect {...form.register("agentId")}>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="Beds">
              <Input type="number" {...form.register("bedrooms")} />
            </Field>
            <Field label="Baths">
              <Input type="number" {...form.register("bathrooms")} />
            </Field>
            <Field label="Sq ft">
              <Input type="number" {...form.register("area")} />
            </Field>
            <Field label="Parking">
              <Input type="number" {...form.register("parking")} />
            </Field>
          </div>
          <Field label="Features (comma separated)">
            <Input {...form.register("features")} />
          </Field>
          <Field label="Factual description" error={form.formState.errors.description?.message}>
            <Textarea rows={4} {...form.register("description")} />
          </Field>
          <Button type="submit" className="h-9">
            Save listing
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
