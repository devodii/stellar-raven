/**
 * Apply a provenance-bearing grader-note override without making judges
 * resolve stale inherited prose against a later append. The override file
 * remains the audit source; compiled cases carry the same replacement history
 * separately from the effective graderNotes string. Every declared span is
 * resolved against the original inherited notes, then non-overlapping edits
 * are applied together so declaration order cannot change their meaning.
 */
export function applyGraderNotesOverride(original, override, id = "unknown") {
  const inheritedNotes = original ?? "";
  const history = [];
  const edits = [];
  const replacements = override.graderNotesReplacements ?? [];
  if (!Array.isArray(replacements)) {
    throw new Error(`golden-overrides.json entry "${id}" graderNotesReplacements must be an array`);
  }
  for (const [index, replacement] of replacements.entries()) {
    const inherited = replacement?.inherited;
    const corrected = replacement?.effective;
    if (typeof inherited !== "string" || inherited.trim().length === 0) {
      throw new Error(
        `golden-overrides.json entry "${id}" graderNotesReplacements[${index}].inherited must be a non-empty string`
      );
    }
    if (typeof corrected !== "string" || corrected.trim().length === 0) {
      throw new Error(
        `golden-overrides.json entry "${id}" graderNotesReplacements[${index}].effective must be a non-empty string`
      );
    }
    if (inherited === corrected) {
      throw new Error(
        `golden-overrides.json entry "${id}" graderNotesReplacements[${index}] is a no-op`
      );
    }
    const occurrences = inheritedNotes.split(inherited).length - 1;
    if (occurrences !== 1) {
      throw new Error(
        `golden-overrides.json entry "${id}" graderNotesReplacements[${index}] expected exactly one inherited span, found ${occurrences}`
      );
    }
    const start = inheritedNotes.indexOf(inherited);
    const end = start + inherited.length;
    const overlap = edits.find((edit) => start < edit.end && edit.start < end);
    if (overlap) {
      throw new Error(
        `golden-overrides.json entry "${id}" graderNotesReplacements[${index}] overlaps another inherited span`
      );
    }
    edits.push({ start, end, corrected });
    history.push({ action: "replace-inherited", inherited, effective: corrected });
  }
  let effective = inheritedNotes;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    effective = effective.slice(0, edit.start) + edit.corrected + effective.slice(edit.end);
  }
  if (override.graderNotesAppend) {
    if (typeof override.graderNotesAppend !== "string") {
      throw new Error(`golden-overrides.json entry "${id}" graderNotesAppend must be a string`);
    }
    effective = [effective, override.graderNotesAppend.trim()].filter(Boolean).join("\n");
  }
  return { effective, history };
}
