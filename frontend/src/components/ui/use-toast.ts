"use client";

import * as React from "react";
import type { Toast } from "@/components/ui/toast";

const TOAST_LIMIT = 3;

export interface InternalToast extends Toast {
  id: string;
}

interface State {
  toasts: InternalToast[];
}

type Action =
  | { type: "ADD"; toast: InternalToast }
  | { type: "REMOVE"; id: string }
  | { type: "DISMISS"; id?: string }
  | { type: "UPDATE"; toast: Partial<InternalToast> & { id: string } };

let listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "REMOVE":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
      };

    case "DISMISS":
      return {
        ...state,
        toasts: action.id
          ? state.toasts.filter((t) => t.id !== action.id)
          : [],
      };

    default:
      return state;
  }
}

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((l) => l(memoryState));
}

let counter = 0;
function generateId() {
  counter = (counter + 1) % Number.MAX_SAFE_INTEGER;
  return counter.toString();
}

export function toast(toast: Omit<Toast, "id">) {
  const id = generateId();

  dispatch({
    type: "ADD",
    toast: { ...toast, id },
  });

  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS", id }),
    update: (props: Partial<Toast>) =>
      dispatch({ type: "UPDATE", toast: { ...props, id } }),
  };
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter((l) => l !== setState);
    };
  }, []);

  return {
    ...state,
    toast,
    removeToast: (id: string) => dispatch({ type: "REMOVE", id }),
    dismiss: (id?: string) => dispatch({ type: "DISMISS", id }),
  };
}
