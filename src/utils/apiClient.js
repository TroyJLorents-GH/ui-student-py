const API_BASE = process.env.REACT_APP_API_BASE || "";

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (res.status === 401) {
    window.location.href = "/login";
    return;
  }

  const ct = res.headers.get("content-type");
  if (ct && ct.includes("application/json")) return res.json();
  return res;
}
