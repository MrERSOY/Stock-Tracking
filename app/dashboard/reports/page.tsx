// app/dashboard/reports/page.tsx
import type { Metadata } from "next";
import { FileText, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Raporlar | Dashboard",
};

// Örnek Rapor Verisi
const reportsData = [
  {
    id: 1,
    name: "Aylık Satış Raporu - Mayıs 2024",
    date: "01.06.2024",
    type: "Satış",
  },
  {
    id: 2,
    name: "Envanter Durum Raporu",
    date: "31.05.2024",
    type: "Envanter",
  },
  {
    id: 3,
    name: "Kullanıcı Aktivite Raporu",
    date: "30.05.2024",
    type: "Kullanıcı",
  },
  {
    id: 4,
    name: "Aylık Satış Raporu - Nisan 2024",
    date: "01.05.2024",
    type: "Satış",
  },
];

export default function ReportsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <FileText className="w-8 h-8 text-gray-700" />
          <h1 className="text-3xl font-bold">Raporlar</h1>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Yeni Rapor Oluştur
        </button>
      </div>
      <p className="text-gray-600 mb-8">
        Oluşturulmuş raporları görüntüleyin ve indirin.
      </p>

      {/* Rapor Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {reportsData.map((report) => (
            <li
              key={report.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div>
                <p className="text-md font-semibold text-gray-800">
                  {report.name}
                </p>
                <p className="text-sm text-gray-500">
                  Oluşturma Tarihi: {report.date} - Tip: {report.type}
                </p>
              </div>
              <button
                className="p-2 rounded-md hover:bg-gray-200 text-gray-600"
                title="Raporu İndir"
              >
                <Download className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
