
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

const YOUTUBE_API_KEY = 'AIzaSyB4UJR8RSCxKjcMFwUD7vdTJRGd5ADVrQM';
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  duration: string;
  viewCount: string;
  publishedAt: string;
  description: string;
}

export function useYouTubeAPI() {
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);

  const searchVideos = async (query: string, maxResults: number = 20) => {
    setLoading(true);
    try {
      // Primeira busca para obter os IDs dos vídeos
      const searchResponse = await fetch(
        `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!searchResponse.ok) {
        throw new Error('Erro na busca do YouTube');
      }
      
      const searchData = await searchResponse.json();
      
      if (!searchData.items || searchData.items.length === 0) {
        setVideos([]);
        return [];
      }

      // Obter IDs dos vídeos para buscar detalhes
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
      
      // Segunda busca para obter detalhes dos vídeos (duração, views, etc.)
      const detailsResponse = await fetch(
        `${YOUTUBE_API_BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!detailsResponse.ok) {
        throw new Error('Erro ao buscar detalhes dos vídeos');
      }
      
      const detailsData = await detailsResponse.json();
      
      const formattedVideos: YouTubeVideo[] = detailsData.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        duration: formatDuration(item.contentDetails.duration),
        viewCount: formatViewCount(item.statistics.viewCount),
        publishedAt: item.snippet.publishedAt,
        description: item.snippet.description
      }));
      
      setVideos(formattedVideos);
      return formattedVideos;
    } catch (error) {
      console.error('Erro na busca do YouTube:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao buscar vídeos no YouTube. Verifique sua conexão.',
        variant: 'destructive'
      });
      setVideos([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getVideoInfo = async (videoId: string): Promise<YouTubeVideo | null> => {
    try {
      const response = await fetch(
        `${YOUTUBE_API_BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar informações do vídeo');
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return null;
      }
      
      const item = data.items[0];
      return {
        id: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        duration: formatDuration(item.contentDetails.duration),
        viewCount: formatViewCount(item.statistics.viewCount),
        publishedAt: item.snippet.publishedAt,
        description: item.snippet.description
      };
    } catch (error) {
      console.error('Erro ao buscar informações do vídeo:', error);
      return null;
    }
  };

  return {
    videos,
    loading,
    searchVideos,
    getVideoInfo
  };
}

// Função para formatar duração do YouTube (PT4M13S -> 4:13)
function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  if (!match) return '0:00';
  
  const hours = parseInt((match[1] || '').replace('H', '')) || 0;
  const minutes = parseInt((match[2] || '').replace('M', '')) || 0;
  const seconds = parseInt((match[3] || '').replace('S', '')) || 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Função para formatar visualizações
function formatViewCount(count: string): string {
  const num = parseInt(count);
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M visualizações`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K visualizações`;
  }
  
  return `${num} visualizações`;
}
