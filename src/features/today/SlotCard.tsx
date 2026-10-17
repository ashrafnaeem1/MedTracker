import { IonActionSheet, IonAlert, IonIcon } from "@ionic/react";
import {
  arrowUndoOutline,
  checkmarkCircleOutline,
  checkmarkOutline,
  closeCircleOutline,
  closeOutline,
  createOutline,
  helpCircleOutline,
  timeOutline,
} from "ionicons/icons";
import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { actionsFor } from "../../domain/actionPolicy";
import { slotMoment } from "../../domain/date";
import type { SlotView } from "../../domain/daySchedule";
import type { RecordedStatus, SlotRef, SlotStatus } from "../../domain/doseLog";
import { defaultAmount, formatDose, hasQuantity } from "../../domain/doseUnits";
import { formatInstant, formatTime } from "../../domain/time";
import { PALETTE } from "./palette";

interface SlotCardProps {
  slot: SlotView;
  today: string;
  onEdit: (medicineId: string) => void;
  onRecord: (ref: SlotRef, status: RecordedStatus) => void;
  onUndo: (ref: SlotRef) => void;
}

interface StatusView {
  label: string;
  icon: string;
  colors: { background: string; text: string; border: string };
  dashed: boolean;
}

const STATUS_VIEW: Record<SlotStatus, StatusView> = {
  upcoming: { label: "Upcoming", icon: timeOutline, colors: PALETTE.upcoming, dashed: false },
  unknown: { label: "Not logged", icon: helpCircleOutline, colors: PALETTE.unknown, dashed: false },
  taken: { label: "Taken", icon: checkmarkCircleOutline, colors: PALETTE.taken, dashed: false },
  missed: { label: "Missed", icon: closeCircleOutline, colors: PALETTE.missed, dashed: false },
};

const BUTTON_BASE: CSSProperties = {
  minHeight: 44,
  minWidth: 44,
  width: "100%",
  padding: "0 12px",
  borderRadius: 12,
  fontSize: 16,
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  cursor: "pointer",
};

function describeLog(slot: SlotView): string | null {
  if (!slot.log) {
    return null;
  }
  if (slot.log.status === "missed") {
    return `Marked missed at ${formatInstant(slot.log.loggedAt)}`;
  }
  const late = new Date(slot.log.loggedAt) > slotMoment(slot.ref.date, slot.ref.time);
  return `Taken at ${formatInstant(slot.log.loggedAt)}${late ? " (logged late)" : ""}`;
}

const HOLD_MS = 500;

export default function SlotCard({ slot, today, onRecord, onUndo, onEdit }: SlotCardProps) {
  const [confirmEarly, setConfirmEarly] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const actionsId = useId();
  const holdTimer = useRef<number | null>(null);
  const holdFired = useRef(false);

  function clearHold() {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  function startHold(event: ReactPointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }
    holdFired.current = false;
    clearHold();
    holdTimer.current = window.setTimeout(() => {
      holdFired.current = true;
      setMenuOpen(true);
    }, HOLD_MS);
  }
  const actions = actionsFor(slot.ref, slot.status, today);
  const view = STATUS_VIEW[slot.status];
  const logLine = describeLog(slot);
  const showQuantity =
    hasQuantity(slot.medicine.type) && slot.dose.amount !== defaultAmount(slot.medicine.type);
  const showTakeNow = actions.canTake && !actions.takeNeedsConfirmation;
  const showPrimaryTake = slot.status === "unknown" && showTakeNow;

  return (
    <li style={{ display: "flex", gap: 12, marginBottom: 8, listStyle: "none" }}>
      <time
        dateTime={slot.ref.time}
        style={{
          width: 80,
          paddingTop: 12,
          textAlign: "right",
          fontSize: 18,
          fontWeight: 700,
          color: PALETTE.text,
        }}
      >
        {formatTime(slot.ref.time)}
      </time>

      <article
        onPointerDown={startHold}
        onPointerUp={clearHold}
        onPointerLeave={clearHold}
        onPointerCancel={clearHold}
        onContextMenu={(event) => {
          event.preventDefault();
          clearHold();
          setMenuOpen(true);
        }}
        onClick={() => {
          if (holdFired.current) {
            holdFired.current = false;
            return;
          }
          setExpanded((value) => !value);
        }}
        style={{
          flex: 1,
          minWidth: 0,
          padding: 12,
          borderRadius: 16,
          border: `1px solid ${PALETTE.cardBorder[slot.status]}`,
          background: view.colors.background,
          color: PALETTE.text,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          aria-controls={actionsId}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setExpanded((value) => !value);
            }
          }}
          style={{ display: "flex", flexDirection: "column", gap: 4, cursor: "pointer" }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 999,
                border: `1px solid ${PALETTE.pill[slot.status].border}`,
                background: PALETTE.pill[slot.status].background,
                color: PALETTE.pill[slot.status].text,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              <IonIcon icon={view.icon} aria-hidden="true" />
              {view.label}
            </span>
          </div>
          <h4
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: PALETTE.text,
              overflowWrap: "anywhere",
            }}
          >
            {slot.medicine.name}
          </h4>
          {slot.medicine.formula && (
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: PALETTE.mutedText,
                overflowWrap: "anywhere",
              }}
            >
              {slot.medicine.formula}
            </p>
          )}
          <p style={{ margin: 0, fontSize: 14, color: PALETTE.mutedText }}>{slot.label}</p>
          {logLine && (
            <p style={{ margin: "4px 0 0", fontSize: 14, color: PALETTE.mutedText }}>{logLine}</p>
          )}
        </div>

        {(expanded || showQuantity || showPrimaryTake) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <div
              id={actionsId}
              style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}
            >
              {showPrimaryTake && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRecord(slot.ref, "taken");
                  }}
                  style={{
                    ...BUTTON_BASE,
                    border: `1px solid ${PALETTE.taken.border}`,
                    background: PALETTE.surface,
                    color: PALETTE.taken.text,
                  }}
                >
                  <IonIcon icon={checkmarkOutline} aria-hidden="true" />
                  Taken?
                </button>
              )}
              {expanded && showTakeNow && !showPrimaryTake && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRecord(slot.ref, "taken");
                  }}
                  style={{
                    ...BUTTON_BASE,
                    border: `1px solid ${PALETTE.taken.border}`,
                    background: PALETTE.surface,
                    color: PALETTE.taken.text,
                  }}
                >
                  <IonIcon icon={checkmarkOutline} aria-hidden="true" />
                  Taken?
                </button>
              )}
              {expanded && actions.canMiss && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRecord(slot.ref, "missed");
                  }}
                  style={{
                    ...BUTTON_BASE,
                    border: `2px solid ${PALETTE.missed.border}`,
                    background: PALETTE.surface,
                    color: PALETTE.missed.text,
                  }}
                >
                  <IonIcon icon={closeOutline} aria-hidden="true" />
                  Missed?
                </button>
              )}
              {expanded && actions.takeNeedsConfirmation && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setConfirmEarly(true);
                  }}
                  style={{
                    ...BUTTON_BASE,
                    border: `2px solid ${PALETTE.upcoming.border}`,
                    background: PALETTE.surface,
                    color: PALETTE.text,
                  }}
                >
                  Take early…
                </button>
              )}
              {expanded && actions.canUndo && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onUndo(slot.ref);
                  }}
                  style={{
                    minHeight: 44,
                    padding: "0 8px",
                    border: "none",
                    background: "transparent",
                    color: PALETTE.mutedText,
                    fontSize: 14,
                    textDecoration: "underline",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                  }}
                >
                  <IonIcon icon={arrowUndoOutline} aria-hidden="true" />
                  Undo
                </button>
              )}
            </div>

            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {showQuantity && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: `1px solid ${PALETTE.quantityChip.border}`,
                    background: PALETTE.quantityChip.background,
                    color: PALETTE.quantityChip.text,
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDose(slot.dose.amount, slot.medicine.type)}
                </span>
              )}
            </div>
          </div>
        )}
      </article>

      <IonActionSheet
        isOpen={menuOpen}
        onDidDismiss={() => setMenuOpen(false)}
        header={slot.medicine.name}
        buttons={[
          { text: "Edit", icon: createOutline, handler: () => onEdit(slot.medicine.id) },
          { text: "Cancel", role: "cancel" },
        ]}
      />

      <IonAlert
        isOpen={confirmEarly}
        onDidDismiss={() => setConfirmEarly(false)}
        header="Take this dose early?"
        message={`It is not due until ${formatTime(slot.ref.time)}.`}
        buttons={[
          { text: "Cancel", role: "cancel" },
          { text: "Take early", handler: () => onRecord(slot.ref, "taken") },
        ]}
      />
    </li>
  );
}
