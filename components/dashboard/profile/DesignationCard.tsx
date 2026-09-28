"use client";

import { Award, Building2, Calendar } from "lucide-react";

export interface UserPostRelation {
  post: {
    postId?: string;
    postTitle: string;
    committee?: {
      committeeId?: string;
      type: string;
      year: number;
      status: string;
    } | null;
  };
}

interface DesignationCardProps {
  userPosts?: UserPostRelation[];
}

export default function DesignationCard({ userPosts }: DesignationCardProps) {
  if (!userPosts || userPosts.length === 0) return null;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider border-b border-slate-100 pb-2.5">
        <Award className="w-4 h-4" /> Assigned Designation
      </div>

      <div className="space-y-3 pt-1">
        {userPosts.map((up, idx) => {
          const post = up.post;
          const committee = post?.committee;

          return (
            <div key={post?.postId || idx} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
                  <Award size={13} className="text-teal-600" /> Post Title
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 uppercase">{post?.postTitle}</p>
              </div>

              {committee && (
                <>
                  <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
                      <Building2 size={13} className="text-teal-600" /> Committee
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 uppercase">{committee.type}</p>
                  </div>

                  <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100 sm:col-span-2 lg:col-span-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
                      <Calendar size={13} className="text-teal-600" /> Year
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800">
                      {committee.year}
                    </p>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}