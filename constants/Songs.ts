export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  duration: number;
}

export const songs: Song[] = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center",
    duration: 243
  },
  {
    id: "2",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    album: "Fine Line",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop&crop=center",
    duration: 174
  },
  {
    id: "3",
    title: "Good 4 U",
    artist: "Olivia Rodrigo",
    album: "SOUR",
    cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop&crop=center",
    duration: 178
  },
  {
    id: "4",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop&crop=center",
    duration: 203
  },
  {
    id: "5",
    title: "Anti-Hero",
    artist: "Taylor Swift",
    album: "Midnights",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center",
    duration: 200
  }
];

export const getCurrentSong = (id?: string): Song => {
  if (id) {
    return songs.find(song => song.id === id) || songs[0];
  }
  return songs[0];
};