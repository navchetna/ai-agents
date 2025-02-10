import { type RefObject, useEffect } from "react"

type Event = MouseEvent | TouchEvent

export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void,
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref?.current
      if (!el || el.contains((event?.target as Node) || null)) {
        return
      }

      handler(event)
    }

    const options: AddEventListenerOptions = { capture: true, passive: true }

    document.addEventListener("mousedown", listener, options)
    document.addEventListener("touchstart", listener, options)

    return () => {
      document.removeEventListener("mousedown", listener, options)
      document.removeEventListener("touchstart", listener, options)
    }
  }, [ref, handler])
}

