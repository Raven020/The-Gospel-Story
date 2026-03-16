/**
 * Derives the current objective text from quest flags.
 * Pure function — no side effects, fully testable.
 */

export function getCurrentObjective(questFlags) {
  if (!questFlags) return '';
  const arc = questFlags.current_arc || 1;

  // Arc 3
  if (arc >= 3) {
    if (questFlags.arc3_complete) return '> The twelve are chosen';
    if (questFlags.recruited_matthew) return '> Ascend the mountain';
    if (questFlags.recruited_nathanael) return '> Call Matthew';
    if (questFlags.recruited_philip) return '> Call Nathanael';
    if (questFlags.recruited_john) return '> Call Philip';
    if (questFlags.recruited_james) return '> Call John';
    if (questFlags.recruited_andrew) return '> Call James';
    if (questFlags.recruited_peter) return '> Call Andrew';
    return '> Go to the Sea of Galilee';
  }

  // Arc 2
  if (arc >= 2) {
    if (questFlags.temptation_3_resolved) return '> Return from the wilderness';
    if (questFlags.temptation_2_resolved) return '> Stand firm';
    if (questFlags.temptation_1_resolved) return '> Resist temptation';
    if (questFlags.baptism_complete) return '> Face the wilderness';
    return '> Go to the Jordan River';
  }

  // Arc 1
  if (questFlags.found_jesus_in_temple) return '> Return to Nazareth';
  if (questFlags.talked_to_temple_guard) return '> Find Jesus in the Temple';
  if (questFlags.heard_about_temple_boy) return '> Ask at the Temple';
  return '> Search for Jesus';
}
