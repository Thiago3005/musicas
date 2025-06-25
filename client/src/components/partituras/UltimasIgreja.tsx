import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Instagram, Calendar, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InstagramPost {
  id: string;
  caption: string;
  media_url: string;
  permalink: string;
  timestamp: string;
  media_type: string;
}

export function UltimasIgreja() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(false);

  // Simulação de posts do Instagram (em produção, seria integrado com a API do Instagram)
  const mockPosts = [
    {
      id: '1',
      caption: 'Missa de hoje às 19h30. Venham nos acompanhar na celebração! 🙏 #ParoquiaBoaViagem #Itabirito',
      media_url: '/api/placeholder/300/300',
      permalink: 'https://instagram.com/pnsbvitabirito',
      timestamp: new Date().toISOString(),
      media_type: 'IMAGE'
    },
    {
      id: '2',
      caption: 'Ensaio do coral para a missa de domingo. Nossa equipe se preparando com carinho! 🎵',
      media_url: '/api/placeholder/300/300',
      permalink: 'https://instagram.com/pnsbvitabirito',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      media_type: 'IMAGE'
    },
    {
      id: '3',
      caption: 'Confira os horários das missas desta semana. Esperamos por vocês! ⛪',
      media_url: '/api/placeholder/300/300',
      permalink: 'https://instagram.com/pnsbvitabirito',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      media_type: 'IMAGE'
    }
  ];

  useEffect(() => {
    // Em produção, aqui seria feita a integração com a API do Instagram
    setLoading(true);
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Últimas da Igreja</h1>
        <p className="text-gray-600">
          Acompanhe as novidades da Paróquia Nossa Senhora da Boa Viagem
        </p>
      </div>

      {/* Informações da Paróquia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Paróquia Nossa Senhora da Boa Viagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Endereço</h3>
              <p className="text-gray-600">Itabirito, Minas Gerais</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Redes Sociais</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://instagram.com/pnsbvitabirito', '_blank')}
                className="flex items-center gap-2"
              >
                <Instagram className="h-4 w-4" />
                @pnsbvitabirito
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horários de Missas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Horários das Missas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-3">Dias de Semana</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Segunda a Sexta</span>
                  <Badge variant="outline">07:00</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Sábado</span>
                  <Badge variant="outline">19:30</Badge>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Finais de Semana</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Domingo</span>
                  <Badge variant="outline">07:00</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Domingo</span>
                  <Badge variant="outline">19:30</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts do Instagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-600" />
            Últimas Postagens
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Carregando postagens...</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <Instagram className="h-12 w-12 text-gray-400" />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-pink-600">
                      {post.media_type}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {post.caption}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                      <span>{formatDate(post.timestamp)}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(post.permalink, '_blank')}
                      className="w-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Ver no Instagram
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => window.open('https://instagram.com/pnsbvitabirito', '_blank')}
              className="flex items-center gap-2"
            >
              <Instagram className="h-4 w-4" />
              Ver todas as postagens
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}