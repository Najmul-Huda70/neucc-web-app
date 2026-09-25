import { Type, Status } from "@/generated/prisma/client";
import { UserBase } from "./auth";

export { Type,Status };

export interface PostWithRelations {
  postId: string;
  postTitle: string;
  status: Status;
  createdAt: Date | string;
  committeeId: string;
  committee?: CommitteeBase;
  users?: UserBase[];
}

export interface CommitteeBase {
  id: string;
  type: Type;
  session: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  posts?: PostWithRelations[];
}
// Committee Interface
export interface CommitteeItem {
  id: string;
  type: Type;
  session: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    posts: number;
  };
}

// Request Payload for Creating Committee
export interface CreateCommitteeInput {
  type: Type;
  session: string;
  status?: string;
}

// API Response Type
export interface CommitteeApiResponse {
  message?: string;
  committees?: CommitteeItem[];
  committee?: CommitteeItem;
  error?: string;
}