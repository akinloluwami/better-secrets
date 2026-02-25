export interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url: string };
  private: boolean;
  updated_at: string;
}

export interface Secret {
  name: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  avatar_url: string;
}
