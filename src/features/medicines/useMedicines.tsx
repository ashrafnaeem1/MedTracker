import { useCallback, useState } from "react";
import { medicineRepository } from "../../storage/medicineRepository";

export function useMedicines() {
  const [items, setItems] = useState(() => medicineRepository.list());

  const refresh = useCallback(() => {
    setItems(medicineRepository.list());
  }, []);

  return { items, refresh };
}
