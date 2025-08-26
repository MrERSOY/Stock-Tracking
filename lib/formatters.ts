// lib/formatters.ts

import { format } from "date-fns";

/**
 * Bir sayı değerini, başında para birimi simgesi olmadan,
 * Türkçe sayı formatına (örn: 1.250,50) çevirir.
 * Eğer değer bir sayı değilse, 'N/A' döndürerek hatayı engeller.
 * @param amount - Formatlanacak sayısal değer.
 * @returns Formatlanmış sayı string'i veya 'N/A'.
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (typeof amount !== "number") {
    return "N/A";
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Bir tarih nesnesini, dil paketine ihtiyaç duymayan,
 * evrensel ve okunaklı bir formata çevirir.
 * @param date - Formatlanacak tarih nesnesi.
 * @returns Formatlanmış tarih string'i (örn: "2025-07-02 19:05").
 */
export const formatDateTime = (date: Date | string | number): string => {
  try {
    return format(new Date(date), "yyyy-MM-dd HH:mm");
  } catch {
    // DÜZELTME: Kullanılmayan hata parametresi tamamen kaldırıldı.
    console.error("Invalid date provided for formatting:", date);
    return "Geçersiz Tarih";
  }
};
