// components/UserList.tsx
"use client"; // Eğer gelecekte state veya etkileşim eklenirse

import React from "react";
import Image from "next/image";

// Örnek Kullanıcı Veri Tipi
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Aktif" | "Pasif" | "Beklemede";
}

// Sabit default avatar URL'i
const defaultAvatarUrl =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format";

// Örnek Kullanıcı Verisi (Bu veriyi projenize göre özelleştirebilirsiniz)
const teamMembers: User[] = [
  {
    id: "u01",
    name: "Ali Veli",
    email: "ali.veli@acme.com",
    role: "Yönetici",
    status: "Aktif",
  },
  {
    id: "u02",
    name: "Ayşe Fatma",
    email: "ayse.f@acme.com",
    role: "Editör",
    status: "Aktif",
  },
];

export default function UserList() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {teamMembers.map((member) => (
          <li
            key={member.id}
            className="p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <Image
                src={defaultAvatarUrl}
                alt={member.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {member.name}
                </p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">{member.role}</p>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  member.status === "Aktif"
                    ? "bg-green-100 text-green-800"
                    : member.status === "Beklemede"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {member.status}
              </span>
              <button className="text-gray-400 hover:text-gray-600">...</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
