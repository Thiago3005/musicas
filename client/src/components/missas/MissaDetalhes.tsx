
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Download, FileText, Music, Youtube, Trash2, Library, Users, UserPlus } from 'lucide-react';
import { Missa, Musica, SECOES_LITURGICAS, SecaoLiturgica } from '../../types';
import { MusicaSelector } from './MusicaSelector';
import { EscalarMusicoModal } from './EscalarMusicoModal';
import { BibliotecaMusica } from '@/hooks/useApi';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';

interface MissaDetalhesProps {
  missa: Missa;
  onAddMusica: (missaId: string, musica: Omit<Musica, 'id' | 'missaId'>) => void;
  onRemoveMusica: (missaId: string, musicaId: string) => void;
  onBack: () => void;
}

export function MissaDetalhes({ missa, onAddMusica, onRemoveMusica, onBack }: MissaDetalhesProps) {
  const [novaMusica, setNovaMusica] = useState({
    nome: '',
    cantor: '',
    linkYoutube: '',
    partitura: '',
    linkDownload: '',
    observacoes: '',
    secaoLiturgica: 'entrada' as SecaoLiturgica
  });
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoLiturgica>('entrada');
  const [showMusicaSelector, setShowMusicaSelector] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showEscalarMusico, setShowEscalarMusico] = useState(false);
  const [musicosEscalados, setMusicosEscalados] = useState<any[]>([]);
  const { get } = useApi();

  useEffect(() => {
    fetchMusicosEscalados();
  }, [missa.id]);

  const fetchMusicosEscalados = async () => {
    try {
      const escalados = await get(`/missa-musicos/${missa.id}`);
      setMusicosEscalados(escalados);
    } catch (error) {
      console.error('Erro ao carregar músicos escalados:', error);
    }
  };

  const handleRemoverEscalacao = async (escalacaoId: string) => {
    try {
      await fetch(`/api/missa-musicos/${escalacaoId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      toast.success('Músico removido da escala!');
      fetchMusicosEscalados();
    } catch (error) {
      console.error('Erro ao remover escalação:', error);
      toast.error('Erro ao remover músico da escala');
    }
  };

  const getMusicasPorSecao = (secao: SecaoLiturgica) => {
    return missa.musicas.filter(musica => musica.secaoLiturgica === secao);
  };

  const handleAddMusica = () => {
    if (novaMusica.nome.trim()) {
      onAddMusica(missa.id, { ...novaMusica, secaoLiturgica: secaoAtiva });
      setNovaMusica({
        nome: '',
        cantor: '',
        linkYoutube: '',
        partitura: '',
        linkDownload: '',
        observacoes: '',
        secaoLiturgica: secaoAtiva
      });
      setShowManualForm(false);
    }
  };

  const handleSelectFromBiblioteca = (musica: BibliotecaMusica, secaoLiturgica: SecaoLiturgica) => {
    const musicaData = {
      nome: musica.nome,
      cantor: musica.cantor || '',
      linkYoutube: musica.link_youtube || '',
      partitura: musica.partitura || '',
      linkDownload: musica.link_download || '',
      observacoes: musica.observacoes || '',
      secaoLiturgica
    };
    onAddMusica(missa.id, musicaData);
  };

  return (
    <div className="space-y-6">
      {/* Header da Missa */}
      <div className="flex items-center justify-between">
        <div>
          <Button onClick={onBack} variant="outline" className="mb-4">
            ← Voltar
          </Button>
          <h2 className="text-2xl font-bold">{missa.tipo}</h2>
          <p className="text-muted-foreground">
            {new Date(missa.data).toLocaleDateString('pt-BR')} - {missa.horario}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Baixar ZIP
          </Button>
        </div>
      </div>

      {/* Navegação das Seções Litúrgicas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {Object.entries(SECOES_LITURGICAS).map(([secao, label]) => {
          const musicasCount = getMusicasPorSecao(secao as SecaoLiturgica).length;
          return (
            <Button
              key={secao}
              variant={secaoAtiva === secao ? "default" : "outline"}
              onClick={() => setSecaoAtiva(secao as SecaoLiturgica)}
              className="text-xs p-2 h-auto flex flex-col items-center"
            >
              <span className="text-center">{label}</span>
              {musicasCount > 0 && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {musicasCount}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Seção Ativa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {SECOES_LITURGICAS[secaoAtiva]}
            <span className="text-sm font-normal text-gray-500">
              {getMusicasPorSecao(secaoAtiva).length} música(s)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Botões para adicionar música */}
          <div className="flex gap-3 mb-6">
            <Button 
              onClick={() => setShowMusicaSelector(true)}
              className="flex-1"
              variant="default"
            >
              <Library className="h-4 w-4 mr-2" />
              Adicionar da Biblioteca
            </Button>
            <Button 
              onClick={() => setShowManualForm(!showManualForm)}
              variant="outline"
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showManualForm ? 'Fechar Formulário' : 'Adicionar Manualmente'}
            </Button>
          </div>

          {/* Formulário manual (quando aberto) */}
          {showManualForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <Input
                  placeholder="Nome da música"
                  value={novaMusica.nome}
                  onChange={(e) => setNovaMusica({ ...novaMusica, nome: e.target.value })}
                />
              </div>
              <div>
                <Input
                  placeholder="Cantor/Intérprete"
                  value={novaMusica.cantor}
                  onChange={(e) => setNovaMusica({ ...novaMusica, cantor: e.target.value })}
                />
              </div>
              <div>
                <Input
                  placeholder="Link do YouTube"
                  value={novaMusica.linkYoutube}
                  onChange={(e) => setNovaMusica({ ...novaMusica, linkYoutube: e.target.value })}
                />
              </div>
              <div>
                <Input
                  placeholder="Link de Download"
                  value={novaMusica.linkDownload}
                  onChange={(e) => setNovaMusica({ ...novaMusica, linkDownload: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  placeholder="Partitura (texto)"
                  value={novaMusica.partitura}
                  onChange={(e) => setNovaMusica({ ...novaMusica, partitura: e.target.value })}
                  rows={3}
                  className="font-mono"
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  placeholder="Observações"
                  value={novaMusica.observacoes}
                  onChange={(e) => setNovaMusica({ ...novaMusica, observacoes: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <Button onClick={handleAddMusica} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Música
                </Button>
              </div>
            </div>
          )}

          {/* Lista de músicas da seção */}
          <div className="space-y-3">
            {getMusicasPorSecao(secaoAtiva).map((musica) => (
              <div key={musica.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{musica.nome}</h4>
                    {musica.cantor && (
                      <p className="text-sm text-gray-600">por {musica.cantor}</p>
                    )}
                    {musica.observacoes && (
                      <p className="text-sm text-gray-500 italic mt-1">{musica.observacoes}</p>
                    )}
                    
                    {/* Mostrar partitura em texto se disponível */}
                    {musica.partitura && musica.partitura.length > 10 && !musica.partitura.startsWith('http') && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <FileText className="h-3 w-3" />
                          <span className="font-medium">Partitura:</span>
                        </div>
                        <div className="font-mono text-gray-700 max-h-20 overflow-y-auto whitespace-pre-wrap">
                          {musica.partitura}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {musica.linkYoutube && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={musica.linkYoutube} target="_blank" rel="noopener noreferrer">
                          <Youtube className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {musica.partitura && musica.partitura.startsWith('http') && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={musica.partitura} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Music className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => onRemoveMusica(missa.id, musica.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {getMusicasPorSecao(secaoAtiva).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Music className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Nenhuma música cadastrada para esta seção</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Músicos Escalados */}
      {musicosEscalados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Músicos Escalados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {musicosEscalados.map((escalacao) => (
                <div key={escalacao.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{escalacao.musico?.nome}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">{escalacao.parte_missa}</Badge>
                        <Badge variant="outline">{escalacao.funcao}</Badge>
                        {escalacao.instrumento && (
                          <Badge variant="outline">{escalacao.instrumento}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoverEscalacao(escalacao.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Music Selector Dialog */}
      <MusicaSelector
        isOpen={showMusicaSelector}
        onClose={() => setShowMusicaSelector(false)}
        onSelectMusica={handleSelectFromBiblioteca}
        secaoInicial={secaoAtiva}
      />

      {/* Escalar Músico Modal */}
      <EscalarMusicoModal
        isOpen={showEscalarMusico}
        onClose={() => setShowEscalarMusico(false)}
        missaId={missa.id}
        onMusicoEscalado={fetchMusicosEscalados}
      />
    </div>
  );
}
