import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from "convex/react";
import { anyApi } from "convex/server";
import { demoDashboard } from "../../convex/demoData";
import type { DashboardData, ScanEvent } from "./types";

const api = anyApi as any;
const convexUrl = (import.meta.env.VITE_CONVEX_URL as string | undefined)?.trim();

interface DataContextValue {
  data: DashboardData;
  demo: boolean;
  loading: boolean;
  scans: ScanEvent[];
  recordScan: (scan: Omit<ScanEvent, "id" | "createdAt">) => void;
}

const DataContext = createContext<DataContextValue>({
  data: demoDashboard,
  demo: true,
  loading: false,
  scans: [],
  recordScan: () => {},
});

const STORAGE_KEY = "hengdang.scans.v1";

function readLocalScans(): ScanEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScanEvent[];
    return Array.isArray(parsed) ? parsed.slice(0, 12) : [];
  } catch {
    return [];
  }
}

function DemoDataProvider({ children }: { children: ReactNode }) {
  const [scans, setScans] = useState<ScanEvent[]>(readLocalScans);

  const recordScan = useCallback((scan: Omit<ScanEvent, "id" | "createdAt">) => {
    setScans((prev) => {
      const next: ScanEvent[] = [
        {
          ...scan,
          id: `scan-${Date.now()}`,
          createdAt: Date.now(),
        },
        ...prev,
      ].slice(0, 12);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage may be unavailable */
      }
      return next;
    });
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      data: { ...demoDashboard, mode: "demo" },
      demo: true,
      loading: false,
      scans,
      recordScan,
    }),
    [scans, recordScan],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

function ConvexDataProvider({ children }: { children: ReactNode }) {
  const remote = useQuery(api.threats.getDashboard) as
    | (Partial<DashboardData> & Record<string, unknown>)
    | null
    | undefined;
  const history = useQuery(api.threats.scanHistory) as ScanEvent[] | undefined;
  const logScan = useMutation(api.threats.logScan);

  const [fallbackScans, setFallbackScans] = useState<ScanEvent[]>([]);

  const recordScan = useCallback(
    (scan: Omit<ScanEvent, "id" | "createdAt">) => {
      void logScan(scan).catch(() => {
        setFallbackScans((prev) => [
          { ...scan, id: `local-${Date.now()}`, createdAt: Date.now() },
          ...prev,
        ]);
      });
    },
    [logScan],
  );

  const live = Boolean(remote && Array.isArray(remote.countries) && remote.countries.length);

  const data = useMemo<DashboardData>(() => {
    if (!live || !remote) return { ...demoDashboard, mode: "demo" };
    const hourly =
      Array.isArray(remote.hourlyTrend) && remote.hourlyTrend.length
        ? remote.hourlyTrend
        : demoDashboard.hourlyTrend;
    const regionSeries =
      Array.isArray(remote.regionSeries) && remote.regionSeries.length
        ? remote.regionSeries
        : demoDashboard.regionSeries;
    const vectors =
      Array.isArray(remote.attackVectors) && remote.attackVectors.length
        ? remote.attackVectors
        : demoDashboard.attackVectors;

    const remoteMode: "demo" | "live" = remote.mode === "live" ? "live" : "demo";

    return {
      ...demoDashboard,
      ...(remote as DashboardData),
      overview: { ...demoDashboard.overview, ...(remote.overview ?? {}) },
      hourlyTrend: hourly,
      regionSeries,
      attackVectors: vectors,
      mode: remoteMode,
    };
  }, [live, remote]);

  const scans = useMemo<ScanEvent[]>(() => {
    const rows = (history ?? []) as ScanEvent[];
    return [...rows, ...fallbackScans].slice(0, 12);
  }, [history, fallbackScans]);

  const value = useMemo<DataContextValue>(
    () => ({
      data,
      demo: !live || data.mode === "demo",
      loading: remote === undefined,
      scans,
      recordScan,
    }),
    [data, live, remote, scans, recordScan],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function ThreatDataProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ConvexReactClient | null>(null);

  useEffect(() => {
    if (!convexUrl) return;
    try {
      const instance = new ConvexReactClient(convexUrl);
      setClient(instance);
      return () => {
        void instance.close();
      };
    } catch {
      // An unreachable deployment URL should never block the demonstration dashboard.
      setClient(null);
    }
  }, []);

  if (!convexUrl) return <DemoDataProvider>{children}</DemoDataProvider>;
  if (!client) return <DemoDataProvider>{children}</DemoDataProvider>;

  return (
    <ConvexProvider client={client}>
      <ConvexDataProvider>{children}</ConvexDataProvider>
    </ConvexProvider>
  );
}

export function useThreatData() {
  return useContext(DataContext);
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
