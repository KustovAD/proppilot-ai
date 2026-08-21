import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from "date-fns";

export function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: value >= 1_000_000 ? 0 : 0,
  }).format(value);
}

export function compactMoney(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value >= 10_000_000 ? 1 : 2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return money(value);
}

export function numberFmt(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function areaFmt(sqft: number) {
  return `${numberFmt(sqft)} sq ft`;
}

export function dateFmt(iso: string) {
  return format(parseISO(iso), "MMM d, yyyy");
}

export function dateTimeFmt(iso: string) {
  return format(parseISO(iso), "MMM d, yyyy · h:mm a");
}

export function timeFmt(iso: string) {
  return format(parseISO(iso), "h:mm a");
}

export function relativeFmt(iso: string) {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}

export function dayLabel(iso: string) {
  const d = parseISO(iso);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEEE, MMM d");
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function nid(prefix: string) {
  const rand =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
      : Math.random().toString(36).slice(2, 12);
  return `${prefix}_${rand}`;
}
