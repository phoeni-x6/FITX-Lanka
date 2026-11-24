
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type UserRole = "client" | "trainer" | "gym_owner" | "admin";

function getDashboardPath(role: string) {
  switch (role) {
    case "trainer":
      return "/trainers/dashboard";
    case "gym_owner":
      return "/gym/dashboard";
    case "admin":
      return "/admin/dashboard";
    case "client":
    default:
      return "/dashboard";
  }
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Validate the Supabase session.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Preserve refreshed authentication cookies when redirecting.
  const redirect = (path: string, error?: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";

    if (error) {
      url.searchParams.set("error", error);
    }

    const response = NextResponse.redirect(url);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });

    return response;
  };

  // Require authentication for private routes.
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";

    url.searchParams.set(
      "redirectTo",
      `${pathname}${request.nextUrl.search}`
    );

    const response = NextResponse.redirect(url);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });

    return response;
  }

  // Fetch the user's profile and role.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, phone, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return redirect("/login", "profile");
  }

  // Require profile completion before accessing private features.
  const isProfileComplete =
    Boolean(profile.display_name?.trim()) &&
    Boolean(profile.phone?.trim());

  if (!isProfileComplete && pathname !== "/complete-profile") {
    return redirect("/complete-profile");
  }

  const role = profile.role as UserRole;
  const correctDashboard = getDashboardPath(role);

  // Client dashboard: clients only.
  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/")
  ) {
    if (role !== "client") {
      return redirect(correctDashboard, "unauthorized");
    }
  }

  // Trainer dashboard: trainers only.
  if (
    pathname.startsWith("/trainers/dashboard") &&
    role !== "trainer"
  ) {
    return redirect(correctDashboard, "unauthorized");
  }

  // Gym dashboard: gym owners only.
  if (
    pathname.startsWith("/gym/dashboard") &&
    role !== "gym_owner"
  ) {
    return redirect(correctDashboard, "unauthorized");
  }

  // Admin area: admins only.
  if (
    pathname.startsWith("/admin") &&
    role !== "admin"
  ) {
    return redirect(correctDashboard, "unauthorized");
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bookings/:path*",
    "/profile/:path*",
    "/complete-profile",
    "/trainers/dashboard/:path*",
    "/gym/dashboard/:path*",
    "/admin/:path*",
  ],
};
