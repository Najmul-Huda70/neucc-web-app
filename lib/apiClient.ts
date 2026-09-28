/**
 * Helper utility to perform public API fetches with security headers.
 * Ensures x-api-secret is automatically attached to pass verifyPublicApi middleware.
 */
export async function fetchPublicApi(
  endpoint: string,
  options: RequestInit = {}
) {
  const apiSecret = process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || "";

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    "x-api-secret": apiSecret,
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(endpoint, config);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    return {
      success: false,
      message: "An unexpected network or server error occurred.",
    };
  }
}