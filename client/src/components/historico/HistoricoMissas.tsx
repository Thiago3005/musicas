
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Music, Users, Search } from 'lucide-react';
import { useState } from 'react';
import { Missa } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoricoMissasProps {
  missas: Missa[];
}

export function HistoricoMissas({ missas }: HistoricoMissasProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAno, setFiltroAno] = useState<string>('todos');

  const missasPassadas = missas
    .filter(missa => new Date(missa.data) < new Date())
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const filteredMissas = missasPassadas.filter(missa => {
    const matchesSearch = missa.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         missa.musicas.some(m => m.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesYear = filtroAno === 'todos' || 
                       new Date(missa.data).getFullYear().toString() === filtroAno;
    
    return matchesSearch && matchesYear;
  });

  const anosDisponiveis = [...new Set(missasPassadas.map(m => new Date(m.data).getFullYear()))]
    .sort((a, b) => b - a);

  const estatisticas = {
    totalMissas: missasPassadas.length,
    totalMusicas: missasPassadas.reduce((acc, m) => acc + m.musicas.length, 0),
    musicaMaisUsada: getMusicaMaisUsada(missasPassadas),
    mesAtivo: getMesComMaisMissas(missasPassadas)
  };

  function getMusicaMaisUsada(missas: Missa[]) {
    const contagem: { [key: string]: number } = {};
    missas.forEach(missa => {
      missa.musicas.forEach(musica => {
        contagem[musica.nome] = (contagem[musica.nome] || 0) + 1;
      });
    });
    
    const musicaMaisUsada = Object.entries(contagem)
      .sort(([,a], [,b]) => b - a)[0];
    
    return musicaMaisUsada ? { nome: musicaMaisUsada[0], count: musicaMaisUsada[1] } : null;
  }

  function getMesComMaisMissas(missas: Missa[]) {
    const contagem: { [key: string]: number } = {};
    missas.forEach(missa => {
      const mes = format(new Date(missa.data), 'MMMM yyyy', { locale: ptBR });
      contagem[mes] = (contagem[mes] || 0) + 1;
    });
    
    const mesComMaisMissas = Object.entries(contagem)
      .sort(([,a], [,b]) => b - a)[0];
    
    return mesComMaisMissas ? { mes: mesComMaisMissas[0], count: mesComMaisMissas[1] } : null;
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center">
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Missas Realizadas</p>
              <p className="text-2xl font-bold">{estatisticas.totalMissas}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <Music className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Músicas Tocadas</p>
              <p className="text-2xl font-bold">{estatisticas.totalMusicas}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Música Mais Usada</p>
            <p className="text-lg font-bold truncate">
              {estatisticas.musicaMaisUsada?.nome || 'N/A'}
            </p>
            {estatisticas.musicaMaisUsada && (
              <p className="text-xs text-gray-500">
                {estatisticas.musicaMaisUsada.count} vezes
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Mês Mais Ativo</p>
            <p className="text-lg font-bold">
              {estatisticas.mesAtivo?.mes || 'N/A'}
            </p>
            {estatisticas.mesAtivo && (
              <p className="text-xs text-gray-500">
                {estatisticas.mesAtivo.count} missas
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Histórico de Missas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por tipo de missa ou música..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filtroAno}
              onChange={(e) => setFiltroAno(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="todos">Todos os anos</option>
              {anosDisponiveis.map(ano => (
                <option key={ano} value={ano.toString()}>{ano}</option>
              ))}
            </select>
          </div>

          {/* Lista de missas */}
          <div className="space-y-4">
            {filteredMissas.map((missa) => (
              <div key={missa.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-lg">{missa.tipo}</h3>
                    <p className="text-gray-600">
                      {format(new Date(missa.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} - {missa.horario}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      <Music className="h-3 w-3 mr-1" />
                      {missa.musicas.length} músicas
                    </Badge>
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {missa.musicosEscalados.length} músicos
                    </Badge>
                  </div>
                </div>
                
                {missa.musicas.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Músicas tocadas:</p>
                    <div className="flex flex-wrap gap-1">
                      {missa.musicas.slice(0, 5).map((musica) => (
                        <Badge key={musica.id} variant="secondary" className="text-xs">
                          {musica.nome}
                        </Badge>
                      ))}
                      {missa.musicas.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{missa.musicas.length - 5} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {missa.observacoes && (
                  <p className="text-sm text-gray-500 italic mt-2">{missa.observacoes}</p>
                )}
              </div>
            ))}
            
            {filteredMissas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Nenhuma missa encontrada no histórico</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
