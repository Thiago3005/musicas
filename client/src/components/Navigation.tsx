
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Music, 
  MessageSquare, 
  FileText,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  User
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '../components/auth/AuthProvider';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userType?: 'admin' | 'musico';
}

export function Navigation({ activeTab, onTabChange, userType = 'admin' }: NavigationProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  // Tabs baseadas no tipo de usuário
  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'missas', label: 'Missas', icon: Calendar },
    { id: 'musicos', label: 'Músicos', icon: Users },
    { id: 'biblioteca', label: 'Biblioteca', icon: Music },
    { id: 'buscar', label: 'Buscar', icon: FileText },
    { id: 'disponibilidade', label: 'Disponibilidade', icon: Calendar },
    { id: 'sugestoes', label: 'Sugestões', icon: MessageSquare },
    { id: 'relatorios', label: 'Relatórios', icon: FileText },
    { id: 'usuarios', label: 'Usuários', icon: Users }
  ];

  const musicoTabs = [
    { id: 'minhas-missas', label: 'Minhas Missas', icon: Calendar },
    { id: 'meu-perfil', label: 'Meu Perfil', icon: Users },
    { id: 'disponibilidade', label: 'Disponibilidade', icon: Calendar },
    { id: 'musicas', label: 'Partituras', icon: Music }
  ];

  const tabs = userType === 'admin' ? adminTabs : musicoTabs;

  return (
    <div className={cn(
      "bg-slate-900 text-white transition-all duration-300 flex flex-col min-h-screen",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold">Música Litúrgica</h1>
              <p className="text-xs text-slate-400">Paróquia Boa Viagem</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-white hover:bg-slate-800"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full justify-start gap-3 h-12 rounded-none px-4 text-left",
                "hover:bg-slate-800 hover:text-white",
                isActive && "bg-blue-600 text-white hover:bg-blue-700 border-r-2 border-blue-400"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{tab.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Footer com controles de usuário e tema */}
      <div className="mt-auto p-4 border-t border-slate-700 space-y-3">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {!collapsed && <span className="text-sm">Alternar Tema</span>}
        </Button>
        
        {/* User info */}
        {!collapsed && user && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.nome}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}
        
        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="text-sm">Sair</span>}
        </Button>
        
        {!collapsed && (
          <p className="text-xs text-slate-400 text-center">
            Sistema de Gestão Musical
          </p>
        )}
      </div>
    </div>
  );
}
