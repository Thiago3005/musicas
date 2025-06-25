import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Music, Users, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useEffect, useState } from 'react';

interface AnalyticsData {
  missasPorMes: Array<{ mes: string; quantidade: number }>;
  musicosMaisAtuantes: Array<{ nome: string; participacoes: number }>;
  sugestoesPorStatus: Array<{ status: string; count: number; color: string }>;
  musicasMaisUsadas: Array<{ nome: string; usos: number; cantor?: string }>;
  disponibilidadeCoral: Array<{ dia: string; disponivel: number; total: number }>;
  partesCarentes: Array<{ parte: string; preenchimento: number; total: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await get('/analytics');
      setAnalyticsData(data);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      // Dados de exemplo para demonstração
      setAnalyticsData({
        missasPorMes: [
          { mes: 'Jul', quantidade: 8 },
          { mes: 'Ago', quantidade: 12 },
          { mes: 'Set', quantidade: 10 },
          { mes: 'Out', quantidade: 15 },
          { mes: 'Nov', quantidade: 14 },
          { mes: 'Dez', quantidade: 18 }
        ],
        musicosMaisAtuantes: [
          { nome: 'Maria Silva', participacoes: 24 },
          { nome: 'João Santos', participacoes: 20 },
          { nome: 'Ana Costa', participacoes: 18 },
          { nome: 'Pedro Lima', participacoes: 15 },
          { nome: 'Carlos Oliveira', participacoes: 12 }
        ],
        sugestoesPorStatus: [
          { status: 'Pendente', count: 5, color: '#FFBB28' },
          { status: 'Aprovada', count: 12, color: '#00C49F' },
          { status: 'Recusada', count: 3, color: '#FF8042' }
        ],
        musicasMaisUsadas: [
          { nome: 'Ave Maria', usos: 15, cantor: 'Schubert' },
          { nome: 'Pange Lingua', usos: 12, cantor: 'Tradicional' },
          { nome: 'Veni Creator', usos: 10, cantor: 'Gregoriano' },
          { nome: 'Te Deum', usos: 8, cantor: 'Tradicional' },
          { nome: 'Magnificat', usos: 7, cantor: 'Bach' }
        ],
        disponibilidadeCoral: [
          { dia: 'Dom', disponivel: 8, total: 10 },
          { dia: 'Seg', disponivel: 3, total: 10 },
          { dia: 'Ter', disponivel: 4, total: 10 },
          { dia: 'Qua', disponivel: 6, total: 10 },
          { dia: 'Qui', disponivel: 5, total: 10 },
          { dia: 'Sex', disponivel: 4, total: 10 },
          { dia: 'Sáb', disponivel: 7, total: 10 }
        ],
        partesCarentes: [
          { parte: 'Entrada', preenchimento: 85, total: 100 },
          { parte: 'Kyrie', preenchimento: 60, total: 100 },
          { parte: 'Gloria', preenchimento: 75, total: 100 },
          { parte: 'Aclamação', preenchimento: 45, total: 100 },
          { parte: 'Ofertório', preenchimento: 90, total: 100 },
          { parte: 'Sanctus', preenchimento: 55, total: 100 },
          { parte: 'Comunhão', preenchimento: 80, total: 100 },
          { parte: 'Saída', preenchimento: 70, total: 100 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Relatórios e Analytics</h1>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Relatórios e Analytics</h1>
          <p className="text-muted-foreground">Erro ao carregar dados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Relatórios e Analytics</h1>
        <p className="text-muted-foreground">
          Análises detalhadas do sistema musical
        </p>
      </div>

      {/* Grid de gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Missas por mês */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Missas por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.missasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Músicos mais atuantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Músicos Mais Atuantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.musicosMaisAtuantes} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nome" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="participacoes" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sugestões por status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sugestões por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.sugestoesPorStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.sugestoesPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Disponibilidade do coral */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Disponibilidade do Coral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.disponibilidadeCoral}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="disponivel" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="total" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Músicas mais usadas e partes carentes */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Músicas mais usadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Músicas Mais Usadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.musicasMaisUsadas.map((musica, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{musica.nome}</p>
                    {musica.cantor && (
                      <p className="text-sm text-muted-foreground">{musica.cantor}</p>
                    )}
                  </div>
                  <Badge variant="secondary">{musica.usos} usos</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Partes da missa mais carentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Partes Mais Carentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.partesCarentes.map((parte, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{parte.parte}</span>
                    <span className="text-sm text-muted-foreground">{parte.preenchimento}%</span>
                  </div>
                  <Progress value={parte.preenchimento} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}