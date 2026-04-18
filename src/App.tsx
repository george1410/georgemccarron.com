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

const MapPage = lazy(() =>
  import("./pages/Map").then((m) => ({ default: m.MapPage })),
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
        <Route path="*" element={<NotFound />} />
      </Route>
    </Route>,
  ),
);

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
