import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  CheckSquare,
  Scale,
  Building2,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Globe,
  ChevronDown,
  Package,
  Receipt,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useSidebarContext } from "./AppLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  titleKey: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  isDrowpdown?: boolean;
}

const mainNavItems: NavItem[] = [
  { titleKey: "nav.dashboard", href: "/", icon: LayoutDashboard },
  { titleKey: "nav.myPOs", href: "/pos", icon: FileText },
  {
    titleKey: "nav.newPO",
    href: "/pos/new",
    icon: FilePlus,
    isDrowpdown: true,
  },
  {
    titleKey: "nav.approvals",
    href: "/approvals",
    icon: CheckSquare,
    badge: 3,
  },
  { titleKey: "nav.legal", href: "/legal", icon: Scale },
  { titleKey: "nav.suppliers", href: "/suppliers", icon: Building2 },
];

const settingsNavItems: NavItem[] = [
  { titleKey: "nav.users", href: "/usuarios", icon: Users },
  { titleKey: "nav.settings", href: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } =
    useSidebarContext();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === "pt" ? "en" : "pt");
  };

  const handleNewPOSelect = (typeOfPO: string) => {
    navigate(`/pos/new?type=${typeOfPO}`);
    handleNavClick();
  };

  const NewPODropdown = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    const title = t(item.titleKey);

    const dropdownContent = (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full",
              "hover:bg-sidebar-accent/80",
              active && "bg-sidebar-accent text-sidebar-accent-foreground",
              !active &&
                "text-sidebar-foreground/80 hover:text-sidebar-foreground",
              collapsed && "lg:justify-center lg:px-2"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span
              className={cn(
                "font-medium text-sm flex-1 text-left",
                collapsed && "lg:hidden"
              )}
            >
              {title}
            </span>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0", collapsed && "lg:hidden")}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={collapsed ? "right" : "bottom"}
          align="start"
          className="w-56 bg-popover border border-border shadow-lg z-60"
        >
          <DropdownMenuItem
            onClick={() => handleNewPOSelect("produtos_servicos")}
            className="cursor-pointer"
          >
            <Package className="h-4 w-4 mr-2" />
            {t("poType.produtos_servicos")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleNewPOSelect("reembolso")}
            className="cursor-pointer"
          >
            <Receipt className="h-4 w-4 mr-2" />
            {t("poType.reembolso")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild className="hidden lg:flex">
            {dropdownContent}
          </TooltipTrigger>
          <TooltipContent side="right">{title}</TooltipContent>
        </Tooltip>
      );
    }

    return dropdownContent;
  };

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    if (item.isDrowpdown) return <NewPODropdown item={item} />;

    const active = isActive(item.href);
    const Icon = item.icon;
    const title = t(item.titleKey);

    const content = (
      <NavLink
        to={item.href}
        onClick={handleNavClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full",
          "hover:bg-sidebar-accent/80",
          active && "bg-sidebar-accent text-sidebar-accent-foreground",
          !active && "text-sidebar-foreground/80 hover:text-sidebar-foreground",
          collapsed && "lg:justify-center lg:px-2"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span
          className={cn(
            "font-medium text-sm flex-1 text-left",
            collapsed && "lg:hidden"
          )}
        >
          {title}
        </span>
        {item.badge && item.badge > 0 && (
          <span
            className={cn(
              "bg-warning text-warning-foreground text-xs font-semibold px-2 py-0.5 rounded-full",
              collapsed && "lg:hidden"
            )}
          >
            {item.badge}
          </span>
        )}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild className="hidden lg:flex">
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {title}
            {item.badge && item.badge > 0 && (
              <span className="bg-warning text-warning-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 top-0 z-50 bg-sidebar transition-all duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
        collapsed ? "lg:w-16" : "lg:w-64",
        "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Área do Logo */}
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b border-sidebar-border",
            collapsed ? "lg:justify-center" : "justify-between"
          )}
        >
          <div
            className={cn("flex items-center gap-2", collapsed && "lg:hidden")}
          >
            <div className="h-8 w-auto rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0">
              <img
                src="/logo.png"
                alt="Aqua Capital Logo"
                className="h-8 w-auto cursor-pointer"
                onClick={() => setCollapsed(!collapsed)}
              />
            </div>
            <div>
              <h1 className="text-sidebar-foreground font-semibold text-sm">
                {t("common.erp")}
              </h1>
              <p className="text-sidebar-muted text-xs">Aqua Capital</p>
            </div>
          </div>

          {/* Logo recolhido - apenas desktop */}
          <div
            className={cn(
              "h-8 w-8 rounded-lg bg-sidebar-accent items-center justify-center shrink-0",
              collapsed ? "hidden lg:flex" : "hidden"
            )}
          >
            <Menu
              className="text-white cursor-pointer"
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>

          {/* Botão fechar mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 min-h-0 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          <p
            className={cn(
              "text-sidebar-muted text-xs font-medium uppercase tracking-wider px-3 mb-2",
              collapsed && "lg:hidden"
            )}
          >
            {t("nav.main")}
          </p>
          {mainNavItems.map((item) => (
            <NavItemComponent key={item.href} item={item} />
          ))}

          <Separator className="my-4 bg-sidebar-border" />

          <p
            className={cn(
              "text-sidebar-muted text-xs font-medium uppercase tracking-wider px-3 mb-2",
              collapsed && "lg:hidden"
            )}
          >
            {t("nav.settings")}
          </p>
          {settingsNavItems.map((item) => (
            <NavItemComponent key={item.href} item={item} />
          ))}
        </nav>

        {/* Rodapé */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          {/* Alternância de Idioma */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className={cn(
                  "w-full text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                  collapsed ? "lg:justify-center lg:px-0" : "justify-start"
                )}
              >
                <Globe className="h-4 w-4 shrink-0" />
                <span
                  className={cn("ml-2 font-medium", collapsed && "lg:hidden")}
                >
                  {language === "pt" ? "Português" : "English"}
                </span>
                <span
                  className={cn(
                    "ml-auto text-xs bg-sidebar-accent px-1.5 py-0.5 rounded",
                    collapsed && "lg:hidden"
                  )}
                >
                  {language.toUpperCase()}
                </span>
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                {language === "pt" ? "Português" : "English"} (
                {language.toUpperCase()})
              </TooltipContent>
            )}
          </Tooltip>

          {/* Botão de recolher - apenas desktop */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 hidden lg:flex justify-start",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>{t("nav.collapse")}</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 justify-start",
              collapsed && "lg:justify-center lg:px-0"
            )}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className={cn(collapsed && "lg:hidden")}>
              {t("nav.logout")}
            </span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
