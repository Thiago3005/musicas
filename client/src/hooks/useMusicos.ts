
import { useLocalStorage } from './useLocalStorage';
import { Musico, Sugestao } from '../types';

export function useMusicos() {
  const [musicos, setMusicos] = useLocalStorage<Musico[]>('musicos', []);

  const adicionarMusico = (musico: Omit<Musico, 'id' | 'anotacoes' | 'sugestoes'>) => {
    const novoMusico: Musico = {
      ...musico,
      id: Date.now().toString(),
      anotacoes: [],
      sugestoes: []
    };
    setMusicos(prev => [...prev, novoMusico]);
    return novoMusico.id;
  };

  const atualizarMusico = (id: string, updates: Partial<Musico>) => {
    setMusicos(prev => prev.map(musico => 
      musico.id === id ? { ...musico, ...updates } : musico
    ));
  };

  const removerMusico = (id: string) => {
    setMusicos(prev => prev.filter(musico => musico.id !== id));
  };

  const adicionarAnotacao = (musicoId: string, anotacao: string) => {
    setMusicos(prev => prev.map(musico => 
      musico.id === musicoId 
        ? { ...musico, anotacoes: [...musico.anotacoes, anotacao] }
        : musico
    ));
  };

  const removerAnotacao = (musicoId: string, index: number) => {
    setMusicos(prev => prev.map(musico => 
      musico.id === musicoId 
        ? { ...musico, anotacoes: musico.anotacoes.filter((_, i) => i !== index) }
        : musico
    ));
  };

  const adicionarSugestao = (musicoId: string, texto: string) => {
    const novaSugestao: Sugestao = {
      id: Date.now().toString(),
      texto,
      status: 'pendente',
      data: new Date().toISOString()
    };

    setMusicos(prev => prev.map(musico => 
      musico.id === musicoId 
        ? { ...musico, sugestoes: [...musico.sugestoes, novaSugestao] }
        : musico
    ));
  };

  const atualizarStatusSugestao = (musicoId: string, sugestaoId: string, status: Sugestao['status']) => {
    setMusicos(prev => prev.map(musico => 
      musico.id === musicoId 
        ? { 
            ...musico, 
            sugestoes: musico.sugestoes.map(s => 
              s.id === sugestaoId ? { ...s, status } : s
            ) 
          }
        : musico
    ));
  };

  return {
    musicos,
    adicionarMusico,
    atualizarMusico,
    removerMusico,
    adicionarAnotacao,
    removerAnotacao,
    adicionarSugestao,
    atualizarStatusSugestao
  };
}
