import React, { useEffect, useState, useRef } from 'react';
import { MoreHorizontal, ArrowLeftRight, LogOut, Download, Trash2, X, AlertTriangle, Bell, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSettings } from '../context/AppSettingsContext';
import { cn } from '../utils/cn';

// ─── Delete Confirmation Modal ──────────────────────────────────────────────
function DeleteModal({ onConfirm, onCancel, isDeleting }) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Card */}
      <div
        className="relative z-10 w-full max-w-md bg-card-bg border border-border/60 rounded-2xl shadow-2xl p-6 flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors"
        >
          <X size={18} />
        </button>

        {/* Icon + Title */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle size={26} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Delete your account?</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            This will <span className="font-semibold text-red-400">permanently delete</span> your account and
            every journal entry you&apos;ve ever written. This action <span className="font-semibold">cannot be undone</span>.
          </p>
        </div>

        {/* Type to confirm */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-text-tertiary uppercase tracking-widest">
            Type <span className="text-red-400 font-bold">DELETE</span> to confirm
          </label>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            disabled={isDeleting}
            placeholder="DELETE"
            className="w-full bg-input-bg border border-border/60 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-red-500/60 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border/60 text-sm font-semibold text-text-secondary hover:bg-input-bg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm()}
            disabled={inputValue !== 'DELETE' || isDeleting}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2',
              inputValue === 'DELETE' && !isDeleting
                ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20 cursor-pointer'
                : 'bg-red-600/30 cursor-not-allowed'
            )}
          >
            {isDeleting ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Delete Account
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast Notification ──────────────────────────────────────────────────────
function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-[200] px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300',
      type === 'success'
        ? 'bg-card-bg border-green-500/30 text-text-primary'
        : 'bg-card-bg border-red-500/30 text-text-primary'
    )}>
      <span>{type === 'success' ? '✅' : '❌'}</span>
      {message}
      <button onClick={onDismiss} className="ml-2 text-text-tertiary hover:text-text-primary">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Reminder Settings Modal ──────────────────────────────────────────────────
const HOUR_LABELS = [
  '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM',
  '6:00 AM',  '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM',  '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM',
];

function ReminderSettingsModal({ onClose, onToast }) {
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(20);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/journal/reminders/preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          setEnabled(json.data.reminderEnabled);
          setHour(json.data.reminderHour);
        }
      } catch (e) { /* silent */ } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/journal/reminders/preferences`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderEnabled: enabled, reminderHour: hour }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        onToast('Reminder preferences saved!', 'success');
      } else {
        onToast(json.message || 'Failed to save preferences.', 'error');
      }
    } catch (e) {
      onToast('Error saving preferences: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-sm bg-card-bg border border-border/60 rounded-2xl shadow-2xl p-6 flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors">
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-14 w-14 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
            <Bell size={24} className="text-brand" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Daily Reminders</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Get a gentle nudge by email if you haven't journaled by your chosen time.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <span className="h-5 w-5 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Enable Toggle */}
            <div
              className="flex items-center justify-between p-4 rounded-xl bg-input-bg border border-border/60 cursor-pointer hover:border-brand/30 transition-all"
              onClick={() => setEnabled(v => !v)}
            >
              <div>
                <p className="text-sm font-semibold text-text-primary">Enable reminders</p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {enabled ? 'You will receive a daily reminder email' : 'No emails will be sent'}
                </p>
              </div>
              <button
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none shadow-sm',
                  enabled ? 'bg-brand' : 'bg-border'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none absolute left-[2px] top-[2px] inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300',
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            {/* Hour Picker */}
            <div className={cn('flex flex-col gap-2 transition-opacity duration-200', !enabled && 'opacity-40 pointer-events-none')}>
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                Remind me at
              </label>
              <select
                value={hour}
                onChange={e => setHour(Number(e.target.value))}
                className="w-full bg-input-bg border border-border/60 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand/60 transition-colors appearance-none cursor-pointer"
              >
                {HOUR_LABELS.map((label, idx) => (
                  <option key={idx} value={idx}>{label}</option>
                ))}
              </select>
              <p className="text-xs text-text-tertiary">
                If you haven't written by {HOUR_LABELS[hour]}, we'll send you an email.
              </p>
            </div>
          </>
        )}

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className={cn(
            'w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2',
            saved ? 'bg-emerald-500' : 'bg-brand hover:bg-brand-hover',
            (saving || loading) && 'opacity-60 cursor-not-allowed'
          )}
        >
          {saving ? (
            <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
          ) : saved ? (
            <><CheckCircle2 size={16} /> Saved!</>
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Avatar Component ────────────────────────────────────────────────────────
function Avatar({ src, name, size = 'sm' }) {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-[11px]' : 'h-10 w-10 text-sm';

  if (src && !imgFailed) {
    return (
      <img
        src={src}
        alt="Avatar"
        className={cn('rounded-full object-cover', sizeClass)}
        onError={() => setImgFailed(true)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-bold',
      sizeClass,
      size === 'sm'
        ? 'bg-text-primary text-bg-base shadow-sm'
        : 'bg-brand/10 border border-brand/20 text-brand'
    )}>
      {initial}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function HeaderActions({ className }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState(null);

  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const { isFullWidth, setIsFullWidth } = useAppSettings();
  const navigate = useNavigate();

  // ── Decode JWT ──────────────────────────────────────────────────────────
  let userEmail = 'Journal Keeper';
  let firstName = '';
  let lastName = '';
  let avatarUrl = '';

  try {
    const token = localStorage.getItem('token');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4);
      const payload = JSON.parse(window.atob(padded));
      userEmail = payload.sub || payload.email || 'Journal Keeper';
      firstName = payload.firstName || '';
      lastName = payload.lastName || '';
      avatarUrl = payload.avatarUrl || '';
    }
  } catch (e) { /* silent */ }

  const displayName = (firstName || lastName)
    ? `${firstName} ${lastName}`.trim()
    : userEmail.split('@')[0];

  // ── Click outside ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── Export Data ─────────────────────────────────────────────────────────
  const handleExportData = async () => {
    setIsExporting(true);
    setIsProfileOpen(false);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/journal/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const journals = data.data || [];
        
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - 2 * margin;

        const drawPageBackground = (d) => {
          d.setFillColor(19, 29, 38); // #131D26 website base background
          d.rect(0, 0, pageWidth, pageHeight, 'F');
        };

        const addNewPage = () => {
          doc.addPage();
          drawPageBackground(doc);
        };

        // Initialize page 1 background
        drawPageBackground(doc);

        let y = margin;

        // Title Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255); // White text
        doc.text('Quiet Room Journal Archives', margin, y);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(146, 169, 189); // Slate secondary text #92A9BD
        doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, margin, y);
        y += 8;

        doc.setDrawColor(38, 59, 76); // border #263B4C
        doc.line(margin, y, pageWidth - margin, y);
        y += 12;

        const MOOD_COLORS = {
          happy:     { r: 52,  g: 211, b: 153 }, // emerald
          neutral:   { r: 148, g: 163, b: 184 }, // slate
          sad:       { r: 96,  g: 165, b: 250 }, // blue
          stressed:  { r: 251, g: 191, b: 36  }, // amber
          motivated: { r: 167, g: 139, b: 250 }  // violet
        };

        // Helper to calculate entry height
        const calculateEntryHeight = (entry) => {
          let h = 16; // Date and mood line spacing + padding

          const getSectionLines = (text) => {
            if (!text || !text.trim()) return 0;
            const lines = doc.splitTextToSize(text, contentWidth - 12);
            return lines.length;
          };

          const countSection = (text) => {
            const lines = getSectionLines(text);
            return lines > 0 ? 5 + lines * 5 + 4 : 0;
          };

          h += countSection(entry.whatDidIDo);
          h += countSection(entry.bestMoment);
          h += countSection(entry.worstMoment);
          h += countSection(entry.whatILearned);
          h += countSection(entry.whatIDoForGoal);
          h += countSection(entry.feelingNote);

          const countListSection = (list) => {
            const cleanList = (list || []).filter(item => item && item.trim());
            if (cleanList.length === 0) return 0;
            let lh = 5; // header
            cleanList.forEach(item => {
              const lines = doc.splitTextToSize(`• ${item}`, contentWidth - 12);
              lh += lines.length * 5;
            });
            return lh + 4;
          };

          h += countListSection(entry.gratitude);
          h += countListSection(entry.shortTermGoal);
          h += countListSection(entry.longTermGoal);

          return h;
        };

        // Render entries
        journals.forEach((entry, index) => {
          const entryHeight = calculateEntryHeight(entry);

          // If entry doesn't fit on the page, and fits on a new page, insert a page break
          if (y + entryHeight > pageHeight - margin && entryHeight < pageHeight - 2 * margin) {
            addNewPage();
            y = margin;
          }

          const cardY = y;
          
          // Draw card background
          doc.setFillColor(27, 42, 54); // #1B2A36 card bg
          doc.setDrawColor(38, 59, 76); // #263B4C card border
          doc.roundedRect(margin, y, contentWidth, entryHeight, 4, 4, 'FD');

          y += 6; // card padding top

          // Draw Date
          const entryDate = entry.date 
            ? new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
            : 'Unknown Date';
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(226, 232, 240); // #E2E8F0 text primary
          doc.text(entryDate, margin + 6, y);

          // Draw Mood Circle indicator
          const moodKey = entry.feeling?.toLowerCase() || 'neutral';
          const moodColor = MOOD_COLORS[moodKey] || MOOD_COLORS.neutral;
          
          doc.setFillColor(moodColor.r, moodColor.g, moodColor.b);
          doc.circle(pageWidth - margin - 8, y - 1.2, 1.8, 'F');

          // Draw Mood Label text (No emoji to prevent font rendering bugs)
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(moodColor.r, moodColor.g, moodColor.b);
          const moodText = entry.feeling ? entry.feeling.charAt(0).toUpperCase() + entry.feeling.slice(1).toLowerCase() : 'Neutral';
          doc.text(moodText, pageWidth - margin - 14, y - 0.5, { align: 'right' });
          
          y += 8;

          // Sections drawing helper
          const drawSection = (title, text) => {
            if (!text || !text.trim()) return;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(59, 130, 246); // #3b82f6 brand
            doc.text(title.toUpperCase(), margin + 6, y);
            y += 4;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(226, 232, 240); // text-primary
            
            const lines = doc.splitTextToSize(text, contentWidth - 12);
            lines.forEach(line => {
              if (y > pageHeight - 12) {
                addNewPage();
                y = margin;
              }
              doc.text(line, margin + 6, y);
              y += 5;
            });
            y += 3;
          };

          drawSection('What I Did', entry.whatDidIDo);
          drawSection('Best Moment', entry.bestMoment);
          drawSection('Worst Moment', entry.worstMoment);
          drawSection('What I Learned', entry.whatILearned);
          drawSection('Work Done for Goal', entry.whatIDoForGoal);
          drawSection('Feeling Note', entry.feelingNote);

          // List drawing helper
          const drawListSection = (title, list) => {
            const cleanList = (list || []).filter(item => item && item.trim());
            if (cleanList.length === 0) return;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(59, 130, 246);
            doc.text(title.toUpperCase(), margin + 6, y);
            y += 4;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(226, 232, 240);

            cleanList.forEach(item => {
              const bullets = doc.splitTextToSize(`• ${item}`, contentWidth - 12);
              bullets.forEach(bullet => {
                if (y > pageHeight - 12) {
                  addNewPage();
                  y = margin;
                }
                doc.text(bullet, margin + 6, y);
                y += 5;
              });
            });
            y += 3;
          };

          drawListSection('Gratitudes', entry.gratitude);
          drawListSection('Short Term Goals', entry.shortTermGoal);
          drawListSection('Long Term Goals', entry.longTermGoal);

          // Gap between cards
          y = cardY + entryHeight + 8;
        });

        // Add page numbers footer to all pages
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(97, 122, 143); // slate tertiary
          doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        doc.save('my_journal_export.pdf');
        showToast('Your data has been exported as a premium PDF!', 'success');
      } else {
        showToast(data.message || 'Export failed. Please try again.', 'error');
      }
    } catch (e) {
      showToast('Export failed: ' + e.message, 'error');
    } finally {
      setIsExporting(false);
    }
  };



  // ── Delete Account ──────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const [rJournal, rAuth] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/journal/account`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/account`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (rJournal.ok && rAuth.ok) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setIsDeleting(false);
        setShowDeleteModal(false);
        showToast('Account deletion failed. Please try again.', 'error');
      }
    } catch (e) {
      setIsDeleting(false);
      setShowDeleteModal(false);
      showToast('Error: ' + e.message, 'error');
    }
  };

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDeleteAccount}
          onCancel={() => !isDeleting && setShowDeleteModal(false)}
          isDeleting={isDeleting}
        />
      )}

      {showReminderModal && (
        <ReminderSettingsModal
          onClose={() => setShowReminderModal(false)}
          onToast={showToast}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      <div className={cn('flex items-center gap-3 relative', className)}>
        {/* ── Avatar / Profile button ─────────────────────────────────── */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-transparent hover:ring-brand/40 transition-all duration-200"
            title="Account"
          >
            <Avatar src={avatarUrl} name={displayName} size="sm" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-card-bg/95 backdrop-blur-xl border border-border/50 rounded-[1.25rem] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">

              {/* Profile Header */}
              <div className="p-4 border-b border-border/50 bg-black/5 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 overflow-hidden rounded-full">
                    <Avatar src={avatarUrl} name={displayName} size="lg" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-text-primary truncate" title={displayName}>
                      {displayName}
                    </p>
                    <p className="text-xs text-text-tertiary truncate">{userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-2 border-b border-border/50 space-y-0.5">
                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="group w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-text-secondary hover:bg-input-bg hover:text-text-primary rounded-xl transition-all duration-150 text-left disabled:opacity-60"
                >
                  <span className="p-1.5 rounded-lg bg-text-tertiary/10 text-text-secondary group-hover:bg-brand/10 group-hover:text-brand transition-colors flex items-center justify-center">
                    {isExporting
                      ? <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : <Download size={13} />
                    }
                  </span>
                  {isExporting ? 'Exporting…' : 'Export My Data'}
                </button>

                <button
                  onClick={() => { setIsProfileOpen(false); setShowReminderModal(true); }}
                  className="group w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-text-secondary hover:bg-input-bg hover:text-text-primary rounded-xl transition-all duration-150 text-left"
                >
                  <span className="p-1.5 rounded-lg bg-brand/10 text-brand group-hover:bg-brand/20 transition-colors flex items-center justify-center">
                    <Bell size={13} />
                  </span>
                  Reminder Settings
                </button>

                <button
                  onClick={() => { setIsProfileOpen(false); setShowDeleteModal(true); }}
                  className="group w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-text-secondary hover:bg-red-500/8 hover:text-red-400 rounded-xl transition-all duration-150 text-left"
                >
                  <span className="p-1.5 rounded-lg bg-red-500/10 text-red-500 group-hover:bg-red-500/20 transition-colors flex items-center justify-center">
                    <Trash2 size={13} />
                  </span>
                  Delete My Account
                </button>
              </div>

              {/* Sign out */}
              <div className="p-2">
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Page Settings button ───────────────────────────────────────── */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-text-secondary hover:text-text-primary transition-colors p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          title="Page Settings"
        >
          <MoreHorizontal size={20} />
        </button>

        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 top-full mt-3 w-72 bg-card-bg/95 backdrop-blur-xl border border-border/50 rounded-[1.25rem] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right"
          >
            <div className="px-3 py-2.5 mb-1 border-b border-border/50">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.15em]">
                Display Settings
              </span>
            </div>

            <div
              className="flex flex-col gap-1 px-3 py-3 hover:bg-input-bg rounded-xl cursor-pointer transition-colors mt-1 group"
              onClick={() => setIsFullWidth(!isFullWidth)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 text-sm text-text-primary font-medium">
                  <div className="p-1.5 rounded-lg bg-text-tertiary/10 text-text-secondary group-hover:text-brand group-hover:bg-brand/10 transition-colors">
                    <ArrowLeftRight size={16} />
                  </div>
                  Full Canvas Width
                </div>
                <button
                  className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none shadow-sm',
                    isFullWidth ? 'bg-brand' : 'bg-border'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none absolute left-[2px] top-[2px] inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out',
                      isFullWidth ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
              <p className="text-xs text-text-tertiary pl-10 mt-0.5 leading-relaxed pr-8">
                Expands the editor seamlessly across ultra-wide monitors.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
