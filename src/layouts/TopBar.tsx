import { useLocation, Link } from "react-router-dom";
import { Bell, ChevronRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "./AppLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { users } from "@/data/mockdata";

interface Breadcrumb {
  labelKey: string;
  href?: string;
}

const routeBreadcrumbs: Record<string, Breadcrumb[]> = {
  "/": [{ labelKey: "nav.dashboard" }],
  "/pos": [{ labelKey: "breadcrumb.purchaseOrders" }],
  "/pos/new": [
    { labelKey: "breadcrumb.purchaseOrders", href: "/pos" },
    { labelKey: "breadcrumb.newPO" },
  ],
  "/approvals": [{ labelKey: "breadcrumb.approvals" }],
  "/legal": [{ labelKey: "breadcrumb.legal" }],
  "/cadastros": [{ labelKey: "breadcrumb.registrations" }],
  "/usuarios": [{ labelKey: "breadcrumb.users" }],
  "/configuracoes": [{ labelKey: "breadcrumb.settings" }],
};

export function TopBar() {
  const curretUser = users[0];
  const { collapsed, setMobileOpen } = useSidebarContext();
  const { t } = useLanguage();
  const location = useLocation();

  const breadcrumbs = routeBreadcrumbs[location.pathname] || [
    { labelKey: "common.home" },
  ];

  const notifications = [
    {
      id: 1,
      titleKey: "notification.poAwaitingApproval",
      message: "PO-2024-0003",
      messageKey: "notification.requiresAnalysis",
      time: "5 min",
      unread: true,
    },
    {
      id: 2,
      titleKey: "notification.poApproved",
      message: "PO-2024-0001",
      messageKey: "notification.wasApproved",
      time: "1h",
      unread: true,
    },
    {
      id: 3,
      titleKey: "notification.contractExpiring",
      message: "#123",
      messageKey: "notification.expiresIn",
      days: 7,
      time: "2h",
      unread: true,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-card border-b border-border transition-all duration-300",
        "left-0 lg:left-64",
        collapsed && "lg:left-16"
      )}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Esquerda: Botão de menu + Breadcrumb */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <nav className="flex items-center gap-1 text-sm overflow-hidden">
            <Link
              to="/"
              className="text-text-secondary hover:text-foreground transition-colors shrink-0"
            >
              {t("common.home")}
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1 min-w-0">
                <ChevronRight className="h-4 w-4 text-text-secondary shrink-0" />
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="text-text-secondary hover:text-foreground transition-colors truncate"
                  >
                    {t(crumb.labelKey)}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium truncate">
                    {t(crumb.labelKey)}
                  </span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Direita: Notificações, Usuário */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notificações */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-text-secondary" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-warning"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>{t("common.notifications")}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary"
                >
                  {t("common.markAllRead")}
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 py-3"
                >
                  <div className="flex items-center gap-2 w-full">
                    {notification.unread && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                    <span
                      className={cn(
                        "font-medium text-sm",
                        notification.unread
                          ? "text-foreground"
                          : "text-text-secondary"
                      )}
                    >
                      {t(notification.titleKey)}
                    </span>
                    <span className="text-xs text-text-secondary ml-auto">
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary pl-4">
                    {notification.message} {t(notification.messageKey)}
                    {notification.days &&
                      ` ${notification.days} ${t("notification.days")}`}
                  </p>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary">
                {t("notification.viewAllNotifications")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menu do Usuário */}
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {curretUser.prefix}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block text-right">
            <p className="text-sm font-medium">{curretUser.name}</p>
            <p className="text-xs text-text-secondary">{curretUser.function}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
