"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type DragScrollProps = React.ComponentProps<"div">;

/**
 * DragScroll — a horizontal scroll container with no visible scrollbar.
 *
 * - Mobile / trackpad: native touch swipe + momentum (we never intercept
 *   touch/pen pointers, so the browser's own inertial scroll is preserved).
 * - Desktop mouse: click-and-drag to pan, with a grab/grabbing cursor and a
 *   small move-threshold that suppresses the click on whatever was under the
 *   pointer (so a drag doesn't accidentally follow a product link).
 * - The scrollbar UI itself is hidden via the `.scrollbar-hide` utility
 *   (see app/globals.css); pair with `snap-x` + `snap-start` on children for a
 *   clean swipe feel.
 *
 * Layout (flex row vs. responsive grid, gaps, padding) is passed through via
 * `className` so this stays a drop-in wrapper for the existing rails. When a
 * row isn't actually overflowing (e.g. the `lg:grid` breakpoint), dragging and
 * the grab cursor disable themselves.
 */
export function DragScroll({
  className,
  children,
  onClickCapture,
  ...props
}: DragScrollProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  const [canScroll, setCanScroll] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setCanScroll(el.scrollWidth - el.clientWidth > 1);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Only hijack mouse drags; touch/pen keep their native momentum scrolling.
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el || el.scrollWidth - el.clientWidth <= 1) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startLeft: el.scrollLeft,
      moved: false,
    };
    setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!drag.current.active || !el) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    el.scrollLeft = drag.current.startLeft - dx;
  }

  function endDrag() {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);
  }

  function handleClickCapture(e: React.MouseEvent<HTMLDivElement>) {
    // A drag that moved should not also register as a click on a child link.
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
    onClickCapture?.(e);
  }

  return (
    <div
      ref={ref}
      className={cn(
        "scrollbar-hide",
        canScroll && "cursor-grab",
        dragging && "cursor-grabbing select-none",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={handleClickCapture}
      {...props}
    >
      {children}
    </div>
  );
}
