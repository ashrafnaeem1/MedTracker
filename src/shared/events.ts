import type { Medicine } from "../domain/medicine";
import type { RecordedStatus, SlotRef } from "../domain/doseLog";

export type AppEvent =
  | { type: "medicine:saved"; medicine: Medicine }
  | { type: "medicine:removed"; medicineId: string }
  | { type: "dose:recorded"; ref: SlotRef; status: RecordedStatus }
  | { type: "dose:undone"; ref: SlotRef };

type Listener = (event: AppEvent) => void;

const listeners = new Set<Listener>();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function publish(event: AppEvent): void {
  for (const listener of listeners) {
    listener(event);
  }
}
