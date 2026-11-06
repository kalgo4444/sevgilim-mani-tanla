import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** false during SSR and hydration, true after the client has mounted. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
