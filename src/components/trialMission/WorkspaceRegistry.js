import BusinessAnalystWorkspace from "./BusinessAnalystWorkspace";
import DeveloperWorkspace from "./DeveloperWorkspace";
import UXDesignerWorkspace from "./UXDesignerWorkspace";

/**
 * Registry mapping stable workspace family identifiers (session.workspace_type)
 * to their corresponding modular React investigation workspace components.
 */
export const WORKSPACE_COMPONENTS = {
  business_analyst: BusinessAnalystWorkspace,
  developer: DeveloperWorkspace,
  ux_designer: UXDesignerWorkspace,
};

/**
 * Resolves a workspace component for a given workspace_type string.
 * Returns null if the workspace_type is unknown or unsupported.
 */
export function getWorkspaceComponent(workspaceType) {
  if (!workspaceType || typeof workspaceType !== "string") {
    return null;
  }
  return WORKSPACE_COMPONENTS[workspaceType] || null;
}
