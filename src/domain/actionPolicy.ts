import type { SlotRef, SlotStatus } from "./doseLog";

export interface SlotActions {
  canTake: boolean;
  takeNeedsConfirmation: boolean;
  canMiss: boolean;
  canUndo: boolean;
}

const NO_ACTIONS: SlotActions = {
  canTake: false,
  takeNeedsConfirmation: false,
  canMiss: false,
  canUndo: false,
};

export function actionsFor(ref: SlotRef, status: SlotStatus, today: string): SlotActions {
  if (status === "taken" || status === "missed") {
    return { ...NO_ACTIONS, canUndo: true };
  }
  if (ref.date > today) {
    return NO_ACTIONS;
  }
  if (ref.date < today) {
    return { ...NO_ACTIONS, canTake: true, canMiss: true };
  }
  if (status === "upcoming") {
    return { ...NO_ACTIONS, canTake: true, takeNeedsConfirmation: true };
  }
  return { ...NO_ACTIONS, canTake: true, canMiss: true };
}
