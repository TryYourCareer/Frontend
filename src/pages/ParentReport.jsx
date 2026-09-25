import React from "react";
import DecisionReport from "./DecisionReport";

/**
 * ParentReport wrapper component.
 * Driven by the same unified Canonical Report architecture with initialView="parent".
 */
export default function ParentReport() {
  return <DecisionReport initialView="parent" />;
}
