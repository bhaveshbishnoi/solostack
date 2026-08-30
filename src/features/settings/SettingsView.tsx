import React, { useState } from 'react';
import { useWorkbookStore } from '../../stores/workbookStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import { formatDate } from '../../lib/utils';
import {
  Building,
  FileSpreadsheet,
  Palette,
  ShieldCheck,
  RotateCcw,
  Save,
  FolderOpen
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    metadata,
    appConfig,
    backups,
    createBackup,
    restoreBackup,
  } = useWorkbookStore();

  const {
    theme,
    setTheme,
    tableDensity,
    setTableDensity,
    businessAddress,
    businessPhone,
    businessEmail,
    businessGstin,
    updateBusinessProfile,
  } = useSettingsStore();

  const { addNotification, openModal } = useUIStore();

  const [addressInput, setAddressInput] = useState(businessAddress);
  const [phoneInput, setPhoneInput] = useState(businessPhone);
  const [emailInput, setEmailInput] = useState(businessEmail);
  const [gstinInput, setGstinInput] = useState(businessGstin);

  const handleSaveProfile = () => {
    updateBusinessProfile({
      address: addressInput,
      phone: phoneInput,
      email: emailInput,
      gstin: gstinInput,
    });
    addNotification('success', 'Profile Updated', 'Business contact details saved');
  };

  const handleCreateBackup = async () => {
    if (!metadata) {
      addNotification('warning', 'No Active Workbook', 'Please create or load a workbook first');
      return;
    }
    try {
      const b = await createBackup();
      addNotification('success', 'Backup Created', b.filename);
    } catch (err: any) {
      addNotification('error', 'Backup Failed', err.message);
    }
  };

  const handleRestore = async (backupPath: string) => {
    if (!metadata) {
      addNotification('warning', 'No Active Workbook', 'Please create or load a workbook first');
      return;
    }
    if (window.confirm('Restore this backup copy? Current unsaved workbook state will be replaced.')) {
      try {
        await restoreBackup(backupPath);
        addNotification('success', 'Backup Restored', 'Workbook data reverted to backup snapshot');
      } catch (err: any) {
        addNotification('error', 'Restore Failed', err.message);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Business & System Settings</h1>
        <p className="text-xs text-muted-foreground">
          Manage local workbook preferences, business branding, and data backups
        </p>
      </div>

      {/* Section 1: Active Workbook File */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Active Excel Workbook</h3>
              <p className="text-xs text-muted-foreground">Primary local persistent data store</p>
            </div>
          </div>
          <button
            onClick={() => openModal('welcome')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg transition"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span>Switch / Open File</span>
          </button>
        </div>

        {metadata ? (
          <div className="bg-muted/30 border border-border rounded-xl p-3 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground font-sans">Filename:</span>
              <span className="font-semibold text-foreground">{metadata.fileName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-sans">Path:</span>
              <span className="text-muted-foreground truncate max-w-xs">{metadata.filePath}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-sans">Size:</span>
              <span className="text-foreground">{(metadata.fileSize / 1024).toFixed(1)} KB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-sans">Sheets Count:</span>
              <span className="text-foreground">{metadata.sheetNames.length} sheets</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">No workbook loaded yet.</div>
        )}
      </div>

      {/* Section 2: Business Profile & Invoicing */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <Building className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-foreground">Business Information & Invoicing</h3>
            <p className="text-xs text-muted-foreground">Shown on customer tax invoices and receipts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-foreground mb-1">Business Name</label>
            <input
              disabled
              type="text"
              value={appConfig?.businessName || ''}
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-foreground opacity-80"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">GSTIN / Tax ID</label>
            <input
              type="text"
              value={gstinInput}
              onChange={(e) => setGstinInput(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Phone Number</label>
            <input
              type="text"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Email Address</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium text-foreground mb-1">Address / Location</label>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveProfile}
            className="flex items-center gap-1.5 px-4 py-2 text-xs bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Contact Info</span>
          </button>
        </div>
      </div>

      {/* Section 3: Appearance & Density */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <Palette className="h-5 w-5 text-indigo-500" />
          <div>
            <h3 className="text-sm font-bold text-foreground">Appearance & Interface</h3>
            <p className="text-xs text-muted-foreground">Customize theme and table view density</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-foreground mb-1">Theme Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {(['dark', 'light', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`py-2 text-xs capitalize font-semibold rounded-lg border transition ${
                    theme === t
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Table Density</label>
            <div className="grid grid-cols-3 gap-2">
              {(['compact', 'normal', 'comfortable'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setTableDensity(d)}
                  className={`py-2 text-xs capitalize font-semibold rounded-lg border transition ${
                    tableDensity === d
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Backup History & Safety */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Data Backups & Version Snapshots</h3>
              <p className="text-xs text-muted-foreground">
                Automatic and manual snapshot archives to safeguard against data loss
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Create New Backup</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {backups.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No previous backups found. Click "Create New Backup" above to make your first snapshot.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-semibold">Backup Filename</th>
                  <th className="pb-2 font-semibold">Timestamp</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {backups.map((b) => (
                  <tr key={b.filename} className="hover:bg-muted/20">
                    <td className="py-2.5 font-mono text-foreground">{b.filename}</td>
                    <td className="py-2.5 text-muted-foreground">{formatDate(b.timestamp)}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleRestore(b.path)}
                        className="inline-flex items-center gap-1 text-[11px] text-amber-500 hover:underline font-semibold"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Restore</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
