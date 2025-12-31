const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function authMiddleware(route) {
  // public route
  if (!route.meta?.requiresAuth) {
    return { allow: true };
  }

  try {
    const res = await fetch(`${API_URL}/auth/verify`, {
      credentials: "include",
    });

    if (res.status === 401) {
        return { allow: false, redirect: "/login" };
    }

    if (res.status === 403) {
        return { allow: false, redirect: "/403" };
    }

    const auth = await res.json();

    // role check
    if (route.meta.role && auth.user.role !== route.meta.role) {
      // redirect by role
      if (auth.user.role === "admin") {
        return { allow: false, redirect: "/admin/dashboard" };
      }

      return { allow: false, redirect: "/user/dashboard" };
    }

    return { allow: true, user: auth.user };
  } catch {
    return { allow: false, redirect: "/login" };
  }
}
