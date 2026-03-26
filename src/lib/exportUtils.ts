import * as XLSX from "xlsx";

export interface ExportColumn {
  header: string;
  key: string;
}

export interface ExportConfig {
  title: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
  fileName: string;
}

/**
 * Export data as Excel (.xlsx) file
 */
export function exportToExcel({ title, columns, data, fileName }: ExportConfig) {
  const headers = columns.map((c) => c.header);
  const rows = data.map((row) => columns.map((c) => row[c.key] ?? ""));

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  
  // Set column widths
  ws["!cols"] = columns.map(() => ({ wch: 20 }));
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

/**
 * Convert image URL to base64 data URI
 */
async function toBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

/**
 * Export data as PDF using browser print (full Arabic support)
 */
export async function exportToPDF({ title, columns, data, fileName }: ExportConfig) {
  const headers = columns.map((c) => c.header);
  const rows = data.map((row) => columns.map((c) => String(row[c.key] ?? "")));

  const dateStr = new Date().toLocaleDateString("ar-JO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Convert logos to base64 for embedding
  let moeLogo = "";
  let pearsonLogo = "";
  try {
    [moeLogo, pearsonLogo] = await Promise.all([
      toBase64("/images/moe-logo.png"),
      toBase64("/images/pearson-logo.png"),
    ]);
  } catch {
    // Logos will be empty if fetch fails
  }

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, sans-serif;
      direction: rtl;
      padding: 24px;
      color: #1a1a2e;
      background: #fff;
    }
    .logo-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 3px solid #3b3371;
    }
    .logo-bar .logo-right {
      width: 80px;
    }
    .logo-bar .logo-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .logo-bar .logo-center img {
      height: 70px;
      width: auto;
    }
    .logo-bar .logo-center h1 {
      font-size: 18px;
      font-weight: 700;
      color: #3b3371;
    }
    .logo-bar .logo-center .date {
      font-size: 11px;
      color: #666;
    }
    .logo-bar .logo-left img {
      height: 28px;
      width: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-top: 8px;
    }
    thead th {
      background: #3b3371;
      color: #fff;
      padding: 8px 10px;
      font-weight: 600;
      text-align: center;
      border: 1px solid #2d2759;
    }
    tbody td {
      padding: 6px 10px;
      text-align: center;
      border: 1px solid #ddd;
    }
    tbody tr:nth-child(even) {
      background: #f5f5fa;
    }
    .footer {
      text-align: center;
      margin-top: 16px;
      font-size: 10px;
      color: #999;
      padding-top: 8px;
      border-top: 1px solid #ddd;
    }
    @media print {
      body { padding: 12px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="logo-bar">
    <div class="logo-right"></div>
    <div class="logo-center">
      ${moeLogo ? `<img src="${moeLogo}" alt="وزارة التربية والتعليم" />` : ""}
      <h1>${title}</h1>
      <div class="date">${dateStr}</div>
    </div>
    <div class="logo-left">
      ${pearsonLogo ? `<img src="${pearsonLogo}" alt="Pearson" />` : ""}
    </div>
  </div>
  <table>
    <thead>
      <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}
    </tbody>
  </table>
  <div class="footer">منصة التدريب المهني WBL — وزارة التربية والتعليم بالتعاون مع Pearson — ${dateStr}</div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 600);
    };
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.onafterprint = () => {
      win.close();
      URL.revokeObjectURL(url);
    };
  }
}

// ============ Predefined export configs ============

export function getStudentsExportConfig(students: any[]): ExportConfig {
  return {
    title: "تقرير الطلاب",
    fileName: "students-report",
    columns: [
      { header: "اسم الطالب", key: "name" },
      { header: "الشركة", key: "company" },
      { header: "المشرف", key: "supervisor" },
      { header: "الحالة", key: "status" },
      { header: "التقدم %", key: "progress" },
    ],
    data: students,
  };
}

export function getAttendanceExportConfig(attendance: any[]): ExportConfig {
  return {
    title: "تقرير الحضور",
    fileName: "attendance-report",
    columns: [
      { header: "التاريخ", key: "date" },
      { header: "الطالب", key: "studentName" },
      { header: "وقت الدخول", key: "entryTime" },
      { header: "وقت الخروج", key: "exitTime" },
      { header: "الحالة", key: "status" },
    ],
    data: attendance,
  };
}

export function getWitnessExportConfig(witness: any[]): ExportConfig {
  return {
    title: "تقرير شهادات الشاهد",
    fileName: "witness-report",
    columns: [
      { header: "الطالب", key: "studentName" },
      { header: "الوحدة", key: "unitNumber" },
      { header: "النشاط", key: "activity" },
      { header: "P", key: "gradeP" },
      { header: "M", key: "gradeM" },
      { header: "D", key: "gradeD" },
      { header: "التاريخ", key: "date" },
    ],
    data: witness.map((w) => ({
      ...w,
      gradeP: w.gradeP ? "✓" : "—",
      gradeM: w.gradeM ? "✓" : "—",
      gradeD: w.gradeD ? "✓" : "—",
    })),
  };
}

export function getEvaluationsExportConfig(evaluations: any[]): ExportConfig {
  return {
    title: "تقرير التقييمات",
    fileName: "evaluations-report",
    columns: [
      { header: "الطالب", key: "studentName" },
      { header: "التقييم", key: "rating" },
      { header: "الملاحظات", key: "comment" },
      { header: "التاريخ", key: "date" },
    ],
    data: evaluations,
  };
}

export function getObservationsExportConfig(observations: any[]): ExportConfig {
  return {
    title: "تقرير سجلات المراقبة",
    fileName: "observations-report",
    columns: [
      { header: "الطالب", key: "studentName" },
      { header: "التاريخ", key: "date" },
      { header: "الأنشطة", key: "activities" },
      { header: "الأسئلة", key: "questions" },
      { header: "الأدلة", key: "evidence" },
      { header: "التوصيات", key: "recommendations" },
    ],
    data: observations,
  };
}

export function getStatsExportConfig(stats: any, newStats: any): ExportConfig {
  const data: Record<string, any>[] = [];

  if (stats) {
    data.push(
      { metric: "إجمالي الطلاب", value: stats.totalStudents },
      { metric: "قيد التدريب", value: stats.currentlyTraining },
      { metric: "تدريب مكتمل", value: stats.completed },
      { metric: "غير مُطابقين", value: stats.unmatched },
    );
  }

  if (newStats) {
    data.push(
      { metric: "المخالفات المفتوحة", value: newStats.violations.open },
      { metric: "إجمالي المخالفات", value: newStats.violations.total },
      { metric: "المخالفات المحلولة", value: newStats.violations.resolved },
      { metric: "عقود نشطة", value: newStats.contracts.active },
      { metric: "إجمالي العقود", value: newStats.contracts.total },
      { metric: "ساعات مكتملة", value: `${newStats.contracts.completedHours}/${newStats.contracts.totalHours}` },
      { metric: "المقابل المالي (دينار)", value: newStats.contracts.totalFinancial },
      { metric: "أهداف مختارة", value: newStats.skillsMatrix.selectedObjectives },
      { metric: "طلبات تدريب عبر المدارس", value: newStats.crossTraining.total },
      { metric: "طلبات معتمدة", value: newStats.crossTraining.approved },
      { metric: "خطط تصحيحية نشطة", value: newStats.corrective.active },
      { metric: "طلبات إعادة تسليم معلقة", value: newStats.resubmissions.pending },
    );
  }

  return {
    title: "ملخص الإحصائيات العامة",
    fileName: "statistics-summary",
    columns: [
      { header: "المؤشر", key: "metric" },
      { header: "القيمة", key: "value" },
    ],
    data,
  };
}
