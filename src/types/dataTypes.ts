export interface IMusicInput {
  title: string;
  duration: string;
  released_at: string;
  ytId: string;
  coverImg: string;
  genre: string;
}

export interface IMusic {
  title: string;
  duration: number;
  released_at: string;
  ytId: string;
  coverImg: string;
  genre: string[];
}

export interface IAlbumInput {
  title: string;
  coverImg: string;
  category: string;
  introduction: string;
  length: string;
  released_at: string;
  total_duration: string;
}

export interface IAlbum {
  title: string;
  coverImg: string;
  category: string;
  introduction: string;
  length: number;
  released_at: string;
  total_duration: number;
}

export interface IArtistInput {
  artistname: string;
  introduction: string;
  debut_at: string;
  country: string;
  coverImg: string;
}

export interface IArtist {
  artistname: string;
  introduction: string;
  debut_at: string;
  country: string;
  coverImg: string;
}
