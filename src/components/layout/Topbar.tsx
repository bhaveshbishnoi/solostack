import React from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Search,
  Sun,
  Moon,
  PlusCircle,
  FileSpreadsheet,
  FolderOpen
} from 'lucide-react';

export const Topbar: React.FC = () => {
  const {
    metadata,
    saveStatus,
    lastSaved,
    saveWorkbook,
    createBackup,
    appConfig,
    setActiveSheet,
  } = useWorkbookStore();

  const { theme, setTheme } = useSettingsStore();
  const { openModal, setCommandPaletteOpen, addNotification } = useUIStore();

  const handleBackup = async () => {
    try {
      const backup = await createBackup();
      addNotification('success', 'Backup Created', `Saved to ${backup.filename}`);
    } catch (err: any) {
      addNotification('error', 'Backup Failed', err.message || 'Could not create backup');
    }
  };

  const handleSave = async () => {
    try {
      await saveWorkbook();
      addNotification('success', 'Workbook Saved', 'All sheet changes written to Excel file');
    } catch (err: any) {
      addNotification('error', 'Save Failed', err.message || 'Could not save workbook');
    }
  };

  return (
    <header className="h-14 border-b border-border bg-card/60 backdrop-blur-md px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Brand & Active Workbook Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-sm">
            Ex
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground tracking-tight">
                {appConfig?.businessName || 'Exdrow'}
              </span>
              {appConfig?.businessType && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                  {appConfig.businessType}
                </span>
              )}
            </div>
            {metadata ? (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground" title={metadata.filePath}>
                <FileSpreadsheet className="h-3 w-3 text-emerald-500" />
                <span className="truncate max-w-[200px] font-mono">{metadata.fileName}</span>
              </div>
            ) : (
              <span className="text-[11px] text-muted-foreground">No workbook open</span>
            )}
          </div>
        </div>

        {!metadata && (
          <button
            onClick={() => openModal('welcome')}
            className="ml-2 flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-2.5 py-1 rounded-md hover:bg-primary/90 transition shadow-sm font-medium"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span>Open / Create Workbook</span>
          </button>
        )}
      </div>

      {/* Center: Search & Command Palette Trigger */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground bg-muted/50 hover:bg-muted border border-border/80 rounded-lg transition"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Search products, customers, tables or type a command...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] bg-background border border-border px-1.5 py-0.5 rounded font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Action, Save Status, Backup, Theme */}
      <div className="flex items-center gap-2">
        {metadata && (
          <>
            <button
              onClick={() => setActiveSheet('new_sale')}
              className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition font-medium"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>New Sale</span>
            </button>

            {/* Save Status indicator button */}
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 rounded-md bg-muted/40" title={`Last saved at ${lastSaved || 'now'}`}>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[11px] font-medium hidden md:inline">Saved</span>
              </div>
            )}

            {saveStatus === 'saving' && (
              <div className="flex items-center gap-1.5 text-xs text-blue-500 px-2 py-1 rounded-md bg-blue-500/10">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="text-[11px] font-medium hidden md:inline">Saving...</span>
              </div>
            )}

            {saveStatus === 'unsaved' && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded-md shadow-sm transition font-medium"
                title="Click to save immediately"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </button>
            )}

            {saveStatus === 'error' && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 text-xs bg-destructive text-destructive-foreground px-2.5 py-1 rounded-md shadow-sm transition font-medium"
                title="Save failed. Click to retry."
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Retry Save</span>
              </button>
            )}

            {/* Backup button */}
            <button
              onClick={handleBackup}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
              title="Create instant backup copy"
            >
              <ShieldCheck className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
};
