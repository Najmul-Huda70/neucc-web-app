"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import { Plus, X, Loader2, AlertTriangle, UploadCloud, Check } from "lucide-react";
import { getCroppedImg } from "@/lib/cropImage";
import MessageCard from "./MessageCard";

interface Message {
  messageId: string;
  role: "CHAIRMAN" | "ADVISOR";
  name: string;
  designation: string;
  photoUrl: string | null;
  displayOrder: number;
  message: string;
  createdAt: string | Date;
}

export default function MessagesClient({ initialMessages }: { initialMessages: Message[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Separate Chairman and Advisors
  const chairmanMessage = messages.find((m) => m.role === "CHAIRMAN");
  const advisorMessages = messages
    .filter((m) => m.role === "ADVISOR")
    .sort((a, b) => a.displayOrder - b.displayOrder); // Order by displayOrder asc

  const hasChairman = !!chairmanMessage;

  // Form States
  const [formData, setFormData] = useState({
    role: "ADVISOR" as "CHAIRMAN" | "ADVISOR",
    name: "",
    designation: "",
    displayOrder: 0,
    message: "",
  });

  // Image Upload & Crop States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

  // Cropper States
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Delete States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [confirmInputName, setConfirmInputName] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Manual Trigger to Refresh Server State
  const handleTriggerRefresh = () => {
    router.refresh();
  };

  const handleOpenCreate = () => {
    setEditingMessage(null);
    // If Chairman exists, default role must be ADVISOR
    const defaultRole = hasChairman ? "ADVISOR" : "CHAIRMAN";
    setFormData({
      role: defaultRole,
      name: "",
      designation: "",
      displayOrder: advisorMessages.length,
      message: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setRawImageSrc(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (msg: Message) => {
    setEditingMessage(msg);
    setFormData({
      role: msg.role,
      name: msg.name,
      designation: msg.designation,
      displayOrder: msg.displayOrder,
      message: msg.message,
    });
    setImageFile(null);
    setImagePreview(msg.photoUrl);
    setRawImageSrc(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setRawImageSrc(reader.result as string);
        setCropModalOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApplyCrop = async () => {
    if (!rawImageSrc || !croppedAreaPixels) return;
    try {
      const croppedFile = await getCroppedImg(rawImageSrc, croppedAreaPixels, 400, 400);
      setImageFile(croppedFile);
      setImagePreview(URL.createObjectURL(croppedFile));
      setCropModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to crop image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("role", formData.role);
      data.append("name", formData.name);
      data.append("designation", formData.designation);
      data.append("displayOrder", formData.displayOrder.toString());
      data.append("message", formData.message);
      if (imageFile) {
        data.append("image", imageFile);
      }

      if (editingMessage) {
        data.append("messageId", editingMessage.messageId);
        const res = await fetch("/api/messages", {
          method: "PATCH",
          body: data,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to update");

        // Optimistic UI update
        setMessages(messages.map((m) => (m.messageId === editingMessage.messageId ? result.data : m)));
      } else {
        const res = await fetch("/api/messages", {
          method: "POST",
          body: data,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to create");

        // Optimistic UI update
        setMessages([...messages, result.data]);
      }

      setIsModalOpen(false);
      handleTriggerRefresh();
    } catch (error: any) {
      alert(error.message || "Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete || confirmInputName !== messageToDelete.name) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/messages?messageId=${messageToDelete.messageId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete");

      setMessages(messages.filter((m) => m.messageId !== messageToDelete.messageId));
      setDeleteModalOpen(false);
      setMessageToDelete(null);
      handleTriggerRefresh();
    } catch (error: any) {
      alert(error.message || "Failed to delete message");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Messages
          </h1>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs sm:text-sm shadow-sm hover:bg-emerald-700 transition-all cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>New Message</span>
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
          <p className="text-gray-500 text-sm font-medium">No messages found.</p>
          <button onClick={handleOpenCreate} className="mt-3 text-xs text-emerald-600 font-bold underline cursor-pointer">
            Create your first message
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Section 1: Messages from Our Chairperson */}
          {chairmanMessage && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-(--text-primary) tracking-tight">
                  Messages from Our Chairperson
                </h2>
                <p className="text-xs sm:text-sm text-(--text-muted) font-medium">
                  A message from the Chairperson of the Department of CSE
                </p>
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  <MessageCard
                    item={chairmanMessage}
                    onEdit={(selectedItem) => handleOpenEdit(selectedItem)}
                    onDelete={(selectedItem) => {
                      setMessageToDelete(selectedItem);
                      setConfirmInputName("");
                      setDeleteModalOpen(true);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Messages from Our Advisors */}
          {advisorMessages.length > 0 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-(--text-primary) tracking-tight">
                  Messages from Our Advisors
                </h2>
                <p className="text-xs sm:text-sm text-(--text-muted) font-medium">
                  Guidance and remarks from our esteemed faculty advisors
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-6">
                {advisorMessages.map((item) => (
                  <div
                    key={item.messageId}
                    className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-grow max-w-md"
                  >
                    <MessageCard
                      item={item}
                      onEdit={(selectedItem) => handleOpenEdit(selectedItem)}
                      onDelete={(selectedItem) => {
                        setMessageToDelete(selectedItem);
                        setConfirmInputName("");
                        setDeleteModalOpen(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingMessage ? "Edit Message" : "Create New Message"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as "CHAIRMAN" | "ADVISOR" })}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
                  >
                    {/* DYNAMIC ROLE SELECT: Disable CHAIRMAN if one already exists (unless editing the current Chairman) */}
                    <option
                      value="CHAIRMAN"
                      disabled={hasChairman && editingMessage?.role !== "CHAIRMAN"}
                    >
                      Chairman {hasChairman && editingMessage?.role !== "CHAIRMAN" ? "(Already Exists)" : ""}
                    </option>
                    <option value="ADVISOR">Advisor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mr. Syed Ahsanul Kabir"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Chairperson & Associate Professor"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              {/* Photo Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Profile Photo</label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
                  }}
                  className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-center relative cursor-pointer hover:border-emerald-600 transition"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {imagePreview ? (
                    <div className="flex items-center gap-3">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-emerald-600">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                      <p className="text-xs text-emerald-600 font-bold underline">Change & Recrop Photo</p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={24} className="text-gray-400 mb-1" />
                      <p className="text-xs text-gray-700 font-medium">
                        Drag & drop image here, or <span className="text-emerald-600 underline">browse</span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Fixed 1:1 Aspect Ratio (Square)</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Message Content</label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write message statement here..."
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingMessage ? "Update Message" : "Save Message"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {cropModalOpen && rawImageSrc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-base font-bold text-gray-900">Crop Profile Picture</h3>
              <button onClick={() => setCropModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="relative w-full h-72 rounded-xl overflow-hidden bg-black/80">
              <Cropper
                image={rawImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCropModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer hover:bg-emerald-700"
              >
                <Check size={14} />
                <span>Crop & Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Type-to-Confirm Delete Modal */}
      {deleteModalOpen && messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-100 text-red-600 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Message Permanently?</h3>
                <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <div className="text-xs bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
              <p className="text-gray-600">
                To confirm, please type <span className="font-bold text-gray-900">{messageToDelete.name}</span> below:
              </p>
              <input
                type="text"
                value={confirmInputName}
                onChange={(e) => setConfirmInputName(e.target.value)}
                placeholder="Type name here..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmInputName !== messageToDelete.name || deleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-xs hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}