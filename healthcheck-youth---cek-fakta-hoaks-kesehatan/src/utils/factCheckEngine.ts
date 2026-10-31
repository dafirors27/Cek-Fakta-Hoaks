import { ReportItem, ReportStatus, SocialPlatform } from '../types/index.ts';

export function filterReports(
  reports: ReportItem[],
  query: string,
  statusFilter: string = 'SEMUA',
  platformFilter: string = 'SEMUA'
): ReportItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return reports.filter((report) => {
    // Status filter
    if (statusFilter !== 'SEMUA' && report.status !== statusFilter) {
      return false;
    }

    // Platform filter
    if (platformFilter !== 'SEMUA' && report.platform !== platformFilter) {
      return false;
    }

    // Query search (searches claim, reporterName, medicalExplanation, category)
    if (normalizedQuery) {
      const matchClaim = report.claim.toLowerCase().includes(normalizedQuery);
      const matchReporter = report.reporterName.toLowerCase().includes(normalizedQuery);
      const matchExplanation = (report.medicalExplanation || '').toLowerCase().includes(normalizedQuery);
      const matchCategory = (report.category || '').toLowerCase().includes(normalizedQuery);
      return matchClaim || matchReporter || matchExplanation || matchCategory;
    }

    return true;
  });
}

export function calculateReportStats(reports: ReportItem[]) {
  const total = reports.length;
  const pending = reports.filter((r) => r.status === 'MENUNGGU').length;
  const hoaks = reports.filter((r) => r.status === 'HOAKS').length;
  const fakta = reports.filter((r) => r.status === 'FAKTA').length;
  const misinformasi = reports.filter((r) => r.status === 'MISINFORMASI').length;
  const verified = hoaks + fakta + misinformasi;

  return {
    total,
    pending,
    hoaks,
    fakta,
    misinformasi,
    verified,
  };
}

export function validateReportInput(data: {
  claim?: string;
  evidenceUrl?: string;
  platform?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.claim || data.claim.trim().length < 10) {
    errors.claim = 'Klaim kesehatan minimal 10 karakter agar dapat dianalisis dengan akurat.';
  }

  if (!data.evidenceUrl || data.evidenceUrl.trim().length < 5) {
    errors.evidenceUrl = 'Link bukti atau tautan video wajib disertakan.';
  } else {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?/i;
    if (!urlPattern.test(data.evidenceUrl.trim())) {
      errors.evidenceUrl = 'Format link URL video/bukti tidak valid.';
    }
  }

  if (!data.platform) {
    errors.platform = 'Pilih platform media sosial sumber klaim.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatIndonesianDate(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function getStatusBadgeConfig(status: ReportStatus) {
  switch (status) {
    case 'FAKTA':
      return {
        label: 'FAKTA',
        icon: '✅',
        bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        badgeColor: 'bg-emerald-500',
        textColor: 'text-emerald-700 dark:text-emerald-400',
      };
    case 'HOAKS':
      return {
        label: 'HOAKS',
        icon: '❌',
        bgColor: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
        badgeColor: 'bg-rose-500',
        textColor: 'text-rose-700 dark:text-rose-400',
      };
    case 'MISINFORMASI':
      return {
        label: 'MISINFORMASI',
        icon: '⚠️',
        bgColor: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
        badgeColor: 'bg-amber-500',
        textColor: 'text-amber-700 dark:text-amber-400',
      };
    case 'MENUNGGU':
    default:
      return {
        label: 'MENUNGGU REVIEW',
        icon: '⏳',
        bgColor: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        badgeColor: 'bg-slate-400',
        textColor: 'text-slate-600 dark:text-slate-400',
      };
  }
}

export function exportReportsToCSV(reports: ReportItem[]): string {
  const headers = [
    'ID',
    'Timestamp',
    'Pelapor',
    'Platform',
    'Klaim',
    'Link Bukti',
    'Status',
    'Penjelasan Medis',
    'Link Referensi',
    'Tanggal Review',
    'Reviewer'
  ];

  const escapeCSV = (str: string = '') => {
    const clean = str.replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = reports.map((r) => [
    escapeCSV(r.id),
    escapeCSV(r.timestamp),
    escapeCSV(r.reporterName),
    escapeCSV(r.platform),
    escapeCSV(r.claim),
    escapeCSV(r.evidenceUrl),
    escapeCSV(r.status),
    escapeCSV(r.medicalExplanation || ''),
    escapeCSV(r.referenceUrl || ''),
    escapeCSV(r.reviewedAt || ''),
    escapeCSV(r.reviewedBy || '')
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

export function generateGoogleAppsScriptCode(): string {
  return `/**
 * Google Apps Script Backend for HealthCheck Youth (Headless CMS)
 * Petunjuk:
 * 1. Buat Google Spreadsheet baru di Google Drive Anda.
 * 2. Beri nama sheet: 'Laporan'.
 * 3. Buka menu Extensions > Apps Script.
 * 4. Ganti semua kode dengan skrip ini.
 * 5. Klik 'Deploy' > 'New deployment'.
 * 6. Pilih type: 'Web app'.
 * 7. Set 'Execute as': 'Me' dan 'Who has access': 'Anyone'.
 * 8. Salin URL Web app (https://script.google.com/macros/s/.../exec) ke pengaturan HealthCheck Youth.
 */

function setupHeaders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = [
    'ID', 'Timestamp', 'Pelapor', 'Platform', 'Klaim', 
    'Link Bukti', 'Status', 'Penjelasan Medis', 'Link Referensi', 'Tanggal Review', 'Reviewer'
  ];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
  }
}

function doGet(e) {
  setupHeaders();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, reports: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var reports = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    reports.push({
      id: row[0] || 'rep-' + i,
      timestamp: row[1] || new Date().toISOString(),
      reporterName: row[2] || 'Anonim',
      platform: row[3] || 'Lainnya',
      claim: row[4] || '',
      evidenceUrl: row[5] || '',
      status: row[6] || 'MENUNGGU',
      medicalExplanation: row[7] || '',
      referenceUrl: row[8] || '',
      reviewedAt: row[9] || '',
      reviewedBy: row[10] || ''
    });
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, reports: reports }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  setupHeaders();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var body = JSON.parse(e.postData.contents);
  var action = body.action || 'submitReport';

  if (action === 'submitReport') {
    var report = body.report;
    sheet.appendRow([
      report.id,
      report.timestamp || new Date().toISOString(),
      report.reporterName || 'Anonim',
      report.platform,
      report.claim,
      report.evidenceUrl,
      report.status || 'MENUNGGU',
      report.medicalExplanation || '',
      report.referenceUrl || '',
      report.reviewedAt || '',
      report.reviewedBy || ''
    ]);

    return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Laporan tersimpan di Google Sheets' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'updateReview') {
    var updated = body.report;
    var data = sheet.getDataRange().getValues();
    var found = false;

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === updated.id) {
        sheet.getRange(i + 1, 7).setValue(updated.status);
        sheet.getRange(i + 1, 8).setValue(updated.medicalExplanation);
        sheet.getRange(i + 1, 9).setValue(updated.referenceUrl);
        sheet.getRange(i + 1, 10).setValue(updated.reviewedAt || new Date().toISOString());
        sheet.getRange(i + 1, 11).setValue(updated.reviewedBy || 'Admin');
        found = true;
        break;
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ success: found, message: found ? 'Data berhasil diupdate' : 'ID tidak ditemukan' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Aksi tidak dikenali' }))
    .setMimeType(ContentService.MimeType.JSON);
}`;
}
