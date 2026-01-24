// middleware.ts atau proxy.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const isAuthPage = nextUrl.pathname === "/";
  const isDashboardPage = nextUrl.pathname.startsWith("/dashboard");

  // Jika sudah login dan mencoba buka halaman login (/), lempar ke dashboard
  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }

  // Jika belum login dan mencoba buka dashboard, lempar ke login (/)
  if (isDashboardPage && !isLoggedIn) {
    return Response.redirect(new URL("/", nextUrl));
  }
  
  return;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};