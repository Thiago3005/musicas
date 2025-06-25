import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, Download, Music, FileText, Youtube } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PartituraSearchProps {
  onAddToLibrary?: (musica: any) => void;
}

export function PartituraSearch({ onAddToLibrary }: PartituraSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [novaMusica, setNovaMusica] = useState({
    nome: '',
    artista: '',
    youtube_url: '',
    categoria: '',
    letra: '',
    cifra: '',
    partitura: '',
    observacoes: ''
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: 'Atenção',
        description: 'Digite o nome da música para buscar',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/buscar-partitura?nome=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResult(data);
        setNovaMusica(prev => ({ ...prev, nome: searchTerm }));
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao buscar partitura',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLibrary = async () => {
    try {
      const response = await fetch('/api/biblioteca-musicas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaMusica)
      });

      if (response.ok) {
        const musicaAdicionada = await response.json();
        toast({
          title: 'Sucesso',
          description: 'Música adicionada à biblioteca!'
        });
        
        if (onAddToLibrary) {
          onAddToLibrary(musicaAdicionada);
        }
        
        setShowAddForm(false);
        setSearchResult(null);
        setSearchTerm('');
        setNovaMusica({
          nome: '',
          artista: '',
          youtube_url: '',
          categoria: '',
          letra: '',
          cifra: '',
          partitura: '',
          observacoes: ''
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao adicionar música',
        variant: 'destructive'
      });
    }
  };

  const categorias = [
    'Entrada', 'Ato Penitencial', 'Glória', 'Aclamação ao Evangelho',
    'Ofertório', 'Santo', 'Paz', 'Comunhão', 'Saída', 'Adoração',
    'Louvor', 'Contemplação', 'Outros'
  ];

  return (
    <div className="space-y-6">
      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Partituras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o nome da música..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados da Busca */}
      {searchResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recursos Encontrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">Cifras e Partituras</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Arquidiocese de Goiânia
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(searchResult.cifras_link, '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Site
                  </Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Youtube className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium">YouTube</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Buscar no YouTube
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`, '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Buscar Vídeo
                  </Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Download Audio</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    CNV MP3 (sem propagandas)
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(searchResult.download_audio_link, '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Baixar Audio
                  </Button>
                </Card>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={() => setShowAddForm(true)} className="bg-slate-900 hover:bg-slate-800">
                  <Music className="h-4 w-4 mr-2" />
                  Adicionar à Biblioteca
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário para Adicionar à Biblioteca */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar à Biblioteca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome da Música *</Label>
                  <Input
                    id="nome"
                    value={novaMusica.nome}
                    onChange={(e) => setNovaMusica({...novaMusica, nome: e.target.value})}
                    placeholder="Nome da música"
                  />
                </div>
                <div>
                  <Label htmlFor="artista">Artista/Compositor</Label>
                  <Input
                    id="artista"
                    value={novaMusica.artista}
                    onChange={(e) => setNovaMusica({...novaMusica, artista: e.target.value})}
                    placeholder="Nome do artista"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <select
                    id="categoria"
                    value={novaMusica.categoria}
                    onChange={(e) => setNovaMusica({...novaMusica, categoria: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione a categoria</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="youtube_url">Link do YouTube</Label>
                  <Input
                    id="youtube_url"
                    value={novaMusica.youtube_url}
                    onChange={(e) => setNovaMusica({...novaMusica, youtube_url: e.target.value})}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="letra">Letra</Label>
                <Textarea
                  id="letra"
                  value={novaMusica.letra}
                  onChange={(e) => setNovaMusica({...novaMusica, letra: e.target.value})}
                  placeholder="Letra da música..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="cifra">Cifra</Label>
                <Textarea
                  id="cifra"
                  value={novaMusica.cifra}
                  onChange={(e) => setNovaMusica({...novaMusica, cifra: e.target.value})}
                  placeholder="Cifras e acordes..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="partitura">Partitura (Texto)</Label>
                <Textarea
                  id="partitura"
                  value={novaMusica.partitura}
                  onChange={(e) => setNovaMusica({...novaMusica, partitura: e.target.value})}
                  placeholder="Partitura em formato texto..."
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={novaMusica.observacoes}
                  onChange={(e) => setNovaMusica({...novaMusica, observacoes: e.target.value})}
                  placeholder="Observações adicionais..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddToLibrary}>
                  Adicionar à Biblioteca
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}