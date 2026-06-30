import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// During development/local testing, make all routes public to prevent 
// Cloudflare Turnstile CAPTCHA failure issues from locking users out.
const isDev = process.env.NODE_ENV === "development";

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/map(.*)',
  '/analytics(.*)',
  ...(isDev ? [
    '/dashboard(.*)',
    '/report(.*)',
    '/tracker(.*)',
  ] : [])
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
