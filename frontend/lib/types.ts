export type User = {
  name: string;
  email: string;
  avatarURL: string;
  token: string;
};

export type Link = {
  _id: string;
  shortID: string;       
  original: string;
  clicks: number;
  createdAt: string;     
  updatedAt?: string;
  workspaceID?: string | null;
};

export type Analytics = {
  clicks: number;
  uniqueClicks: number;
  country: { country: string; clicks: number }[];
  referrer: { referrer: string; clicks: number }[];
  device: { device: string; clicks: number }[];
  browser: { browser: string; clicks: number }[];
  timestamp: { date: string; clicks: number; uniqueClicks: number }[];
};

export type WorkspaceMember = {
  _id: string;
  name: string;
  email: string;
  avatarURL: string;
  role: "admin" | "member";
};

export type Workspace = {
  _id: string;
  name: string;
  role: "admin" | "member" | "owner";
  links: Link[];
  members: WorkspaceMember[];
};
