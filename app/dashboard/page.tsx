import React from "react";

export default function DashboardPage() {
  // পরবর্তী সময়ে এই ডাটাগুলো Prisma DB বা JWT Session থেকে ডাইনামিকালি আসবে
  const stats = [
    { label: "Total Members", value: "128", icon: "👥" },
    { label: "Active Committees", value: "4", icon: "🏛️" },
    { label: "Upcoming Events", value: "3", icon: "📅" },
    { label: "Pending Notices", value: "2", icon: "📢" },
  ];

  const recentActivities = [
    { title: "New Executive Committee formed for 2026-27", time: "2 hours ago", type: "Committee" },
    { title: "Inter-University Programming Contest notice published", time: "1 day ago", type: "Notice" },
    { title: "New member registration drive started", time: "3 days ago", type: "Membership" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className="p-6 sm:p-8 rounded-2xl border shadow-sm transition-all"
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--btn-secondary-border)",
        }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
          Welcome back, Admin 👋
        </h1>
        <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          Here is what is happening across the Computer Club portal today.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border transition-transform hover:-translate-y-1"
            style={{
              backgroundColor: "var(--stat-card-bg)",
              borderColor: "var(--btn-secondary-border)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                style={{
                  backgroundColor: "var(--badge-bg)",
                  color: "var(--badge-text)",
                }}
              >
                Active
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ color: "var(--text-primary)" }}>
              {stat.value}
            </h3>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Main Grid: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity List (2 Columns) */}
        <div
          className="lg:col-span-2 p-6 rounded-2xl border shadow-sm"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--btn-secondary-border)",
          }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Recent Updates
          </h2>
          <div className="space-y-4">
            {recentActivities.map((act, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3.5 rounded-xl border text-sm"
                style={{
                  backgroundColor: "var(--stat-card-bg)",
                  borderColor: "var(--btn-secondary-border)",
                }}
              >
                <div>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {act.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {act.time}
                  </p>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-lg font-medium"
                  style={{
                    backgroundColor: "var(--badge-bg)",
                    color: "var(--badge-text)",
                  }}
                >
                  {act.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions (1 Column) */}
        <div
          className="p-6 rounded-2xl border shadow-sm flex flex-col justify-between"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--btn-secondary-border)",
          }}
        >
          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Quick Actions
            </h2>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              Frequently used administrative tasks
            </p>
            
            <div className="space-y-2.5">
              <button
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all hover:opacity-90 cursor-pointer text-left"
                style={{
                  backgroundColor: "var(--btn-primary-bg)",
                  color: "var(--btn-primary-text)",
                }}
              >
                + Add New Notice
              </button>
              <button
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm border transition-all hover:opacity-80 cursor-pointer text-left"
                style={{
                  borderColor: "var(--btn-secondary-border)",
                  color: "var(--text-primary)",
                  backgroundColor: "var(--stat-card-bg)",
                }}
              >
                + Create Committee
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t text-xs font-medium" style={{ borderColor: "var(--btn-secondary-border)", color: "var(--text-secondary)" }}>
            Logged in as Super Admin
          </div>
        </div>
      </div>
    </div>
  );
}