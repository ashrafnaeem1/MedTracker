let pendingMedicineId: string | null = null;

export function requestEdit(medicineId: string): void {
  pendingMedicineId = medicineId;
}

export function takePendingEdit(): string | null {
  const medicineId = pendingMedicineId;
  pendingMedicineId = null;
  return medicineId;
}
