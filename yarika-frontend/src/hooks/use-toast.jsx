import React, { createContext, useContext, useReducer, useEffect } from "react";

const TOAST_REMOVE_DELAY = 3000; // 3s auto-dismiss
const ToastContext = createContext();

let toastId = 0;

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD":
      return [...state, { ...action.toast, id: ++toastId, open: true }];
    case "DISMISS":
      return state.map(t => (t.id === action.id ? { ...t, open: false } : t));
    case "REMOVE":
      return state.filter(t => t.id !== action.id);
    default:
      return state;
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    const timers = toasts.map(toast =>
      toast.open
        ? setTimeout(() => dispatch({ type: "REMOVE", id: toast.id }), TOAST_REMOVE_DELAY)
        : null
    );
    return () => timers.forEach(t => t && clearTimeout(t));
  }, [toasts]);

  const toast = ({ title, description }) => {
    dispatch({ type: "ADD", toast: { title, description } });
  };

  const dismiss = (id) => dispatch({ type: "DISMISS", id });

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-5 right-5 space-y-3 z-50">
        {toasts.map(({ id, title, description, open }) =>
          open && (
            <div
              key={id}
              className="bg-white border border-gray-200 shadow-lg rounded-xl p-4 w-72"
            >
              <h4 className="font-semibold">{title}</h4>
              {description && <p className="text-sm text-gray-600">{description}</p>}
            </div>
          )
        )}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
