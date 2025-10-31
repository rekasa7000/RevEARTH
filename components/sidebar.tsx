"use client";

import { Calendar, Home, Inbox, LogOut, User, Settings, ChevronUp, Building2 } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useUser, signOutUser } from "@/lib/auth/auth-hooks";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Facilities",
    url: "/facilities",
    icon: Building2,
  },
  {
    title: "Calculation",
    url: "/calculation",
    icon: Inbox,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: Calendar,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const user = useUser();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    await signOutUser({
      onRequest: () => {
        setIsLoggingOut(true);
      },
      onSuccess: () => {
        // Redirect handled by signOutUser
      },
      onError: (error) => {
        console.error("Logout error:", error);
        setIsLoggingOut(false);
      },
    });
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-6 flex justify-center gap-2 w-full">
            <Image src="/assets/logo2.png" width={35} height={35} alt="RevEarth Logo" className="object-contain" />
            <div>
              <span className="text-[#A5C046] text-2xl">Rev</span>
              <span className="text-[#00594D] text-2xl font-bold">EARTH</span>
            </div>
          </div>
          <SidebarGroupContent className="mt-4">
            <SidebarMenu className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className={
                          isActive
                            ? "flex items-center gap-3 px-4 py-2.5 transition-colors bg-[#A5C046]/10 text-[#00594D] font-semibold"
                            : "flex items-center gap-3 px-4 py-2.5 transition-colors rounded-lg hover:bg-accent"
                        }
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="h-auto p-0 w-full">
                      <div className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors hover:bg-accent w-full">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground flex-shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col items-start overflow-hidden flex-1">
                          <span className="text-sm font-medium truncate max-w-full">{user?.name || "User"}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-full">{user?.email || ""}</span>
                        </div>
                        <ChevronUp className="w-4 h-4 ml-auto flex-shrink-0" />
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <a href="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
