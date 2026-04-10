import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Blog } from "./pages/Blog";
import { BlogPost } from "./pages/BlogPost";
import { Speaking } from "./pages/Speaking";
import { TalkPage } from "./pages/TalkPage";
import { NotFound } from "./pages/NotFound";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="blog" element={<Blog />} />
      <Route path="blog/:slug" element={<BlogPost />} />
      <Route path="speaking" element={<Speaking />} />
      <Route path="speaking/:slug" element={<TalkPage />} />
<Route path="*" element={<NotFound />} />
    </Route>,
  ),
);

export function App() {
  return <RouterProvider router={router} />;
}
