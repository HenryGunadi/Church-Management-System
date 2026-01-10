const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function authMiddleware(route) {
  // Public routes - no auth needed
  if (!route.meta?.requiresAuth) {
    return { allow: true };
  }

  try {
    const res = await fetch(`${API_URL}/auth/verify`, {
      credentials: "include",
    });

    // Unauthorized - no valid token
    if (res.status === 401) {
      return { allow: false, redirect: "/login" };
    }

    // Forbidden - valid token but wrong role
    if (res.status === 403) {
      return { allow: false, redirect: "/403" };
    }

    // Server error
    if (!res.ok) {
      console.error("Auth verification failed:", res.status);
      return { allow: false, redirect: "/login" };
    }

    const auth = await res.json();

    // Check if user data exists
    if (!auth.authenticated || !auth.user) {
      return { allow: false, redirect: "/login" };
    }

    // Role-based access control
    if (route.meta.role && auth.user.role !== route.meta.role) {
      // Redirect based on user's actual role
      if (auth.user.role === "admin") {
        return { allow: false, redirect: "/admin/dashboard" };
      }
      
      if (auth.user.role === "member") {
        return { allow: false, redirect: "/user/dashboard" };
      }

      // Default redirect for unknown roles
      return { allow: false, redirect: "/login" };
    }

    // All checks passed
    return { allow: true, user: auth.user };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return { allow: false, redirect: "/login" };
  }
}

// Helper function to logout
export async function logout() {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Logout request failed');
    }

    // Clear all local data
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to login
    window.location.href = '/login';
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

// Helper function to check if user is authenticated
export async function checkAuth() {
  try {
    const res = await fetch(`${API_URL}/auth/verify`, {
      credentials: "include",
    });

    if (!res.ok) {
      return { authenticated: false };
    }

    const data = await res.json();
    return {
      authenticated: data.authenticated,
      user: data.user
    };
  } catch (error) {
    console.error('Check auth error:', error);
    return { authenticated: false };
  }
}