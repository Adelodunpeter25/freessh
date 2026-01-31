import { Suspense } from "react";
import { KeyboardShortcutsDialog } from "@/components/common/KeyboardShortcutsDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { ExportImportDialog } from "@/components/export-import";
import { SnippetForm } from "./MainLayoutRoutes";
import { Snippet } from "@/types/snippet";

interface MainLayoutDialogsProps {
  showShortcuts: boolean;
  setShowShortcuts: (show: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showExportImport: boolean;
  setShowExportImport: (show: boolean) => void;
  showSnippetForm: boolean;
  setShowSnippetForm: (show: boolean) => void;
  editingSnippet: Snippet | null;
  setEditingSnippet: (snippet: Snippet | null) => void;
  deletingSnippet: Snippet | null;
  setDeletingSnippet: (snippet: Snippet | null) => void;
  setShowTerminalSettings: (show: boolean) => void;
  onSaveSnippet: (data: any) => Promise<void>;
  onDeleteSnippet: () => Promise<void>;
}

export function MainLayoutDialogs({
  showShortcuts,
  setShowShortcuts,
  showSettings,
  setShowSettings,
  showExportImport,
  setShowExportImport,
  showSnippetForm,
  setShowSnippetForm,
  editingSnippet,
  setEditingSnippet,
  deletingSnippet,
  setDeletingSnippet,
  setShowTerminalSettings,
  onSaveSnippet,
  onDeleteSnippet
}: MainLayoutDialogsProps) {
  return (
    <>
      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <ExportImportDialog isOpen={showExportImport} onClose={() => setShowExportImport(false)} />

      {showSnippetForm && (
        <Suspense fallback={null}>
          <SnippetForm
            isOpen={showSnippetForm}
            snippet={editingSnippet}
            onClose={() => {
              setShowSnippetForm(false)
              setEditingSnippet(null)
              setShowTerminalSettings(true)
            }}
            onSave={onSaveSnippet}
          />
        </Suspense>
      )}

      <ConfirmDialog
        open={!!deletingSnippet}
        onOpenChange={(open) => !open && setDeletingSnippet(null)}
        title="Delete Snippet"
        description={`Are you sure you want to delete "${deletingSnippet?.name}"? This action cannot be undone.`}
        onConfirm={onDeleteSnippet}
        confirmText="Delete"
        destructive
      />
    </>
  );
}
