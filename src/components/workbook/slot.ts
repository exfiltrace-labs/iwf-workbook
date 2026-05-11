import { isValidElement, type ReactNode, type ReactElement } from 'react'

/**
 * Tag a slot component (e.g. `<Hint>`, `<Good>`, `<Choice>`) with a stable
 * marker so a parent can identify it via `isSlot(child, marker)`. The
 * children are returned as-is, so authoring stays declarative:
 *
 *     export const Hint = defineSlot('Hint', ({ children }) => <>{children}</>)
 *
 * Returns the original component reference (now decorated) so callers
 * can name and export it normally.
 */
export function defineSlot<P extends { children?: ReactNode }>(
  name: string,
  Component: (props: P) => ReactNode,
): ((props: P) => ReactNode) & { __slot: symbol } {
  const marker = Symbol(name)
  const fn = Component as ((props: P) => ReactNode) & { __slot: symbol }
  fn.__slot = marker
  return fn
}

/** True when `child` is a React element produced by a `defineSlot` component
 *  whose marker matches `marker`. */
export function isSlot(child: ReactNode, marker: symbol): child is ReactElement {
  if (!isValidElement(child)) return false
  return (child.type as unknown as { __slot?: symbol })?.__slot === marker
}

/** Convenience: pull the slot's marker so callers can hand it to `isSlot`. */
export function slotMarker(component: { __slot: symbol }): symbol {
  return component.__slot
}
