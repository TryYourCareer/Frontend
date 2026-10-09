import { useState, useEffect, useRef, useCallback } from "react";

export function useDebounceAutosave({ initialValue = "", onSave, delay = 800, sessionId = null }) {
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState("idle"); // "idle" | "saving" | "saved" | "error"
  const [error, setError] = useState(null);

  const lastSavedValueRef = useRef(initialValue);
  const isInitialMountRef = useRef(true);
  const currentSessionIdRef = useRef(sessionId);
  const timerRef = useRef(null);

  // When sessionId changes, cancel pending timer, sync new initialValue, and reset saved tracking
  useEffect(() => {
    if (currentSessionIdRef.current !== sessionId) {
      currentSessionIdRef.current = sessionId;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setValue(initialValue || "");
      lastSavedValueRef.current = initialValue || "";
      setStatus("idle");
      setError(null);
    }
  }, [sessionId, initialValue]);

  // Sync with initialValue if loaded asynchronously within the SAME session
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      setValue(initialValue);
      lastSavedValueRef.current = initialValue;
    } else if (lastSavedValueRef.current === "" && initialValue !== "") {
      setValue(initialValue);
      lastSavedValueRef.current = initialValue;
    } else if (initialValue !== undefined && initialValue !== lastSavedValueRef.current && value === lastSavedValueRef.current) {
      // If server updated value and local is not dirty
      setValue(initialValue);
      lastSavedValueRef.current = initialValue;
    }
  }, [initialValue, value]);

  const save = useCallback(
    async (textToSave) => {
      if (textToSave === lastSavedValueRef.current) {
        setStatus("saved");
        return;
      }
      setStatus("saving");
      setError(null);
      try {
        await onSave(textToSave);
        lastSavedValueRef.current = textToSave;
        setStatus("saved");
      } catch (err) {
        setError(err?.message || "Failed to save draft");
        setStatus("error");
      }
    },
    [onSave]
  );

  useEffect(() => {
    if (isInitialMountRef.current) return;
    if (value === lastSavedValueRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      save(value);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delay, save]);

  return {
    value,
    setValue,
    status,
    error,
    saveNow: () => save(value),
  };
}

export default useDebounceAutosave;
