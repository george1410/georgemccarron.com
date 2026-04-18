import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Blog } from "./pages/Blog";
import { BlogPost } from "./pages/BlogPost";
import { Speaking } from "./pages/Speaking";
import { TalkPage } from "./pages/TalkPage";
import { NotFound } from "./pages/NotFound";
import { ErrorPage } from "./pages/ErrorPage";
import { Changelog } from "./pages/Changelog";

const MapPage = lazy(() =>
  import("./pages/Map").then((m) => ({ default: m.MapPage })),
);

const RunningPage = lazy(() =>
  import("./pages/Running").then((m) => ({ default: m.Running })),
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route errorElement={<ErrorPage />}>
        <Route index element={<Home />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="speaking" element={<Speaking />} />
        <Route path="speaking/:slug" element={<TalkPage />} />
        <Route path="changelog" element={<Changelog />} />
        <Route
          path="map"
          element={
            <Suspense
              fallback={
                <div className="w-full h-[calc(100svh-3.5rem)] bg-[#faf8f5] dark:bg-zinc-900 animate-pulse" />
              }
            >
              <MapPage />
            </Suspense>
          }
        />
        <Route
          path="running"
          element={
            <Suspense fallback={null}>
              <RunningPage />
            </Suspense>
          }
        />
        {/* TEMP: visit /crash to exercise the ErrorPage. Delete before ship. */}
        <Route path="crash" element={<CrashTest />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Route>,
  ),
);

// TEMP: throws on render so /crash hits the ErrorPage. Delete with the
// route above once you've finished eyeballing the error page.
function CrashTest(): never {
  throw new Error("Testing the error page — this one is intentional.");
}

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
