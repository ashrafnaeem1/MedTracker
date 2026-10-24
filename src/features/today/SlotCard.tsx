import { IonActionSheet, IonAlert, IonIcon } from "@ionic/react";
import {
  arrowUndoOutline,
  checkmarkCircleOutline,
  chevronForwardOutline,
  closeCircleOutline,
  closeOutline,
  createOutline,
  helpCircleOutline,
  notificationsOutline,
  timeOutline,
} from "ionicons/icons";
import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { actionsFor } from "../../domain/actionPolicy";
import { slotMoment } from "../../domain/date";
import type { SlotView } from "../../domain/daySchedule";
import type { RecordedStatus, SlotRef, SlotStatus } from "../../domain/doseLog";
import { defaultAmount, formatDose, hasQuantity } from "../../domain/doseUnits";
import { formatInstant, formatTime } from "../../domain/time";
import { useIsTouch } from "../../shared/useIsTouch";
import { PALETTE } from "./palette";
import "./SlotCard.css";

interface SlotCardProps {
  slot: SlotView;
  today: string;
  onEdit: (medicineId: string) => void;
  onRecord: (ref: SlotRef, status: RecordedStatus) => void;
  onUndo: (ref: SlotRef) => void;
  focused?: boolean;
}

interface StatusView {
  label: string;
  icon: string;
  colors: { background: string; text: string; border: string };
}

const STATUS_VIEW: Record<SlotStatus, StatusView> = {
  upcoming: { label: "Upcoming", icon: timeOutline, colors: PALETTE.upcoming },
  unknown: { label: "Not logged", icon: helpCircleOutline, colors: PALETTE.unknown },
  taken: { label: "Taken", icon: checkmarkCircleOutline, colors: PALETTE.taken },
  missed: { label: "Missed", icon: closeCircleOutline, colors: PALETTE.missed },
};

const HOLD_MS = 500;
const MOVE_TOLERANCE_PX = 8;
const SWIPE_THRESHOLD = 0.4;
const ACTIONS_VICINITY_PX = 24;

const BUTTON_BASE: CSSProperties = {
  minHeight: 44,
  minWidth: 44,
  padding: "0 14px",
  borderRadius: 12,
  fontSize: 15,
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

export default function SlotCard({
  slot,
  today,
  onRecord,
  onUndo,
  onEdit,
  focused = false,
}: SlotCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmEarly, setConfirmEarly] = useState(false);
  const [dragX, setDragX] = useState(0);
  const actionsId = useId();
  const actionsRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();
  const cardRef = useRef<HTMLElement>(null);
  const holdTimer = useRef<number | null>(null);
  const holdFired = useRef(false);
  const gesture = useRef({ x: 0, y: 0, width: 0, active: false, moved: false });

  const actions = actionsFor(slot.ref, slot.status, today);
  const view = STATUS_VIEW[slot.status];
  const logLine = describeLog(slot);
  const isUnknown = slot.status === "unknown";
  const isFinished = slot.status === "taken" || slot.status === "missed";
  const canTakeNow = actions.canTake && !actions.takeNeedsConfirmation;
  const swipeable = isTouch && isUnknown && canTakeNow;
  const showTake = isUnknown && canTakeNow && (!isTouch || expanded);
  const showQuantity =
    hasQuantity(slot.medicine.type) && slot.dose.amount !== defaultAmount(slot.medicine.type);
  const showBottom = swipeable || showTake || expanded;

  function clearHold() {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  function startGesture(event: ReactPointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button, label, input")) {
      return;
    }
    gesture.current = {
      x: event.clientX,
      y: event.clientY,
      width: cardRef.current?.offsetWidth ?? 300,
      active: true,
      moved: false,
    };
    holdFired.current = false;
    clearHold();
    holdTimer.current = window.setTimeout(() => {
      holdFired.current = true;
      gesture.current.active = false;
      setDragX(0);
      setMenuOpen(true);
    }, HOLD_MS);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveGesture(event: ReactPointerEvent<HTMLElement>) {
    const current = gesture.current;
    if (!current.active) {
      return;
    }
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (Math.abs(dx) > MOVE_TOLERANCE_PX || Math.abs(dy) > MOVE_TOLERANCE_PX) {
      clearHold();
      current.moved = true;
    }
    if (swipeable && dx > 0 && Math.abs(dx) > Math.abs(dy)) {
      setDragX(Math.min(dx, current.width));
    }
  }

  function endGesture() {
    clearHold();
    const current = gesture.current;
    if (!current.active && !current.moved) {
      return;
    }
    current.active = false;
    const shouldTake = swipeable && dragX >= current.width * SWIPE_THRESHOLD;
    setDragX(0);
    if (shouldTake) {
      onRecord(slot.ref, "taken");
    }
  }

  function cancelGesture() {
    clearHold();
    gesture.current.active = false;
    setDragX(0);
  }

  function isNearActions(x: number, y: number): boolean {
    const rect = actionsRef.current?.getBoundingClientRect();
    if (!rect) {
      return false;
    }
    return (
      x >= rect.left - ACTIONS_VICINITY_PX &&
      x <= rect.right + ACTIONS_VICINITY_PX &&
      y >= rect.top - ACTIONS_VICINITY_PX &&
      y <= rect.bottom + ACTIONS_VICINITY_PX
    );
  }

  function handleClick(event: ReactMouseEvent<HTMLElement>) {
    if (holdFired.current) {
      holdFired.current = false;
      return;
    }
    if (gesture.current.moved) {
      gesture.current.moved = false;
      return;
    }
    if (expanded && isNearActions(event.clientX, event.clientY)) {
      return;
    }
    setExpanded((value) => !value);
  }

  return (
    <li
      data-slot-key={slot.key}
      style={{ display: "flex", gap: 12, marginBottom: 8, listStyle: "none" }}
    >
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
        ref={cardRef}
        onPointerDown={startGesture}
        onPointerMove={moveGesture}
        onPointerUp={endGesture}
        onPointerCancel={cancelGesture}
        onPointerLeave={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
            cancelGesture();
          }
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          clearHold();
          setMenuOpen(true);
        }}
        onClick={handleClick}
        style={{
          flex: 1,
          minWidth: 0,
          padding: 12,
          borderRadius: 16,
          border: `1px solid ${PALETTE.cardBorder[slot.status]}`,
          background: view.colors.background,
          color: PALETTE.text,
          outline: focused ? "3px solid var(--app-text)" : "none",
          outlineOffset: 4,
          transform: `translateX(${dragX}px)`,
          transition: dragX === 0 ? "transform 200ms ease" : "none",
          touchAction: "pan-y",
          userSelect: "none",
          cursor: "pointer",
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
        >
          {focused ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 999,
                background: "var(--app-text)",
                color: "var(--app-surface)",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              <IonIcon icon={notificationsOutline} aria-hidden="true" />
              Reminder
            </span>
          ) : (
            <span />
          )}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 999,
              border: `1px solid ${PALETTE.pill[slot.status].border}`,
              background: PALETTE.surface,
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
            margin: "6px 0 0",
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
              margin: "2px 0 0",
              fontSize: 14,
              color: PALETTE.mutedText,
              overflowWrap: "anywhere",
            }}
          >
            {slot.medicine.formula}
          </p>
        )}
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 2 }}
        >
          <span style={{ fontSize: 14, color: PALETTE.mutedText }}>{slot.label}</span>
          {showQuantity && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 8px",
                borderRadius: 999,
                border: `1px solid ${PALETTE.quantityChip.border}`,
                background: PALETTE.quantityChip.background,
                color: PALETTE.quantityChip.text,
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {formatDose(slot.dose.amount, slot.medicine.type)}
            </span>
          )}
        </div>
        {logLine && (
          <p style={{ margin: "4px 0 0", fontSize: 14, color: PALETTE.mutedText }}>{logLine}</p>
        )}

        {showBottom && (
          <div style={{ display: "flex", alignItems: "flex-end", marginTop: 10 }}>
            <div
              id={actionsId}
              ref={actionsRef}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 8,
                minWidth: 0,
              }}
            >
              {swipeable && !expanded && (
                <span
                  className="swipe-hint"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: PALETTE.mutedText,
                    whiteSpace: "nowrap",
                  }}
                >
                  swipe right to take
                  <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center" }}>
                    <IonIcon className="swipe-arrow" icon={chevronForwardOutline} />
                    <IonIcon className="swipe-arrow" icon={chevronForwardOutline} />
                    <IonIcon className="swipe-arrow" icon={chevronForwardOutline} />
                  </span>
                </span>
              )}

              {showTake && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRecord(slot.ref, "taken");
                  }}
                  style={{
                    ...BUTTON_BASE,
                    border: `2px solid ${PALETTE.taken.border}`,
                    background: PALETTE.surface,
                    color: PALETTE.taken.text,
                  }}
                >
                  Taken
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
                  Missed
                </button>
              )}

              {expanded && isFinished && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onUndo(slot.ref);
                  }}
                  style={{
                    minHeight: 44,
                    padding: "0 12px",
                    border: "none",
                    borderRadius: 12,
                    background: "transparent",
                    color: PALETTE.text,
                    fontSize: 15,
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <IonIcon icon={arrowUndoOutline} aria-hidden="true" />
                  Undo
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
