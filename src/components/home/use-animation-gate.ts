"use client";

import { type RefObject, useEffect, useState } from "react";

// Shoppex's checkout script watches the page for DOM changes. Our looping demo animations
// change the DOM constantly, which made the open checkout (and Square's card fields) keep
// re-rendering. So animations only run while visible AND while no checkout is open.

let checkoutOpen = false;
const listeners = new Set<() => void>();
let wired = false;

function setOpen(value: boolean) {
  if (checkoutOpen === value) return;
  checkoutOpen = value;
  for (const fn of listeners) fn();
}

function wire() {
  if (wired || typeof document === "undefined") return;
  wired = true;
  // Any Shoppex buy button opens the checkout.
  document.addEventListener("click", e => {
    const el = e.target instanceof Element ? e.target.closest("[data-shoppex-product-id],[data-shoppex-checkout]") : null;
    if (el) setOpen(true);
  }, true);
  for (const name of ["shoppex:close", "shoppex:success", "shoppex:error"]) {
    document.addEventListener(name, () => setOpen(false));
  }
}

export function useAnimationGate(ref: RefObject<Element | null>) {
  const [open, setOpenState] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    wire();
    const fn = () => setOpenState(checkoutOpen);
    listeners.add(fn);
    fn();
    return () => { listeners.delete(fn); };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setVisible(true); return; }
    const io = new IntersectionObserver(entries => setVisible(entries[0]?.isIntersecting ?? false), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  return visible && !open;
}
