import axios from 'axios';

interface YouTubeSearchResult {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    channelTitle: string;
  };
}

interface YouTubeVideoDetails {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
  contentDetails: {
    duration: string;
  };
}

export class MusicSearchService {
  private static readonly YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyB4UJR8RSCxKjcMFwUD7vdTJRGd5ADVrQM';
  private static readonly CIFRAS_GOIANIA_BASE_URL = 'https://arquidiocesegoiania.org.br/cifras-e-partituras/';
  private static readonly CNV_MP3_BASE_URL = 'https://cnvmp3.com/v25/';

  static async searchYouTube(query: string): Promise<any[]> {
    if (!this.YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured');
      return [];
    }

    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: `${query} música católica litúrgica`,
          type: 'video',
          maxResults: 5,
          key: this.YOUTUBE_API_KEY,
        },
      });

      const videos = response.data.items as YouTubeSearchResult[];
      
      // Get video details for duration
      const videoIds = videos.map(video => video.id.videoId).join(',');
      const detailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'contentDetails,snippet',
          id: videoIds,
          key: this.YOUTUBE_API_KEY,
        },
      });

      const videoDetails = detailsResponse.data.items as YouTubeVideoDetails[];
      
      return videos.map(video => {
        const details = videoDetails.find(d => d.id === video.id.videoId);
        return {
          id: video.id.videoId,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
          channelTitle: video.snippet.channelTitle,
          duration: details?.contentDetails.duration || '',
          url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        };
      });
    } catch (error) {
      console.error('Error searching YouTube:', error);
      return [];
    }
  }

  static generateCifrasGoianiaLink(musicName: string): string {
    // Generate a search-friendly URL for Cifras e Partituras - Arquidiocese de Goiânia
    const searchTerm = musicName.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    return `${this.CIFRAS_GOIANIA_BASE_URL}?search=${encodeURIComponent(searchTerm)}`;
  }

  static generateCnvMp3Link(youtubeUrl: string): string {
    if (!youtubeUrl.includes('youtube.com/watch?v=') && !youtubeUrl.includes('youtu.be/')) {
      return '';
    }
    return `${this.CNV_MP3_BASE_URL}?url=${encodeURIComponent(youtubeUrl)}`;
  }

  static async searchMusic(query: string) {
    const youtubeResults = await this.searchYouTube(query);
    const cifrasLink = this.generateCifrasGoianiaLink(query);

    return {
      youtube: youtubeResults,
      cifrasGoiania: cifrasLink,
      cnvMp3Generator: this.CNV_MP3_BASE_URL,
    };
  }
}