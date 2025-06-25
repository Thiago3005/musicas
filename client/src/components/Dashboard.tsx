import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Users, UserCheck, MessageSquare, Plus, Search, BarChart3, TrendingUp } from 'lucide-react';
import { useSupabaseMissas, useSupabaseMusicos } from '../hooks/useApi';
import { AnalyticsDashboard } from './relatorios/AnalyticsDashboard';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

export function Dashboard({ onTabChange }: DashboardProps) {
  const { missas } = useSupabaseMissas();
  const { musicos, sugestoes } = useSupabaseMusicos();

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const stats = [
    {
      title: 'Total de Missas',
      value: missas.length,
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Músicos Cadastrados',
      value: musicos.length,
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Músicos Disponíveis',
      value: musicos.filter(m => m.disponivel).length,
      icon: UserCheck,
      color: 'text-emerald-600'
    },
    {
      title: 'Sugestões Pendentes',
      value: Object.values(sugestoes).flat().filter(s => s.status === 'pendente').length,
      icon: MessageSquare,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do sistema</p>
        </div>

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar missa, músico ou data..."
                  className="pl-10"
                />
              </div>
            </div>
            <Button 
              onClick={() => onTabChange('missas')}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Missa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Missas</CardTitle>
          </CardHeader>
          <CardContent>
            {missas.slice(0, 5).map((missa) => (
              <Card key={missa.id} className="border-l-4 border-l-blue-500 mb-3">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{missa.tipo}</p>
                      <p className="text-sm text-gray-600">{missa.data} - {missa.horario}</p>
                      {missa.observacoes && (
                        <p className="text-xs text-gray-500 mt-1">{missa.observacoes}</p>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onTabChange('missas')}
                    >
                      Ver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {missas.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Nenhuma missa cadastrada
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Sistema migrado para Replit</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Database PostgreSQL configurado</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">Sistema pronto para uso</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}