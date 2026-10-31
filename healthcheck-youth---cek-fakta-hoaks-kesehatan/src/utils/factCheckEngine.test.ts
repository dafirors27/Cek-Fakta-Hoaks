import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterReports,
  calculateReportStats,
  validateReportInput,
  exportReportsToCSV,
  getStatusBadgeConfig
} from './factCheckEngine.ts';
import { ReportItem } from '../types/index.ts';

const SAMPLE_REPORTS: ReportItem[] = [
  {
    id: 't-1',
    timestamp: '2026-10-30T10:00:00.000Z',
    reporterName: 'Andi',
    platform: 'TikTok',
    claim: 'Daun sirih bisa membersihkan katarak mata',
    evidenceUrl: 'https://tiktok.com/@test/1',
    status: 'HOAKS',
    medicalExplanation: 'Sangat berbahaya bagi kornea mata.',
    referenceUrl: 'https://kemkes.go.id'
  },
  {
    id: 't-2',
    timestamp: '2026-10-30T11:00:00.000Z',
    reporterName: 'Budi',
    platform: 'Instagram',
    claim: 'Tidur cukup 8 jam menjaga imunitas tubuh',
    evidenceUrl: 'https://instagram.com/p/123',
    status: 'FAKTA',
    medicalExplanation: 'Terbukti meregenerasi sel imun tubuh.',
    referenceUrl: 'https://who.int'
  },
  {
    id: 't-3',
    timestamp: '2026-10-30T12:00:00.000Z',
    reporterName: 'Cici',
    platform: 'WhatsApp',
    claim: 'Minum air es memicu lemak beku',
    evidenceUrl: 'https://example.com/wa',
    status: 'MENUNGGU',
    medicalExplanation: '',
    referenceUrl: ''
  }
];

test('calculateReportStats calculates correct counts', () => {
  const stats = calculateReportStats(SAMPLE_REPORTS);
  assert.equal(stats.total, 3);
  assert.equal(stats.pending, 1);
  assert.equal(stats.hoaks, 1);
  assert.equal(stats.fakta, 1);
  assert.equal(stats.misinformasi, 0);
  assert.equal(stats.verified, 2);
});

test('filterReports filters by search query on claim and reporter', () => {
  const queryResult = filterReports(SAMPLE_REPORTS, 'katarak');
  assert.equal(queryResult.length, 1);
  assert.equal(queryResult[0].id, 't-1');

  const reporterResult = filterReports(SAMPLE_REPORTS, 'Budi');
  assert.equal(reporterResult.length, 1);
  assert.equal(reporterResult[0].id, 't-2');

  const emptyResult = filterReports(SAMPLE_REPORTS, 'astronomi');
  assert.equal(emptyResult.length, 0);
});

test('filterReports filters by status', () => {
  const hoaksOnly = filterReports(SAMPLE_REPORTS, '', 'HOAKS');
  assert.equal(hoaksOnly.length, 1);
  assert.equal(hoaksOnly[0].status, 'HOAKS');

  const pendingOnly = filterReports(SAMPLE_REPORTS, '', 'MENUNGGU');
  assert.equal(pendingOnly.length, 1);
  assert.equal(pendingOnly[0].id, 't-3');
});

test('filterReports filters by platform', () => {
  const tiktokOnly = filterReports(SAMPLE_REPORTS, '', 'SEMUA', 'TikTok');
  assert.equal(tiktokOnly.length, 1);
  assert.equal(tiktokOnly[0].platform, 'TikTok');
});

test('validateReportInput catches short claim or missing url', () => {
  const invalid = validateReportInput({
    claim: 'pendek',
    evidenceUrl: '',
    platform: ''
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.claim);
  assert.ok(invalid.errors.evidenceUrl);
  assert.ok(invalid.errors.platform);

  const valid = validateReportInput({
    claim: 'Klaim kesehatan viral yang panjang dan informatif',
    evidenceUrl: 'https://tiktok.com/video/12345',
    platform: 'TikTok'
  });
  assert.equal(valid.valid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('exportReportsToCSV produces formatted CSV text', () => {
  const csv = exportReportsToCSV(SAMPLE_REPORTS);
  assert.ok(csv.includes('ID,Timestamp,Pelapor,Platform,Klaim'));
  assert.ok(csv.includes('Daun sirih bisa membersihkan katarak mata'));
  assert.ok(csv.includes('HOAKS'));
});

test('getStatusBadgeConfig returns valid labels and icons', () => {
  const hoaksBadge = getStatusBadgeConfig('HOAKS');
  assert.equal(hoaksBadge.label, 'HOAKS');
  assert.equal(hoaksBadge.icon, '❌');

  const faktaBadge = getStatusBadgeConfig('FAKTA');
  assert.equal(faktaBadge.label, 'FAKTA');
  assert.equal(faktaBadge.icon, '✅');
});
