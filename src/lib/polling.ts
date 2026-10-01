// Rules for the guest-list background refresh (see GuestSection): poll only
// while someone is actually looking - tab visible and some interaction
// within the idle window - so forgotten open tabs stop costing requests.

type ActivityState = { now: number; lastActivity: number; idleAfterMs: number };

export function isIdle({ now, lastActivity, idleAfterMs }: ActivityState): boolean {
  return now - lastActivity > idleAfterMs;
}

export function shouldPoll(state: ActivityState & { visible: boolean }): boolean {
  return state.visible && !isIdle(state);
}
