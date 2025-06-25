import { useState, useEffect } from 'react';
import { getSongs, Song } from '@/constants/Songs';

export const useSongs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      const songsData = await getSongs();
      setSongs(songsData);
    } catch (err) {
      console.error('Error loading songs:', err);
      setError('Failed to load songs from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSongs();
  }, []);

  const refetch = () => {
    loadSongs();
  };

  return {
    songs,
    loading,
    error,
    refetch,
  };
};
