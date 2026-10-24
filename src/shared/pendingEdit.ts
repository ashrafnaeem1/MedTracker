let pendingMedicineId: string | null = null;
let pendingAdd = false;

export function requestEdit(medicineId: string): void {
  pendingMedicineId = medicineId;
}

export function takePendingEdit(): string | null {
  const medicineId = pendingMedicineId;
  pendingMedicineId = null;
  return medicineId;
}

export function requestAdd(): void {
  pendingAdd = true;
}

export function takePendingAdd(): boolean {
  const requested = pendingAdd;
  pendingAdd = false;
  return requested;
}

let pendingSlotKey: string | null = null;

export function requestSlotFocus(slotKey: string): void {
  pendingSlotKey = slotKey;
}

export function takePendingSlotFocus(): string | null {
  const slotKey = pendingSlotKey;
  pendingSlotKey = null;
  return slotKey;
}
