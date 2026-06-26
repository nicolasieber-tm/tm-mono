type ContactSource = {
  contact_person?: string | null;
  contact_person_first_name?: string | null;
  contact_person_last_name?: string | null;
};

function parseLegacy(value: string | null | undefined): { firstName: string; lastName: string } {
  const parts = (value ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: "", lastName: parts[0] };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}

export function resolveContactFirstName(entity: ContactSource | null | undefined): string {
  const direct = entity?.contact_person_first_name?.trim();
  if (direct) return direct;
  return parseLegacy(entity?.contact_person).firstName;
}

export function resolveContactLastName(entity: ContactSource | null | undefined): string {
  const direct = entity?.contact_person_last_name?.trim();
  if (direct) return direct;
  return parseLegacy(entity?.contact_person).lastName;
}

export function resolveContactFullName(entity: ContactSource | null | undefined): string {
  const first = resolveContactFirstName(entity);
  const last = resolveContactLastName(entity);
  const composed = [first, last].filter(Boolean).join(" ");
  if (composed) return composed;
  return entity?.contact_person?.trim() ?? "";
}
