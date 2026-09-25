/**
 * Uploads an image file to ImgBB and returns the hosted image URL.
 */
export async function uploadProfileImage(file: File): Promise<string> {
  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error("IMGBB_API_KEY is not defined in environment variables.");
  }

  // Convert File to base64 string
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString("base64");

  // Construct Multipart FormData for ImgBB API
  const formData = new FormData();
  formData.append("image", base64Image);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data?.error?.message || "Failed to upload image to ImgBB");
  }

  // Return hosted image display URL
  return data.data.url as string;
}