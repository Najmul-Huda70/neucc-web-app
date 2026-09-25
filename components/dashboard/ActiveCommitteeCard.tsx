"use client";

import { Calendar, Shield, Ban, Mail, User } from "lucide-react";

export interface CommitteeUser {
  userId: string;
  name: string;
  email: string;
}

export interface CommitteePost {
  postId: string;
  postTitle: string;
  user?: CommitteeUser;
  users?: CommitteeUser[];
}

export interface CommitteeItem {
  id: string;
  type: string;
  session: string;
  status: string;
  posts?: CommitteePost[];
  blockReason?: string;
}

interface CommitteeCardProps {
  committee: CommitteeItem;
  onBlockRequest: (committee: CommitteeItem) => void;
}

export default function CommitteeCard({ committee, onBlockRequest }: CommitteeCardProps) {
  return (
    <div
      className="p-5 rounded-2xl border shadow-sm flex flex-col justify-between space-y-4 transition-all hover:shadow-md"
      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--btn-secondary-border)" }}
    >
      <div className="space-y-3">
        {/* Header: Type & Active Status */}
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            {committee.type}
          </span>

          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {committee.status}
          </span>
        </div>

        {/* Session Info */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            <Calendar size={14} /> Session:
          </div>
          <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
            {committee.session}
          </p>
        </div>
      </div>

      {/* Posts & Admins List */}
      <div className="pt-3 border-t space-y-2" style={{ borderColor: "var(--btn-secondary-border)" }}>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
          <span className="flex items-center gap-1.5">
            <Shield size={14} className="text-teal-600" /> Assigned Posts & Admins
          </span>
        </div>

        <div className="space-y-2">
          {committee.posts && committee.posts.length > 0 ? (
            committee.posts.map((post, idx) => {
              const assignedUsers = post.users && post.users.length > 0 
                ? post.users 
                : post.user ? [post.user] : [];

              return (
                <div
                  key={post.postId || idx}
                  className="p-3 rounded-xl border text-xs bg-black/5 dark:bg-white/5 space-y-2"
                  style={{ borderColor: "var(--btn-secondary-border)" }}
                >
                  <div className="font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider text-[11px] flex items-center justify-between">
                    <span>Post: {post.postTitle}</span>
                  </div>

                  {assignedUsers.length > 0 ? (
                    assignedUsers.map((u) => (
                      <div key={u.userId} className="space-y-0.5 pt-1 border-t border-black/5 dark:border-white/5 first:border-0 first:pt-0">
                        <p className="font-semibold flex items-center gap-1" style={{ color: "var(--text-primary)" }}>
                          <User size={12} className="text-gray-400" /> {u.name}
                        </p>
                        <p className="text-[11px] flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                          <Mail size={11} className="text-gray-400" /> {u.email} <span className="text-gray-400">({u.userId})</span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic text-[11px]">No admin assigned</p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-gray-400 italic">No posts assigned</p>
          )}
        </div>
      </div>

      {/* Footer Action: Block Committee */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => onBlockRequest(committee)}
          className="w-full py-2.5 px-3 rounded-xl border border-red-500/30 text-red-600 hover:bg-red-500/10 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <Ban size={14} /> Block Committee
        </button>
      </div>
    </div>
  );
}