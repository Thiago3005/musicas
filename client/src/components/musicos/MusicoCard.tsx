
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Musico } from '../../types';
import { User, Phone, Mail, MessageSquare, Lightbulb, Edit, Trash2 } from 'lucide-react';

interface MusicoCardProps {
  musico: Musico;
  onEdit: (musico: Musico) => void;
  onDelete: (id: string) => void;
  onAddAnotacao: (musicoId: string, anotacao: string) => void;
  onRemoveAnotacao: (musicoId: string, index: number) => void;
  onAddSugestao: (musicoId: string, sugestao: string) => void;
  onUpdateSugestaoStatus: (musicoId: string, sugestaoId: string, status: 'pendente' | 'implementada' | 'recusada') => void;
}

export function MusicoCard({ 
  musico, 
  onEdit, 
  onDelete, 
  onAddAnotacao, 
  onRemoveAnotacao, 
  onAddSugestao,
  onUpdateSugestaoStatus 
}: MusicoCardProps) {
  const [novaAnotacao, setNovaAnotacao] = useState('');
  const [novaSugestao, setNovaSugestao] = useState('');

  const handleAddAnotacao = () => {
    if (novaAnotacao.trim()) {
      onAddAnotacao(musico.id, novaAnotacao);
      setNovaAnotacao('');
    }
  };

  const handleAddSugestao = () => {
    if (novaSugestao.trim()) {
      onAddSugestao(musico.id, novaSugestao);
      setNovaSugestao('');
    }
  };

  const sugestoesPendentes = musico.sugestoes.filter(s => s.status === 'pendente').length;

  return (
    <Card className={`hover:shadow-lg transition-shadow ${musico.disponivel ? 'border-green-200' : 'border-red-200'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>{musico.nome}</span>
          </div>
          <div className="flex gap-2">
            <Badge variant={musico.disponivel ? "default" : "destructive"}>
              {musico.disponivel ? 'Disponível' : 'Indisponível'}
            </Badge>
            {sugestoesPendentes > 0 && (
              <Badge variant="outline" className="bg-yellow-50">
                {sugestoesPendentes} sugestão{sugestoesPendentes !== 1 ? 'ões' : ''}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium text-sm text-gray-600">Função:</p>
          <p className="text-sm">{musico.funcao}</p>
        </div>

        {musico.contato && (
          <div className="space-y-1">
            {musico.contato.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{musico.contato.email}</span>
              </div>
            )}
            {musico.contato.telefone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{musico.contato.telefone}</span>
              </div>
            )}
          </div>
        )}

        {musico.observacoesPermanentes && (
          <div>
            <p className="font-medium text-sm text-gray-600">Observações Permanentes:</p>
            <p className="text-sm text-gray-700 italic">{musico.observacoesPermanentes}</p>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium text-sm">Anotações</span>
          </div>
          {musico.anotacoes.length > 0 && (
            <div className="space-y-1 mb-2">
              {musico.anotacoes.map((anotacao, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                  <span>{anotacao}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveAnotacao(musico.id, index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Nova anotação..."
              value={novaAnotacao}
              onChange={(e) => setNovaAnotacao(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddAnotacao()}
            />
            <Button size="sm" onClick={handleAddAnotacao}>
              +
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4" />
            <span className="font-medium text-sm">Sugestões</span>
          </div>
          {musico.sugestoes.length > 0 && (
            <div className="space-y-2 mb-2">
              {musico.sugestoes.map((sugestao) => (
                <div key={sugestao.id} className="bg-gray-50 p-2 rounded text-sm">
                  <p>{sugestao.texto}</p>
                  <div className="flex gap-1 mt-1">
                    <Button
                      size="sm"
                      variant={sugestao.status === 'pendente' ? 'default' : 'outline'}
                      onClick={() => onUpdateSugestaoStatus(musico.id, sugestao.id, 'pendente')}
                    >
                      Pendente
                    </Button>
                    <Button
                      size="sm"
                      variant={sugestao.status === 'implementada' ? 'default' : 'outline'}
                      onClick={() => onUpdateSugestaoStatus(musico.id, sugestao.id, 'implementada')}
                    >
                      Implementada
                    </Button>
                    <Button
                      size="sm"
                      variant={sugestao.status === 'recusada' ? 'destructive' : 'outline'}
                      onClick={() => onUpdateSugestaoStatus(musico.id, sugestao.id, 'recusada')}
                    >
                      Recusada
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Nova sugestão..."
              value={novaSugestao}
              onChange={(e) => setNovaSugestao(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSugestao()}
            />
            <Button size="sm" onClick={handleAddSugestao}>
              +
            </Button>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={() => onEdit(musico)} size="sm" className="flex-1">
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button onClick={() => onDelete(musico.id)} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
