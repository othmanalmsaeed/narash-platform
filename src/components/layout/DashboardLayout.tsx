import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
