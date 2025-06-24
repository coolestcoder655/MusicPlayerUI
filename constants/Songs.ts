export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  duration: number;
  audio?: string; // Optional property for audio URL
}

export const songs: Song[] = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    cover: "https://upload.wikimedia.org/wikipedia/en/e/e6/The_Weeknd_-_Blinding_Lights.png",
    duration: 243,
    audio: "https://dxlzxcohsmgkrgnacgkf.supabase.co/storage/v1/object/public/music//BlindingLights.mp3",
  },
  {
    id: "2",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    album: "Fine Line",
    cover: "https://upload.wikimedia.org/wikipedia/en/b/bf/Watermelon_Sugar_-_Harry_Styles.png",
    duration: 174,
    audio: "https://dxlzxcohsmgkrgnacgkf.supabase.co/storage/v1/object/public/music//WatermelonSugar.mp3",
  },
  {
    id: "3",
    title: "Good 4 U",
    artist: "Olivia Rodrigo",
    album: "SOUR",
    cover: "https://upload.wikimedia.org/wikipedia/en/3/3e/Olivia_Rodrigo_-_Good_4_U.png",
    duration: 178,
    audio: "https://dxlzxcohsmgkrgnacgkf.supabase.co/storage/v1/object/public/music//Good4U.mp3",
  },
  {
    id: "4",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    cover: "https://upload.wikimedia.org/wikipedia/en/3/3d/Dua_Lipa_Levitating_%28DaBaby_Remix%29.png",
    duration: 203,
    audio: "https://dxlzxcohsmgkrgnacgkf.supabase.co/storage/v1/object/public/music//Levitating.mp3",
  },
  {
    id: "5",
    title: "Anti-Hero",
    artist: "Taylor Swift",
    album: "Midnights",
    cover: "https://upload.wikimedia.org/wikipedia/en/b/b9/Taylor_Swift_-_Anti-Hero.png",
    duration: 200,
    audio: "https://dxlzxcohsmgkrgnacgkf.supabase.co/storage/v1/object/public/music//AntiHero.mp3",
  },
];