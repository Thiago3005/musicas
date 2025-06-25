import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, FileText, Download, TrendingUp, Users, Music, Clock } from 'lucide-react';
import { useSupabaseMissas, useSupabaseMusicos } from '../../hooks/useApi';

export function RelatoriosManager() {
  const [tipoRelatorio, setTipoRelatorio] = useState('missas');
  const [periodo, setPeriodo] = useState('mes-atual');
  
  const { missas } = useSupabaseMissas();
  const { musicos, sugestoes } = useSupabaseMusicos();

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  // Filtrar dados baseado no período
  const filtrarPorPeriodo = (data: string) => {
    const dataObj = new Date(data);
    switch (periodo) {
      case 'mes-atual':
        return dataObj >= inicioMes && dataObj <= fimMes;
      case 'mes-anterior':
        const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        return dataObj >= inicioMesAnterior && dataObj <= fimMesAnterior;
      case 'ano-atual':
        return dataObj.getFullYear() === hoje.getFullYear();
      default:
        return true;
    }
  };

  const missasFiltradas = missas.filter(missa => filtrarPorPeriodo(missa.data));
  const musicosCadastrados = musicos.filter(musico => filtrarPorPeriodo(musico.created_at));

  // Estatísticas
  const estatisticas = {
    totalMissas: missasFiltradas.length,
    totalMusicos: musicos.length,
    musicosAtivos: musicos.filter(m => m.disponivel).length,
    sugestoesPendentes: Object.values(sugestoes).flat().filter(s => s.status === 'pendente').length,
    sugestoesImplementadas: Object.values(sugestoes).flat().filter(s => s.status === 'implementada').length
  };

  // Missas por tipo
  const missasPorTipo = missasFiltradas.reduce((acc, missa) => {
    acc[missa.tipo] = (acc[missa.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Músicos por função
  const musicosPorFuncao = musicos.reduce((acc, musico) => {
    acc[musico.funcao] = (acc[musico.funcao] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const gerarRelatorioPDF = () => {
    // Aqui seria implementada a geração de PDF
    alert('Funcionalidade de PDF será implementada em breve!');
  };

  const cards = [
    {
      title: 'Total de Missas',
      value: estatisticas.totalMissas,
      icon: Calendar,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Músicos Cadastrados',
      value: estatisticas.totalMusicos,
      icon: Users,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Músicos Ativos',
      value: estatisticas.musicosAtivos,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      title: 'Sugestões Pendentes',
      value: estatisticas.sugestoesPendentes,
      icon: Clock,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Relatórios e Histórico
          </h1>
          <p className="text-gray-600 mt-1">Análise detalhada das atividades</p>
        </div>
        <Button onClick={gerarRelatorioPDF} className="bg-slate-900 hover:bg-slate-800">
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Relatório</label>
              <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="missas">Relatório de Missas</SelectItem>
                  <SelectItem value="musicos">Relatório de Músicos</SelectItem>
                  <SelectItem value="sugestoes">Relatório de Sugestões</SelectItem>
                  <SelectItem value="geral">Relatório Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes-atual">Mês Atual</SelectItem>
                  <SelectItem value="mes-anterior">Mês Anterior</SelectItem>
                  <SelectItem value="ano-atual">Ano Atual</SelectItem>
                  <SelectItem value="todos">Todos os Registros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {card.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${card.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detalhes por Tipo de Relatório */}
      {tipoRelatorio === 'missas' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Missas por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(missasPorTipo).map(([tipo, quantidade]) => (
                  <div key={tipo} className="flex justify-between items-center">
                    <span className="font-medium">{tipo}</span>
                    <span className="text-gray-600">{quantidade}</span>
                  </div>
                ))}
                {Object.keys(missasPorTipo).length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Nenhuma missa no período selecionado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimas Missas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {missasFiltradas.slice(-5).reverse().map((missa) => (
                  <div key={missa.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{missa.tipo}</p>
                      <p className="text-sm text-gray-600">{missa.data}</p>
                    </div>
                    <span className="text-sm text-gray-500">{missa.horario}</span>
                  </div>
                ))}
                {missasFiltradas.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Nenhuma missa no período selecionado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tipoRelatorio === 'musicos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Músicos por Função</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(musicosPorFuncao).map(([funcao, quantidade]) => (
                  <div key={funcao} className="flex justify-between items-center">
                    <span className="font-medium">{funcao}</span>
                    <span className="text-gray-600">{quantidade}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status dos Músicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-600">Disponíveis</span>
                  <span className="text-gray-600">{estatisticas.musicosAtivos}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-red-600">Indisponíveis</span>
                  <span className="text-gray-600">{estatisticas.totalMusicos - estatisticas.musicosAtivos}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="text-gray-600">{estatisticas.totalMusicos}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tipoRelatorio === 'sugestoes' && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Sugestões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {estatisticas.sugestoesPendentes}
                </p>
                <p className="text-sm text-gray-600">Pendentes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {estatisticas.sugestoesImplementadas}
                </p>
                <p className="text-sm text-gray-600">Implementadas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {Object.values(sugestoes).flat().filter(s => s.status === 'recusada').length}
                </p>
                <p className="text-sm text-gray-600">Recusadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}