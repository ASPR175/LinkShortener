export type User = {
  Name: string;
  Email: string;
  AvatarURL: string;
  token: string;
};

export type Link = {
  _id: string;
  short_id: string;
  original: string;
  clicks: number;
  created_at: string;
  updated_at?: string;
  workspace_id?: string | null;
};

export type Analytics = {
  clicks: number;
  uniqueClicks:number;
  country: { country: string; clicks: number }[];
  referrer: { referrer: string; clicks: number }[];
  device: { device: string; clicks: number }[];
  browser: { browser: string; clicks: number }[];
   timestamp: { date: string; clicks: number ; uniqueClicks: number}[]; 
};
export type Workspace = {
  _id: string;
  name: string;
  role: "admin" | "member" | "owner";
  links: Link[];
  members: {
    _id: string;
    name: string;
    email: string;
    avatarURL: string;
    role: "admin" | "member";
  }[];
};