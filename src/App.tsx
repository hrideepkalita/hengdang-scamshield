import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { I18nProvider } from "./lib/i18n";

// Route-level code splitting keeps the recharts-heavy analytics screens out of
// the first paint, so the checker on the home page opens fast.
const Home = lazy(() => import("./pages/Home"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Graph = lazy(() => import("./pages/Graph"));
const Scanner = lazy(() => import("./pages/Scanner"));

function PageFallback() {
  return (
    <p className="py-16 text-center text-[13px] font-medium text-[#7183a8]" role="status">
      Loading…
    </p>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <Shell>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/graph" element={<Graph />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Shell>
    </I18nProvider>
  );
}
