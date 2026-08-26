import { Member, Relationship, ValidationIssue, ValidationReport } from "./types";

export function normalizeName(value: string | undefined) {
  return String(value || "").trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

export function normalizeEmail(value: string | undefined) {
  return String(value || "").trim().toLocaleLowerCase();
}

export function validateNetwork(members: Member[], relationships: Relationship[]): ValidationReport {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const memberIds = new Set(members.map(m => m.id));
  const pairKeys = new Set<string>();
  const parentEdges = new Map<string, string[]>();

  for (const m of members) {
    if (!m.id) errors.push({ severity: "error", code: "MEMBER_ID_MISSING", message: `Member "${m.full_name}" has no ID.` });
    if (!m.full_name.trim()) errors.push({ severity: "error", code: "MEMBER_NAME_MISSING", message: "A member is missing a name.", memberId: m.id });
    if (!Number.isInteger(m.generation_level) || m.generation_level < 1) {
      errors.push({ severity: "error", code: "INVALID_GENERATION", message: `Invalid generation for ${m.full_name}.`, memberId: m.id });
    }
    if (m.date_of_birth && m.date_of_death && m.date_of_death < m.date_of_birth) {
      errors.push({ severity: "error", code: "INVALID_LIFE_DATES", message: `Date of death is before date of birth for ${m.full_name}.`, memberId: m.id });
    }
  }

  const duplicateNames = new Map<string, Member[]>();
  const duplicateEmails = new Map<string, Member[]>();
  for (const m of members) {
    const name = normalizeName(m.full_name);
    if (name) duplicateNames.set(name, [...(duplicateNames.get(name) || []), m]);
    const email = normalizeEmail(m.email);
    if (email) duplicateEmails.set(email, [...(duplicateEmails.get(email) || []), m]);
  }
  duplicateNames.forEach((group: Member[], name: string) => {
    if (group.length > 1) {
      const sameDob = new Set<string>(group.map((m: Member) => m.date_of_birth || "")).size === 1 && !!group[0].date_of_birth;
      warnings.push({ severity: "warning", code: sameDob ? "DUPLICATE_NAME_DOB" : "DUPLICATE_NAME", message: `Possible duplicate members share the name "${name}" (${group.length} records).`, memberId: group[0].id });
    }
  });
  duplicateEmails.forEach((group: Member[]) => {
    if (group.length > 1) warnings.push({ severity: "warning", code: "DUPLICATE_EMAIL", message: `The same email is assigned to multiple members: ${group.map((m: Member) => m.full_name).join(", ")}.`, memberId: group[0].id });
  });

  for (const r of relationships) {
    if (!memberIds.has(r.person_id) || !memberIds.has(r.related_person_id)) {
      errors.push({ severity: "error", code: "ORPHAN_RELATIONSHIP", message: "Relationship references a member that does not exist.", relationshipId: r.id });
      continue;
    }
    if (r.person_id === r.related_person_id) {
      errors.push({ severity: "error", code: "SELF_RELATIONSHIP", message: "A member cannot be related to themselves.", relationshipId: r.id, memberId: r.person_id });
      continue;
    }
    const key = r.relationship_type === "spouse"
      ? `${r.relationship_type}|${[r.person_id, r.related_person_id].sort().join("|")}`
      : `parent|${r.relationship_type === "parent" ? r.person_id : r.related_person_id}|${r.relationship_type === "parent" ? r.related_person_id : r.person_id}`;
    if (pairKeys.has(key)) errors.push({ severity: "error", code: "DUPLICATE_RELATIONSHIP", message: "Duplicate relationship detected.", relationshipId: r.id });
    pairKeys.add(key);

    if (r.relationship_type === "parent") {
      const parents = parentEdges.get(r.person_id) || [];
      parentEdges.set(r.person_id, [...parents, r.related_person_id]);
      const parent = members.find(m => m.id === r.person_id);
      const child = members.find(m => m.id === r.related_person_id);
      if (parent && child && parent.generation_level >= child.generation_level) {
        errors.push({ severity: "error", code: "GENERATION_ORDER", message: `${parent.full_name} is marked as a parent of ${child.full_name}, but their generation levels are ${parent.generation_level} → ${child.generation_level}. Parent must be in an earlier generation.`, relationshipId: r.id });
      }
    } else if (r.relationship_type === "child") {
      const parent = members.find(m => m.id === r.related_person_id);
      const child = members.find(m => m.id === r.person_id);
      if (parent && child && parent.generation_level >= child.generation_level) {
        errors.push({ severity: "error", code: "GENERATION_ORDER", message: `${parent.full_name} is marked as a parent of ${child.full_name}, but their generation levels are ${parent.generation_level} → ${child.generation_level}.`, relationshipId: r.id });
      }
    } else {
      const aMember = members.find(m => m.id === r.person_id);
      const bMember = members.find(m => m.id === r.related_person_id);
      if (aMember && bMember && aMember.generation_level !== bMember.generation_level) {
        warnings.push({ severity: "warning", code: "SPOUSE_GENERATION_MISMATCH", message: `Spouses ${aMember.full_name} and ${bMember.full_name} have different generation levels.`, relationshipId: r.id });
      }
    }
  }

  // Detect parent/child cycles with a bounded graph traversal. This is intentionally
  // independent of generation numbers so malformed imported data is caught too.
  const childrenByParent = new Map<string, string[]>();
  for (const r of relationships) {
    if (r.person_id === r.related_person_id) continue;
    if (r.relationship_type === "parent") childrenByParent.set(r.person_id, [...(childrenByParent.get(r.person_id) || []), r.related_person_id]);
    if (r.relationship_type === "child") childrenByParent.set(r.related_person_id, [...(childrenByParent.get(r.related_person_id) || []), r.person_id]);
  }
  const reportedCycles = new Set<string>();
  Array.from(childrenByParent.keys()).forEach((start: string) => {
    const visited = new Set<string>();
    const stack = [...(childrenByParent.get(start) || [])];
    while (stack.length) {
      const next = stack.pop()!;
      if (next === start) {
        const signature = [start, ...Array.from(visited)].sort().join("|");
        if (!reportedCycles.has(signature)) {
          reportedCycles.add(signature);
          errors.push({ severity: "error", code: "RELATIONSHIP_CYCLE", message: `A parent/child cycle exists around member ${start}.`, memberId: start });
        }
        break;
      }
      if (visited.has(next)) continue;
      visited.add(next);
      stack.push(...(childrenByParent.get(next) || []));
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

export function validateImportRows(members: Member[], relationships: Relationship[], existingMembers: Member[] = [], existingRelationships: Relationship[] = []) {
  const report = validateNetwork(members, relationships);
  const existingById = new Map(existingMembers.map(m => [m.id, m]));
  const relationshipKey = (r: Relationship) => r.relationship_type === "spouse"
    ? `${r.relationship_type}|${[r.person_id, r.related_person_id].sort().join("|")}`
    : `parent|${r.relationship_type === "parent" ? r.person_id : r.related_person_id}|${r.relationship_type === "parent" ? r.related_person_id : r.person_id}`;
  const existingRelationshipKeys = new Set(existingRelationships.map(relationshipKey));

  for (const m of members) {
    const existing = existingById.get(m.id);
    if (existing && normalizeName(existing.full_name) !== normalizeName(m.full_name)) {
      report.errors.push({ severity: "error", code: "ID_COLLISION", message: `Import ID ${m.id} already belongs to "${existing.full_name}" and cannot be reused for "${m.full_name}".`, memberId: m.id });
    }
    const exactName = existingMembers.find(x => normalizeName(x.full_name) === normalizeName(m.full_name) && !!m.date_of_birth && x.date_of_birth === m.date_of_birth);
    if (exactName && exactName.id !== m.id) {
      report.warnings.push({ severity: "warning", code: "IMPORT_DUPLICATE", message: `Import contains a possible duplicate of existing member "${exactName.full_name}".`, memberId: m.id });
    }
  }

  for (const r of relationships) {
    const key = relationshipKey(r);
    if (existingRelationshipKeys.has(key)) {
      report.warnings.push({ severity: "warning", code: "RELATIONSHIP_ALREADY_EXISTS", message: "This imported relationship already exists and will be merged/upserted.", relationshipId: r.id });
    }
  }

  // Validate the resulting graph without treating already-existing relationships
  // as duplicate errors. This catches cycles and generation conflicts introduced
  // by the new import while preserving P3's additive merge behavior.
  const newMemberIds = new Set(members.map(m => m.id));
  const combinedMembers = [...existingMembers.filter(m => !newMemberIds.has(m.id)), ...members];
  const importedKeys = new Set(relationships.map(relationshipKey));
  const existingWithoutImportedDuplicates = existingRelationships.filter(r => {
    const key = relationshipKey(r);
    return !importedKeys.has(key);
  });
  const combined = validateNetwork(combinedMembers, [...existingWithoutImportedDuplicates, ...relationships]);
  return {
    valid: report.errors.length === 0 && combined.errors.length === 0,
    errors: [...report.errors, ...combined.errors],
    warnings: [...report.warnings, ...combined.warnings],
    importedMembers: members.length,
    importedRelationships: relationships.length,
  };
}
