"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Download, Save, Eye, Edit3, FileText, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Button from "@/components/ui/Button";

export default function CreateNoticePage() {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Toggle Full Preview State
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Notice Form State
  const [formData, setFormData] = useState({
    shortName: "GA",
    subject: "",
    content: "",
    signatoryName: "",
    signatoryRole: "General Secretary",
  });

  // ১. ড্রাফট PDF ডাউনলোড (Server Puppeteer)
  const handleDownloadPdf = async () => {
    if (!formData.subject || !formData.content) {
      toast.error("Please fill in the subject and notice content first.");
      return;
    }

    try {
      setDownloading(true);

      const response = await fetch("/api/notices/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noticeNo: `NEU-CSE-CC/${formData.shortName}/2026/DRAFT`,
          subject: formData.subject,
          htmlContent: formData.content,
          date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          signatoryName: formData.signatoryName,
          signatoryRole: formData.signatoryRole,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Notice_Draft_${formData.shortName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Draft PDF downloaded!");
    } catch {
      toast.error("Error generating draft PDF");
    } finally {
      setDownloading(false);
    }
  };

  // ২. সেভ এবং পাবলিশ লজিক
  const handleSaveAndPublish = async () => {
    if (!formData.subject || !formData.content) {
      toast.error("Please complete all required fields.");
      return;
    }

    try {
      setSaving(true);
      const pdfRes = await fetch("/api/notices/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noticeNo: `NEU-CSE-CC/${formData.shortName}/2026/AUTO`,
          subject: formData.subject,
          htmlContent: formData.content,
          date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          signatoryName: formData.signatoryName,
          signatoryRole: formData.signatoryRole,
        }),
      });

      if (!pdfRes.ok) throw new Error("PDF Generation failed");
      const pdfBlob = await pdfRes.blob();

      const bodyData = new FormData();
      bodyData.append("file", pdfBlob, `Notice_${formData.shortName}.pdf`);
      bodyData.append("subject", formData.subject);
      bodyData.append("content", formData.content);
      bodyData.append("shortName", formData.shortName);

      const saveRes = await fetch("/api/notices", {
        method: "POST",
        body: bodyData,
      });

      const json = await saveRes.json();

      if (saveRes.ok && json.success) {
        toast.success("Notice Published and saved to Cloudinary!");
        router.push("/dashboard/notice");
      } else {
        toast.error(json.error || "Failed to publish notice.");
      }
    } catch {
      toast.error("An error occurred during publishing.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <Toaster position="bottom-right" />

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-(--border-color) pb-4">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary) flex items-center gap-2">
            <FileText className="text-(--btn-primary-bg)" size={24} />
            {isPreviewMode ? "Official Notice Preview" : "Create Notice"}
          </h1>
          <p className="text-xs text-(--text-secondary) mt-1">
            {isPreviewMode
              ? "This is how the final official pad PDF will be generated."
              : "Fill in the form below. Switch to Full Preview anytime."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Button between Form and Full Preview */}
          {isPreviewMode ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsPreviewMode(false)}
            >
              <Edit3 size={16} /> Edit Notice
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsPreviewMode(true)}
            >
              <Eye size={16} /> Show Full Preview
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleDownloadPdf}
            isLoading={downloading}
          >
            <Download size={16} /> Draft Download
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSaveAndPublish}
            isLoading={saving}
          >
            <Save size={16} /> Save & Publish
          </Button>
        </div>
      </div>

      {/* CONDITIONAL VIEW: FORM vs FULL PREVIEW */}
      {!isPreviewMode ? (
        /* MODE 1: FORM ONLY (Full Width) */
        <div className="max-w-4xl mx-auto bg-(--card-bg) border border-(--border-color) rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="text-sm font-bold text-(--text-primary) border-b border-(--border-color) pb-3">
            Notice Details Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-(--text-secondary)">
                Sarok Category
              </label>
              <select
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                className="w-full rounded-xl border border-(--border-color) bg-(--bg-app) px-3 py-2.5 text-xs text-(--text-primary) outline-none focus:ring-2 focus:ring-(--focus-ring)"
              >
                <option value="GA">General Assembly (GA)</option>
                <option value="EM">Executive Meeting (EM)</option>
                <option value="ND">National Day (ND)</option>
                <option value="NO">General Notice (NO)</option>
                <option value="WT">Workshop & Training (WT)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-(--text-secondary)">
                Subject Title
              </label>
              <input
                type="text"
                placeholder="e.g. Executive Committee Meeting Notice"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full rounded-xl border border-(--border-color) bg-(--bg-app) px-3 py-2.5 text-xs text-(--text-primary) outline-none focus:ring-2 focus:ring-(--focus-ring)"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-(--text-secondary)">
              Notice Body (Supports Markdown)
            </label>
            <textarea
              rows={12}
              placeholder="Write notice body content using Markdown or normal text..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full rounded-xl border border-(--border-color) bg-(--bg-app) p-4 text-xs font-mono text-(--text-primary) outline-none focus:ring-2 focus:ring-(--focus-ring)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold mb-1 text-(--text-secondary)">
                Signatory Name
              </label>
              <input
                type="text"
                placeholder="Name"
                value={formData.signatoryName}
                onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
                className="w-full rounded-xl border border-(--border-color) bg-(--bg-app) px-3 py-2.5 text-xs text-(--text-primary)"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-(--text-secondary)">
                Signatory Role
              </label>
              <input
                type="text"
                placeholder="Role"
                value={formData.signatoryRole}
                onChange={(e) => setFormData({ ...formData, signatoryRole: e.target.value })}
                className="w-full rounded-xl border border-(--border-color) bg-(--bg-app) px-3 py-2.5 text-xs text-(--text-primary)"
              />
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: FULL PAGE PREVIEW ONLY */
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="flex justify-between items-center text-xs text-(--text-secondary)">
            <button
              onClick={() => setIsPreviewMode(false)}
              className="inline-flex items-center gap-1.5 font-semibold text-(--btn-primary-bg) hover:underline cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Editor
            </button>
            <span>Standard A4 Document Pad</span>
          </div>

          {/* Full Page Official Document Pad */}
          <div className="bg-white text-gray-900 p-10 sm:p-14 rounded-xl border border-gray-300 min-h-[840px] shadow-2xl flex flex-col justify-between text-xs transition-all">
            <div>
              {/* Pad Header */}
              <div className="border-b-2 border-emerald-800 pb-4 mb-6 text-center">
                <h2 className="text-xl font-bold tracking-wide text-emerald-950 uppercase">
                  NEU Computer Club
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Department of Computer Science & Engineering | North East University
                </p>
              </div>

              {/* Metadata */}
              <div className="flex justify-between text-xs font-mono text-gray-600 mb-6 border-b pb-2">
                <span>Sarok: NEU-CSE-CC/{formData.shortName}/2026/XXXX</span>
                <span>Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>

              {/* Subject */}
              <div className="mb-6">
                <p className="font-bold text-gray-900 text-sm">
                  Subject:{" "}
                  <span className="underline decoration-emerald-600 underline-offset-4">
                    {formData.subject || "[ Notice Subject ]"}
                  </span>
                </p>
              </div>

              {/* Markdown Content */}
              <div className="prose max-w-none text-xs leading-relaxed text-gray-800 space-y-3">
                {formData.content ? (
                  <ReactMarkdown>{formData.content}</ReactMarkdown>
                ) : (
                  <p className="text-gray-400 italic">Notice content preview will appear here...</p>
                )}
              </div>
            </div>

            {/* Signatory Footer */}
            <div className="flex justify-end pt-12">
              <div className="text-center w-52 border-t border-gray-400 pt-2">
                <p className="font-bold text-gray-900 text-xs">
                  {formData.signatoryName || "Authorized Signatory"}
                </p>
                <p className="text-[11px] text-gray-600">{formData.signatoryRole}</p>
                <p className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                  NEU Computer Club
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}