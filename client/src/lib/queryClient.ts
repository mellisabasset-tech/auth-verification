import { QueryClient, QueryFunction } from "@tanstack/react-query";

function getRuntimeBase(): string {
  // Prefer build-time BASE_URL, otherwise detect /ggl-app at runtime
  let base = (import.meta.env.BASE_URL || "/");

  if (base === "/") {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/ggl-app")) {
      base = "/ggl-app/";
    } else {
      base = "/";
    }
  }

  if (!base.endsWith("/")) base += "/";
  return base;
}

function resolveApiUrl(url: string) {
  // Return absolute URL for fetch. If an absolute URL is passed, return as-is.
  if (/^https?:\/\//i.test(url)) return url;
  const base = getRuntimeBase();
  const trimmed = url.startsWith("/") ? url.slice(1) : url;
  if (base === "/") return `/${trimmed}`;
  return `${base}${trimmed}`.replace(/([^:]?)\/\//g, "$1/");
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = resolveApiUrl(url);
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const raw = queryKey.join("/") as string;
    const fetchUrl = resolveApiUrl(raw);
    const res = await fetch(fetchUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
