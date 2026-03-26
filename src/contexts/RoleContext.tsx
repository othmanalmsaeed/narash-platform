import React, { createContext, useContext, useState } from "react";

export type UserRole = "student" | "company" | "school" | "admin" | "regional";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType>({ role: "student", setRole: () => {} });

export const useRole = () => useContext(RoleContext);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>("student");
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
};

export const roleLabels: Record<UserRole, string> = {
  student: "الطالب",
  company: "مشرف العمل",
  school: "المشرف المدرسي",
  admin: "مدير النظام",
  regional: "المنسق الإقليمي",
};
