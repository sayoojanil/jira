const PDFDocument = require('pdfkit');

/**
 * Generate a professional project invoice PDF
 * @param {Object} project  - Populated project document
 * @param {Array}  bugs     - Bug documents for the project
 * @param {Object} adminUser - Admin user document (name + email)
 * @returns {PDFDocument} - A piped-ready PDFDocument stream
 */
function generateProjectInvoice(project, bugs, adminUser) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `Project Invoice – ${project.name}`,
      Author: 'FreelancePortal',
      Subject: 'Project Status Invoice',
    },
  });

  // ─── Brand colours ───────────────────────────────────────────────
  const PRIMARY   = '#0e62e9';
  const DARK      = '#1e293b';
  const MUTED     = '#64748b';
  const LIGHT_BG  = '#f1f5f9';
  const SUCCESS   = '#16a34a';
  const WARNING   = '#d97706';
  const DANGER    = '#dc2626';
  const WHITE     = '#ffffff';

  const PAGE_W    = doc.page.width;
  const MARGIN    = 50;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  // ─── Helper utilities ─────────────────────────────────────────────
  const fmt = (date) =>
    date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  function pill(label, x, y, color = PRIMARY) {
    const pad = 6;
    const textW = doc.widthOfString(label, { fontSize: 8 });
    const pillW = textW + pad * 2;
    doc
      .roundedRect(x, y - 1, pillW, 14, 4)
      .fill(color);
    doc
      .fillColor(WHITE)
      .fontSize(8)
      .text(label, x + pad, y + 1.5, { lineBreak: false });
    return pillW;
  }

  function sectionHeader(title, y) {
    doc
      .rect(MARGIN, y, CONTENT_W, 22)
      .fill(PRIMARY);
    doc
      .fillColor(WHITE)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(title.toUpperCase(), MARGIN + 10, y + 6, { lineBreak: false });
    return y + 30;
  }

  function hRule(y, color = '#e2e8f0') {
    doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).strokeColor(color).lineWidth(0.5).stroke();
    return y + 8;
  }

  function checkNewPage(doc, y, needed = 80) {
    if (y + needed > doc.page.height - 80) {
      doc.addPage();
      addWatermark(doc, PAGE_W);
      return MARGIN + 20;
    }
    return y;
  }

  // ─── Watermark ────────────────────────────────────────────────────
  function addWatermark(d, pw) {
    d.save();
    d.rotate(-45, { origin: [pw / 2, d.page.height / 2] });
    d.fontSize(72)
      .fillColor('#0e62e9')
      .opacity(0.04)
      .font('Helvetica-Bold')
      .text('FREELANCE\nPORTAL', pw / 2 - 160, d.page.height / 2 - 80, {
        lineBreak: true,
        align: 'center',
      });
    d.opacity(1).restore();
  }

  addWatermark(doc, PAGE_W);

  // ─── HEADER BANNER ───────────────────────────────────────────────
  doc.rect(0, 0, PAGE_W, 110).fill(PRIMARY);

  // Company name
  doc
    .fillColor(WHITE)
    .font('Helvetica-Bold')
    .fontSize(24)
    .text('FreelancePortal', MARGIN, 22, { lineBreak: false });

  doc
    .fillColor('#bfdbfe')
    .font('Helvetica')
    .fontSize(9)
    .text('Professional Project Management', MARGIN, 50, { lineBreak: false });

  // Invoice badge
  doc
    .roundedRect(PAGE_W - 160, 18, 110, 36, 6)
    .fillAndStroke('#1d4ed8', '#1e40af');

  doc
    .fillColor(WHITE)
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('INVOICE', PAGE_W - 152, 26, { lineBreak: false });

  // Invoice date
  doc
    .fillColor('#bfdbfe')
    .font('Helvetica')
    .fontSize(8)
    .text(`Date: ${fmt(new Date())}`, MARGIN, 70, { lineBreak: false });

  // Generated badge
  doc
    .fillColor('#bfdbfe')
    .fontSize(8)
    .text('Official Project Document', PAGE_W - 200, 70, { align: 'right', lineBreak: false });

  let y = 130;

  // ─── PROJECT INFO CARD ───────────────────────────────────────────
  doc.rect(MARGIN, y, CONTENT_W, 110).fill(LIGHT_BG).stroke('#e2e8f0');

  doc
    .fillColor(DARK)
    .font('Helvetica-Bold')
    .fontSize(16)
    .text(project.name, MARGIN + 14, y + 12, { lineBreak: false });

  // Status pill
  const statusColors = {
    Completed: SUCCESS,
    'In Progress': PRIMARY,
    Pending: WARNING,
    'On Hold': DANGER,
    Checking: '#7c3aed',
  };
  pill(project.status, MARGIN + 14 + doc.widthOfString(project.name, { fontSize: 16 }) + 12, y + 13, statusColors[project.status] || MUTED);

  doc
    .fillColor(MUTED)
    .font('Helvetica')
    .fontSize(9)
    .text(project.description || '', MARGIN + 14, y + 34, {
      width: CONTENT_W - 28,
      lineBreak: true,
      height: 36,
      ellipsis: true,
    });

  // Metadata row
  const metaY = y + 80;
  const cols = [
    { label: 'Deadline', value: fmt(project.deadline) },
    { label: 'Status', value: project.status },
    { label: 'Progress', value: `${project.progress}%` },
    { label: 'Team Members', value: String(project.assignedTeam?.length || 0) },
    { label: 'Milestones', value: String(project.milestones?.length || 0) },
    { label: 'Bugs Reported', value: String(bugs.length) },
  ];

  const colW = CONTENT_W / cols.length;
  cols.forEach((col, i) => {
    const cx = MARGIN + colW * i + 14;
    doc.fillColor(MUTED).font('Helvetica').fontSize(7).text(col.label, cx, metaY, { lineBreak: false });
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9).text(col.value, cx, metaY + 9, { lineBreak: false });
  });

  y += 125;

  // ─── CLIENTS ─────────────────────────────────────────────────────
  const clients = project.assignedClients?.length > 0
    ? project.assignedClients
    : project.client ? [project.client] : [];

  if (clients.length > 0) {
    y = sectionHeader('Client Information', y);

    clients.forEach((client) => {
      y = checkNewPage(doc, y, 40);
      doc
        .fillColor(DARK)
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('👤  ' + (client.name || 'N/A'), MARGIN + 8, y, { lineBreak: false });
      doc
        .fillColor(MUTED)
        .font('Helvetica')
        .fontSize(8)
        .text(client.email || '', MARGIN + 8 + doc.widthOfString('👤  ' + (client.name || 'N/A'), { fontSize: 9 }) + 10, y + 0.5, { lineBreak: false });
      y += 16;
    });

    y += 6;
  }

  // ─── REQUIREMENTS ────────────────────────────────────────────────
  if (project.requirements && project.requirements.length > 0) {
    y = checkNewPage(doc, y, 60);
    y = sectionHeader('Project Requirements', y);

    project.requirements.forEach((req, i) => {
      y = checkNewPage(doc, y, 22);
      const rowBg = i % 2 === 0 ? WHITE : LIGHT_BG;
      doc.rect(MARGIN, y - 2, CONTENT_W, 18).fill(rowBg);
      doc
        .fillColor(PRIMARY)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(`${i + 1}.`, MARGIN + 8, y + 2, { lineBreak: false, width: 16 });
      doc
        .fillColor(DARK)
        .font('Helvetica')
        .fontSize(8)
        .text(req, MARGIN + 26, y + 2, { width: CONTENT_W - 36, lineBreak: false, ellipsis: true });
      y += 18;
    });
    y += 8;
  }

  // ─── MILESTONES ──────────────────────────────────────────────────
  y = checkNewPage(doc, y, 80);
  y = sectionHeader('Project Milestones', y);

  if (project.milestones && project.milestones.length > 0) {
    // Table header
    doc.rect(MARGIN, y, CONTENT_W, 18).fill('#dbeafe');
    doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(8);
    doc.text('#', MARGIN + 8, y + 5, { lineBreak: false, width: 20 });
    doc.text('Milestone Title', MARGIN + 30, y + 5, { lineBreak: false, width: 240 });
    doc.text('Due Date', MARGIN + 280, y + 5, { lineBreak: false, width: 100 });
    doc.text('Status', MARGIN + 390, y + 5, { lineBreak: false, width: 80 });
    y += 18;

    project.milestones.forEach((ms, i) => {
      y = checkNewPage(doc, y, 22);
      const rowBg = i % 2 === 0 ? WHITE : LIGHT_BG;
      doc.rect(MARGIN, y, CONTENT_W, 20).fill(rowBg);

      doc.fillColor(MUTED).font('Helvetica').fontSize(8).text(String(i + 1), MARGIN + 8, y + 6, { lineBreak: false, width: 20 });
      doc.fillColor(DARK).font('Helvetica').fontSize(8).text(ms.title, MARGIN + 30, y + 6, { lineBreak: false, width: 240 });
      doc.fillColor(MUTED).font('Helvetica').fontSize(8).text(fmt(ms.dueDate), MARGIN + 280, y + 6, { lineBreak: false, width: 100 });

      const statusLabel = ms.isCompleted ? 'Done' : 'Pending';
      const statusColor = ms.isCompleted ? SUCCESS : WARNING;
      pill(statusLabel, MARGIN + 390, y + 6, statusColor);

      y += 20;
    });
  } else {
    doc.fillColor(MUTED).font('Helvetica').fontSize(9).text('No milestones have been set for this project.', MARGIN + 10, y, { lineBreak: false });
    y += 20;
  }
  y += 12;

  // ─── BUGS ────────────────────────────────────────────────────────
  y = checkNewPage(doc, y, 80);
  y = sectionHeader('Bug Reports', y);

  if (bugs.length > 0) {
    // Table header
    doc.rect(MARGIN, y, CONTENT_W, 18).fill('#fee2e2');
    doc.fillColor(DANGER).font('Helvetica-Bold').fontSize(8);
    doc.text('#', MARGIN + 8, y + 5, { lineBreak: false, width: 20 });
    doc.text('Bug Title', MARGIN + 30, y + 5, { lineBreak: false, width: 180 });
    doc.text('Priority', MARGIN + 220, y + 5, { lineBreak: false, width: 70 });
    doc.text('Status', MARGIN + 295, y + 5, { lineBreak: false, width: 80 });
    doc.text('Reported By', MARGIN + 380, y + 5, { lineBreak: false, width: 100 });
    y += 18;

    const priorityColors = { Critical: DANGER, High: '#ea580c', Medium: WARNING, Low: PRIMARY };
    const bugStatusColors = { Open: DANGER, 'Under Review': '#7c3aed', Fixed: SUCCESS, Closed: MUTED };

    bugs.forEach((bug, i) => {
      y = checkNewPage(doc, y, 24);
      const rowBg = i % 2 === 0 ? WHITE : '#fff5f5';
      doc.rect(MARGIN, y, CONTENT_W, 22).fill(rowBg);

      doc.fillColor(MUTED).font('Helvetica').fontSize(8).text(String(i + 1), MARGIN + 8, y + 7, { lineBreak: false, width: 20 });
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(8).text(bug.title, MARGIN + 30, y + 7, { lineBreak: false, width: 180 });
      pill(bug.priority, MARGIN + 220, y + 7, priorityColors[bug.priority] || MUTED);
      pill(bug.status, MARGIN + 295, y + 7, bugStatusColors[bug.status] || MUTED);
      doc.fillColor(MUTED).font('Helvetica').fontSize(7).text(bug.reporter?.name || 'Unknown', MARGIN + 380, y + 8, { lineBreak: false, width: 100 });

      y += 22;
    });
  } else {
    doc.fillColor(SUCCESS).font('Helvetica').fontSize(9).text('✓  No bugs reported – project is clean!', MARGIN + 10, y, { lineBreak: false });
    y += 20;
  }
  y += 18;

  // ─── SUMMARY STATS ───────────────────────────────────────────────
  y = checkNewPage(doc, y, 70);
  y = sectionHeader('Summary', y);

  const completedMilestones = project.milestones?.filter(m => m.isCompleted).length || 0;
  const totalMilestones = project.milestones?.length || 0;
  const openBugs = bugs.filter(b => b.status === 'Open').length;
  const fixedBugs = bugs.filter(b => ['Fixed', 'Closed'].includes(b.status)).length;

  const statCols = [
    { label: 'Overall Progress', value: `${project.progress}%`, color: PRIMARY },
    { label: 'Milestones Done', value: `${completedMilestones} / ${totalMilestones}`, color: SUCCESS },
    { label: 'Open Bugs', value: String(openBugs), color: openBugs > 0 ? DANGER : SUCCESS },
    { label: 'Fixed/Closed Bugs', value: String(fixedBugs), color: SUCCESS },
  ];

  const statW = CONTENT_W / statCols.length;
  statCols.forEach((stat, i) => {
    const sx = MARGIN + statW * i;
    doc.rect(sx + 2, y, statW - 4, 50).fill(LIGHT_BG).stroke('#e2e8f0');
    doc.fillColor(stat.color).font('Helvetica-Bold').fontSize(18)
      .text(stat.value, sx + 2, y + 8, { width: statW - 4, align: 'center', lineBreak: false });
    doc.fillColor(MUTED).font('Helvetica').fontSize(7)
      .text(stat.label, sx + 2, y + 34, { width: statW - 4, align: 'center', lineBreak: false });
  });

  y += 68;

  // ─── FOOTER – ADMIN SIGNATURE ────────────────────────────────────
  y = checkNewPage(doc, y, 120);
  y = hRule(y);

  doc
    .fillColor(MUTED)
    .font('Helvetica')
    .fontSize(8)
    .text(
      'This document is an official project status invoice generated by FreelancePortal. All information is accurate as of the date stated above.',
      MARGIN,
      y,
      { width: CONTENT_W * 0.55, lineBreak: true }
    );

  // Signature box
  const sigX = PAGE_W - 220;
  doc.rect(sigX, y - 6, 170, 80).fill(LIGHT_BG).stroke('#e2e8f0');

  doc
    .fillColor(DARK)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text('Authorised Signatory', sigX + 10, y, { lineBreak: false });

  // Decorative signature line
  doc
    .moveTo(sigX + 10, y + 38)
    .lineTo(sigX + 158, y + 38)
    .strokeColor('#1e293b')
    .lineWidth(1)
    .stroke();

  // Admin name
  doc
    .fillColor(DARK)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(adminUser?.name || 'Administrator', sigX + 10, y + 42, { lineBreak: false });

  doc
    .fillColor(MUTED)
    .font('Helvetica')
    .fontSize(7)
    .text(adminUser?.email || '', sigX + 10, y + 54, { lineBreak: false });

  doc
    .fillColor(MUTED)
    .font('Helvetica')
    .fontSize(7)
    .text('Admin — FreelancePortal', sigX + 10, y + 63, { lineBreak: false });

  // ─── PAGE FOOTER STRIP ───────────────────────────────────────────
  const totalPages = doc.bufferedPageRange ? doc.bufferedPageRange().count : 1;
  doc.rect(0, doc.page.height - 28, PAGE_W, 28).fill(PRIMARY);
  doc
    .fillColor(WHITE)
    .font('Helvetica')
    .fontSize(7)
    .text(
      `FreelancePortal  |  Confidential Project Document  |  Generated: ${fmt(new Date())}`,
      MARGIN,
      doc.page.height - 19,
      { align: 'left', lineBreak: false }
    );
  doc
    .fillColor(WHITE)
    .font('Helvetica')
    .fontSize(7)
    .text(`Page 1 of ${totalPages}`, 0, doc.page.height - 19, {
      align: 'right',
      width: PAGE_W - MARGIN,
      lineBreak: false,
    });

  doc.end();
  return doc;
}

module.exports = { generateProjectInvoice };
