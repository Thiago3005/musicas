
import { useLocalStorage } from './useLocalStorage';
import { Missa, Musica } from '../types';

export function useMissas() {
  const [missas, setMissas] = useLocalStorage<Missa[]>('missas', []);

  const adicionarMissa = (missa: Omit<Missa, 'id'>) => {
    const novaMissa: Missa = {
      ...missa,
      id: Date.now().toString(),
      musicas: missa.musicas || []
    };
    setMissas(prev => [...prev, novaMissa]);
    return novaMissa.id;
  };

  const atualizarMissa = (id: string, updates: Partial<Missa>) => {
    setMissas(prev => prev.map(missa => 
      missa.id === id ? { ...missa, ...updates } : missa
    ));
  };

  const removerMissa = (id: string) => {
    setMissas(prev => prev.filter(missa => missa.id !== id));
  };

  const adicionarMusicaNaMissa = (missaId: string, musica: Omit<Musica, 'id' | 'missaId'>) => {
    const novaMusica: Musica = {
      ...musica,
      id: Date.now().toString(),
      missaId
    };

    setMissas(prev => prev.map(missa => 
      missa.id === missaId 
        ? { ...missa, musicas: [...missa.musicas, novaMusica] }
        : missa
    ));
  };

  const removerMusicaDaMissa = (missaId: string, musicaId: string) => {
    setMissas(prev => prev.map(missa => 
      missa.id === missaId 
        ? { ...missa, musicas: missa.musicas.filter(m => m.id !== musicaId) }
        : missa
    ));
  };

  const obterMissa = (id: string) => {
    return missas.find(missa => missa.id === id);
  };

  return {
    missas,
    adicionarMissa,
    atualizarMissa,
    removerMissa,
    adicionarMusicaNaMissa,
    removerMusicaDaMissa,
    obterMissa
  };
}
