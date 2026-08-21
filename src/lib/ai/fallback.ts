import type {
  FollowUpResult,
  FollowUpTone,
  Lead,
  LeadActivity,
  Property,
  PropertyDescriptionResult,
} from "@/lib/types";
import { money, numberFmt } from "@/lib/format";

function factsBlock(property: Property) {
  const lines = [
    `Title: ${property.title}`,
    `Address: ${property.address}, ${property.city}, ${property.country}`,
    `Type: ${property.propertyType}`,
    `Price: ${money(property.price)}`,
    `Bedrooms: ${property.bedrooms}`,
    `Bathrooms: ${property.bathrooms}`,
    `Interior area: ${numberFmt(property.area)} sq ft`,
    property.yearBuilt ? `Year built: ${property.yearBuilt}` : null,
    property.parking ? `Parking spaces: ${property.parking}` : null,
    `Status: ${property.status}`,
    `Features: ${property.features.join(", ") || "None listed"}`,
    `Factual notes: ${property.description}`,
  ];
  return lines.filter(Boolean).join("\n");
}

export function fallbackPropertyDescription(
  property: Property,
): PropertyDescriptionResult {
  const beds =
    property.bedrooms > 0 ? `${property.bedrooms}-bedroom ` : "";
  const type = property.propertyType.toLowerCase();
  const featureList = property.features.length
    ? property.features.join(", ")
    : "no additional features recorded";
  const parking = property.parking
    ? ` Parking: ${property.parking} space${property.parking > 1 ? "s" : ""}.`
    : "";
  const year = property.yearBuilt ? ` Year built: ${property.yearBuilt}.` : "";

  const headline = `${property.title} — ${beds}${property.propertyType} in ${property.city}`;

  const longDescription = [
    `${property.title} is a ${beds}${type} at ${property.address}, ${property.city}, ${property.country}.`,
    `The interior measures ${numberFmt(property.area)} sq ft, with ${property.bedrooms} bedroom${property.bedrooms === 1 ? "" : "s"} and ${property.bathrooms} bathroom${property.bathrooms === 1 ? "" : "s"}.`,
    `Asking price: ${money(property.price)}. Current listing status: ${property.status}.`,
    `Recorded features: ${featureList}.${year}${parking}`,
    property.description,
    `No amenities, views, or neighborhood claims are added beyond the facts supplied.`,
  ].join(" ");

  const shortDescription = `${beds}${property.propertyType} at ${property.address}, ${property.city}. ${numberFmt(property.area)} sq ft, ${property.bedrooms} bed / ${property.bathrooms} bath. ${money(property.price)}. Features: ${featureList}.`;

  const instagramCaption = `${property.title}, ${property.city}. ${beds}${type}, ${numberFmt(property.area)} sq ft. ${money(property.price)}. Features on file: ${featureList}.`;

  const facebookPost = `Now listed: ${property.title} at ${property.address}, ${property.city}. This ${beds}${type} offers ${numberFmt(property.area)} sq ft, ${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms, priced at ${money(property.price)}. Features recorded in the listing: ${featureList}.${year}${parking} Enquire with Meridian Private Estates for the fact sheet.`;

  const seoDescription = `${property.title} | ${property.propertyType} in ${property.city} | ${property.bedrooms} bed, ${property.bathrooms} bath, ${numberFmt(property.area)} sq ft | ${money(property.price)} | ${property.address}`;

  return {
    headline,
    longDescription,
    shortDescription,
    instagramCaption,
    facebookPost,
    seoDescription,
  };
}

export function fallbackSocialPost(property: Property) {
  const desc = fallbackPropertyDescription(property);
  return {
    instagram: desc.instagramCaption,
    facebook: desc.facebookPost,
    headline: desc.headline,
  };
}

export function fallbackEmailCampaign(property: Property) {
  const desc = fallbackPropertyDescription(property);
  return {
    subject: `${property.title} — ${property.city} listing update`,
    preheader: `${money(property.price)} · ${property.bedrooms} bed · ${numberFmt(property.area)} sq ft`,
    body: `Dear client,\n\nWe are sharing a listing that matches facts already on file.\n\n${desc.longDescription}\n\nIf this is relevant to your brief, reply and we will arrange a viewing. We will not add claims that are not in the listing.\n\nMeridian Private Estates`,
  };
}

function toneWrap(tone: FollowUpTone, text: string) {
  switch (tone) {
    case "Friendly":
      return text.replace("Kind regards", "Warmly");
    case "Urgent":
      return `Time-sensitive.\n\n${text}`;
    case "Luxury":
      return text.replace("Kind regards", "With discretion,\nMeridian Private Estates");
    default:
      return text;
  }
}

export function fallbackFollowUp(
  lead: Lead,
  property: Property | undefined,
  activities: LeadActivity[],
  tone: FollowUpTone,
): FollowUpResult {
  const last = activities[0];
  const propertyLine = property
    ? `${property.title} at ${property.address}, ${property.city} (${money(property.price)})`
    : `homes in ${lead.preferredLocation} of type ${lead.propertyType}`;
  const activityLine = last
    ? `Last recorded touch: ${last.title} — ${last.body}`
    : "No prior interaction is on file.";

  const emailBody = toneWrap(
    tone,
    `Hello ${lead.name.split(" ")[0]},\n\nThank you for your interest. Based on your brief (${lead.propertyType} in ${lead.preferredLocation}, budget ${money(lead.budgetMin)}–${money(lead.budgetMax)}, timeline: ${lead.timeline}), I wanted to follow up regarding ${propertyLine}.\n\n${activityLine}\n\nSuggested next step: ${lead.nextAction}\n\nI will only reference facts already captured in our file.\n\nKind regards\nMeridian Private Estates`,
  );

  const sms = `Hi ${lead.name.split(" ")[0]}, this is Meridian re ${property ? property.title : lead.preferredLocation}. Budget ${money(lead.budgetMax)} / ${lead.timeline}. Next: ${lead.nextAction.slice(0, 80)}`;

  const whatsapp = `Hello ${lead.name.split(" ")[0]} — checking in from Meridian Private Estates. Your brief: ${lead.propertyType} in ${lead.preferredLocation}. ${property ? `Property on file: ${property.title}, ${money(property.price)}.` : ""} ${last ? `Last note: ${last.title}.` : ""} Shall I lock a viewing?`;

  return {
    email: {
      subject:
        tone === "Urgent"
          ? `Action needed: ${property?.title ?? lead.preferredLocation}`
          : `Following up — ${property?.title ?? lead.preferredLocation}`,
      body: emailBody,
    },
    sms: sms.slice(0, 280),
    whatsapp,
  };
}

export { factsBlock };
