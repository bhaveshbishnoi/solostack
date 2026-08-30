import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useWorkbookStore } from '../../stores/workbookStore';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, RefreshCw } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();
  const {
    externalChangeDetected,
    dismissExternalChange,
    reloadWorkbook,
    saveWorkbook,
  } = useWorkbookStore();

  return (
    <>
      {/* External change modal alert */}
      {externalChangeDetected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-semibold text-foreground">
                External Changes Detected
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This Excel workbook was modified outside Exdrow (e.g. in Microsoft Excel or Numbers).
              How would you like to proceed to protect your data?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={dismissExternalChange}
                className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
              >
                Keep Current In-App
              </button>
              <button
                onClick={async () => {
                  await saveWorkbook();
                  dismissExternalChange();
                }}
                className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground rounded-lg transition font-medium"
              >
                Overwrite With Current
              </button>
              <button
                onClick={reloadWorkbook}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm transition font-medium"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reload from Excel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating toast notifications */}
      <div className="fixed bottom-4 right-4 z-40 space-y-2 max-w-sm w-full pointer-events-none select-none">
        {notifications.map((notif) => {
          const icons = {
            success: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
            warning: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
            error: <AlertCircle className="h-4 w-4 text-destructive shrink-0" />,
            info: <Info className="h-4 w-4 text-blue-500 shrink-0" />,
          };

          return (
            <div
              key={notif.id}
              className="pointer-events-auto bg-card border border-border rounded-xl p-3 shadow-lg flex items-start gap-3 animate-in slide-in-from-bottom-2"
            >
              {icons[notif.type]}
              <div className="flex-1">
                <div className="text-xs font-semibold text-foreground">{notif.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{notif.message}</div>
              </div>
              <button
                onClick={() => removeNotification(notif.id)}
                className="text-muted-foreground hover:text-foreground p-1 rounded transition"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};
