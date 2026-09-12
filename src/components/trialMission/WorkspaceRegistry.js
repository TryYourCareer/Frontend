import BusinessAnalystWorkspace from "./BusinessAnalystWorkspace";
import DeveloperWorkspace from "./DeveloperWorkspace";
import UXDesignerWorkspace from "./UXDesignerWorkspace";
import DataNotebookWorkspace from "./DataNotebookWorkspace";
import SystemArchitectWorkspace from "./SystemArchitectWorkspace";
import DocumentWorkbenchWorkspace from "./DocumentWorkbenchWorkspace";
import ProcessWorkflowWorkspace from "./ProcessWorkflowWorkspace";

/**
 * Registry mapping stable workspace family identifiers (session.workspace_type)
 * to their corresponding modular React investigation workspace components.
 */
export const WORKSPACE_COMPONENTS = {
  business_analyst: BusinessAnalystWorkspace,
  developer: DeveloperWorkspace,
  ux_designer: UXDesignerWorkspace,
  data_notebook: DataNotebookWorkspace,
  system_architect: SystemArchitectWorkspace,
  document_workbench: DocumentWorkbenchWorkspace,
  process_workflow: ProcessWorkflowWorkspace,
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
