import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Alert,
  Skeleton,
  Input,
  Select,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  EmptyState,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "../../design-system";
import {
  apiMarketplaceService,
  type ApiMetadata,
  type ApiEndpoint,
} from "../../services/api-marketplace.service";
import {
  Book,
  Terminal,
  Shield,
  Key,
  Copy,
  CheckCircle,
  Play,
  RefreshCw,
} from "lucide-react";

type Lang = "curl" | "javascript" | "python";

const LANG_LABELS: Record<Lang, string> = { curl: "cURL", javascript: "JavaScript", python: "Python" };

export const ApiMarketplaceDocsPage = () => {
  const [metadata, setMetadata] = useState<ApiMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<Lang>("curl");
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  // Playground state
  const [playgroundOpen, setPlaygroundOpen] = useState(false);
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState("/api/marketplace/packages");
  const [playgroundKey, setPlaygroundKey] = useState("");
  const [playgroundResult, setPlaygroundResult] = useState<string | null>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundStatus, setPlaygroundStatus] = useState<number | null>(null);
  const [playgroundTime, setPlaygroundTime] = useState<number | null>(null);
  const [playgroundHistory, setPlaygroundHistory] = useState<Array<{ endpoint: string; status: number; time: number; timestamp: number }>>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const HISTORY_PAGE_SIZE = 2;

  useEffect(() => {
    (async () => {
      try {
        const result = await apiMarketplaceService.getApiMetadata();
        if (result.success) setMetadata(result.data);
        else setError(result.message);
      } catch {
        setError("Failed to load API documentation");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCopyEndpoint = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const getExampleCode = (ep: ApiEndpoint, lang: Lang): string => {
    const path = ep.path;
    const url = `${metadata?.baseUrl}${path.replace("/api/marketplace", "")}`;
    const isPost = ep.method === "POST";
    const data = isPost
      ? `{\n      "bundleId": "BUNDLE_ID_FROM_GET_BUNDLES",\n      "customerPhone": "+233XXXXXXXXX",\n      "quantity": 1\n    }`
      : "";
    switch (lang) {
      case "curl":
        return isPost
          ? `curl -X POST "${url}" \\\n  -H "Authorization: Bearer bl_live_YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '${data.replace(/\n\s{6}/g, "\n  ").replace(/\n\s{4}/g, "\n  ")}'`
          : `curl -H "Authorization: Bearer bl_live_YOUR_API_KEY" \\\n  "${url}"`;
      case "javascript":
        return isPost
          ? `fetch("${url}", {\n  method: "POST",\n  headers: {\n    Authorization: "Bearer bl_live_YOUR_API_KEY",\n    "Content-Type": "application/json",\n  },\n  body: JSON.stringify(${data.replace(/\n\s{6}/g, "\n      ").replace(/\n\s{4}/g, "\n    ")}),\n})\n  .then(r => r.json())\n  .then(console.log);`
          : `fetch("${url}", {\n  headers: { Authorization: "Bearer bl_live_YOUR_API_KEY" },\n})\n  .then(r => r.json())\n  .then(console.log);`;
      case "python":
        return isPost
          ? `import requests, json\n\nheaders = {\n  "Authorization": "Bearer bl_live_YOUR_API_KEY",\n  "Content-Type": "application/json",\n}\ndata = ${data.replace(/\n\s{6}/g, "\n    ").replace(/\n\s{4}/g, "\n  ")}\nresponse = requests.post("${url}", headers=headers, json=data)\nprint(response.json())`
          : `import requests\n\nheaders = {"Authorization": "Bearer bl_live_YOUR_API_KEY"}\nresponse = requests.get("${url}", headers=headers)\nprint(response.json())`;
      default:
        return "";
    }
  };

  const getSampleResponse = (ep: ApiEndpoint): string => {
    if (ep.path.includes("/packages")) {
      return JSON.stringify({
        success: true,
        data: [
          {
            _id: "68767270437b5abc082a936a",
            name: "MTN Unlimited Bundles",
            description: "MTN non-expiry data bundles",
            provider: "MTN",
            category: "unlimited",
            isActive: true,
            slug: "mtn-unlimited-bundles",
            createdAt: "2025-07-15T15:23:28.353Z",
            updatedAt: "2025-10-05T13:53:53.743Z",
          },
        ],
      }, null, 2);
    }
    if (ep.path.includes("/bundles")) {
      return JSON.stringify({
        success: true,
        data: [
          {
            _id: "68767270437b5abc082a936c",
            name: "MTN 1GB Unlimited",
            description: "1GB unlimited. 1-15mins Delivery.",
            dataVolume: 1,
            dataUnit: "GB",
            validity: "unlimited",
            validityUnit: "unlimited",
            price: 5,
            currency: "GHS",
            isActive: true,
            bundleCode: "MTN_1GB_UNLIMITED",
            category: "unlimited",
            provider: { name: "MTN Ghana", code: "MTN" },
            packageName: "MTN Unlimited Bundles",
            createdAt: "2025-07-15T15:23:28.356Z",
            updatedAt: "2025-10-05T13:53:53.745Z",
            formattedDataVolume: "1 GB",
            formattedValidity: "Unlimited",
            isAvailable: true,
          },
        ],
      }, null, 2);
    }
    if (ep.path.includes("/storefront")) {
      return JSON.stringify({
        success: true,
        data: { businessName: "My Store", currency: "GHS", contactPhone: "+233XXXXXXXXX" },
      }, null, 2);
    }
    if (ep.path.includes("/orders")) {
      return JSON.stringify({
        success: true,
        message: "Order placed successfully",
        data: {
          _id: "664d8f1a2b3c4d5e6f7a8b9c",
          orderNumber: "ORD-20250521-ABCD",
          bundle: { _id: "b1", name: "1GB Data Bundle" },
          quantity: 1,
          customerPhone: "+233XXXXXXXXX",
          total: 5.00,
          status: "pending",
          paymentStatus: "paid",
          createdAt: new Date().toISOString(),
        },
      }, null, 2);
    }
    return JSON.stringify({ success: true, data: {} }, null, 2);
  };

  const getErrorResponse = (ep: ApiEndpoint): string => {
    if (ep.method === "POST") {
      return JSON.stringify({
        success: false,
        code: "INSUFFICIENT_BALANCE",
        message: "Insufficient wallet balance",
        hint: "Required: GH₵5.00, Available: GH₵2.00. Top up your wallet via the dashboard.",
      }, null, 2);
    }
    return JSON.stringify({
      success: false,
      code: "NOT_FOUND",
      message: "Resource not found",
    }, null, 2);
  };

  const runPlayground = async () => {
    if (!playgroundKey) return;
    setPlaygroundLoading(true);
    setPlaygroundResult(null);
    setPlaygroundStatus(null);
    setPlaygroundTime(null);

    const start = performance.now();
    try {
      const res = await fetch(`${metadata?.baseUrl}${playgroundEndpoint.replace("/api/marketplace", "")}`, {
        headers: { Authorization: `Bearer ${playgroundKey}` },
      });
      const took = Math.round(performance.now() - start);
      const data = await res.json();
      setPlaygroundResult(JSON.stringify(data, null, 2));
      setPlaygroundStatus(res.status);
      setPlaygroundTime(took);
      setPlaygroundHistory((prev) => {
        const next = [{ endpoint: playgroundEndpoint, status: res.status, time: took, timestamp: Date.now() }, ...prev].slice(0, 10);
        setHistoryPage(0);
        return next;
      });
    } catch (err: unknown) {
      setPlaygroundResult(JSON.stringify({ error: err instanceof Error ? err.message : "Request failed" }, null, 2));
      setPlaygroundStatus(0);
      setPlaygroundTime(Math.round(performance.now() - start));
      setPlaygroundHistory((prev) => {
        const next = [{ endpoint: playgroundEndpoint, status: 0, time: Math.round(performance.now() - start), timestamp: Date.now() }, ...prev].slice(0, 10);
        setHistoryPage(0);
        return next;
      });
    } finally {
      setPlaygroundLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardBody>
            <Skeleton variant="text" height="1.75rem" width="240px" />
            <Skeleton variant="text" height="0.875rem" width="360px" className="mt-2" />
          </CardBody>
        </Card>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardBody>
              <Skeleton variant="text" height="1.25rem" width="180px" className="mb-3" />
              <Skeleton variant="rectangular" height="4rem" />
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardBody>
            <EmptyState
              icon={<Book className="w-6 h-6" />}
              title="Documentation unavailable"
              description={error || "Could not load API documentation"}
            />
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Book className="w-5 h-5" />
                API Documentation
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Reference for integrating your storefront with the BryteLinks Marketplace API
              </p>
            </div>
            <div className="text-sm">
              <span className="text-[var(--text-muted)]">Base URL: </span>
              <code className="bg-[var(--bg-surface-alt)] px-2 py-1 rounded text-xs font-mono">
                {metadata.baseUrl}
              </code>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Introduction ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Introduction</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          <p className="text-[var(--text-secondary)]">
            The BryteLinks Marketplace API allows you to access your storefront's packages, bundles,
            and settings programmatically. Read endpoints return storefront-scoped data; the
            <strong> POST /orders</strong> endpoint lets you place orders directly via API
            (deducts from wallet).
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Version", <Badge key="v">{metadata.version}</Badge>],
              ["Auth Type", <Badge key="a" colorScheme="primary">{metadata.authType}</Badge>],
              ["Rate Limit", <Badge key="rl" colorScheme="warning">{metadata.rateLimit}</Badge>],
              ["Endpoints", <Badge key="e" colorScheme="success">{metadata.endpoints.length} available</Badge>],
            ].map(([label, value]) => (
              <div key={String(label)} className="bg-[var(--bg-surface)] rounded-md p-3">
                <div className="text-xs text-[var(--text-muted)] mb-1">{String(label)}</div>
                <div>{value}</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ── Authentication ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Authentication</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Alert status="info" variant="subtle">
            All API requests require a valid API key sent in the Authorization header.
            You can manage your keys from the{" "}
            <a href="/agent/dashboard/api-marketplace" className="text-[var(--accent)] underline">
              API Marketplace dashboard
            </a>
            .
          </Alert>

          <div className="space-y-3">
            <h3 className="font-medium text-sm">Header Format</h3>
            <div className="bg-[var(--bg-surface-alt)] rounded-md p-3 font-mono text-sm">
              Authorization: Bearer bl_live_YOUR_API_KEY
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-sm">Permission Scopes</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Scope</TableHeaderCell>
                  <TableHeaderCell>Description</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metadata.permissionScopes.map((s) => (
                  <TableRow key={s.scope}>
                    <TableCell><code className="text-sm">{s.scope}</code></TableCell>
                    <TableCell className="text-sm text-[var(--text-secondary)]">{s.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* ── Endpoint Reference ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Endpoints</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-2">
          <Accordion type="single">
            {metadata.endpoints.filter((ep) => ep.path !== "/api/marketplace").map((ep) => {
              const epId = ep.method + ep.path;
              return (
                <AccordionItem key={epId} value={epId}>
                  <AccordionTrigger>
                    <Badge colorScheme="primary" className="shrink-0 font-mono">{ep.method}</Badge>
                    <code className="text-sm font-mono flex-1">{ep.path}</code>
                    <span className="text-xs text-[var(--text-muted)] truncate max-w-[200px] hidden sm:inline">
                      {ep.description}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-[var(--text-secondary)]">{ep.description}</p>

                    {ep.scopes && ep.scopes.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-muted)]">Required scopes:</span>
                        {ep.scopes.map((s) => (
                          <Badge key={s} colorScheme="warning" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    )}

                    {/* Code Examples */}
                    <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as Lang)} variant="file">
                      <div className="flex items-end border-b border-[var(--border-color)]">
                        <TabsList className="flex-1">
                          {(Object.keys(LANG_LABELS) as Lang[]).map((lang) => (
                            <TabsTrigger key={lang} value={lang}>{LANG_LABELS[lang]}</TabsTrigger>
                          ))}
                        </TabsList>
                        <button
                          onClick={() => handleCopyEndpoint(getExampleCode(ep, activeLang), epId)}
                          className="px-2 h-8 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                        >
                          {copiedEndpoint === epId ? (
                            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Copied</span>
                          ) : (
                            <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</span>
                          )}
                        </button>
                      </div>
                      {(Object.keys(LANG_LABELS) as Lang[]).map((lang) => (
                        <TabsContent key={lang} value={lang}>
                          <pre className="text-xs font-mono overflow-x-auto">
                            <code>{getExampleCode(ep, lang)}</code>
                          </pre>
                        </TabsContent>
                      ))}
                    </Tabs>

                    {/* Sample Response */}
                    <details className="group">
                      <summary className="text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--text)]">
                        Sample Response
                      </summary>
                      <pre className="bg-[var(--bg-page)] border border-[var(--border-color)] rounded-md p-3 text-xs font-mono overflow-x-auto mt-2">
                        <code>{getSampleResponse(ep)}</code>
                      </pre>
                    </details>

                    {/* Error Response */}
                    {ep.method === "POST" && (
                      <details className="group">
                        <summary className="text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--text)]">
                          Error Response Example
                        </summary>
                        <pre className="bg-[var(--bg-page)] border border-[var(--border-color)] rounded-md p-3 text-xs font-mono overflow-x-auto mt-2">
                          <code>{getErrorResponse(ep)}</code>
                        </pre>
                      </details>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardBody>
      </Card>

      {/* ── Error Codes ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Error Codes</h2>
          </div>
        </CardHeader>
        <CardBody>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Code</TableHeaderCell>
                <TableHeaderCell>Description</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metadata.errorCodes.map((ec) => (
                <TableRow key={ec.code}>
                  <TableCell>
                    <Badge colorScheme={ec.status < 400 ? "success" : ec.status < 500 ? "warning" : "error"}>
                      {ec.status}
                    </Badge>
                  </TableCell>
                  <TableCell><code className="text-sm">{ec.code}</code></TableCell>
                  <TableCell className="text-sm text-[var(--text-secondary)]">{ec.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* ── Try It Button ──────────────────────────────────────────── */}
      <div className="flex justify-end -mt-2">
        <Button onClick={() => { setPlaygroundOpen(true); setPlaygroundResult(null); }}>
          <Play className="w-4 h-4 mr-1.5" /> Try It Live
        </Button>
      </div>

      {/* ── Try It Dialog ──────────────────────────────────────────── */}
      <Dialog isOpen={playgroundOpen} onClose={() => setPlaygroundOpen(false)} size="lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            <h2 className="text-lg font-semibold">API Playground</h2>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Test any read endpoint with your API key and see the live response.
            POST endpoints (orders) cannot be tested here — use the code examples instead.
          </p>

          <div className="flex flex-col items-start space-y-3">
            <div>
              <Select
                label="Endpoint"
                value={playgroundEndpoint}
                onChange={setPlaygroundEndpoint}
                options={metadata.endpoints.filter((ep) => ep.auth && ep.method === "GET").map((ep) => ({
                  value: ep.path,
                  label: `${ep.method} ${ep.path}`,
                }))}
              />
            </div>
            <div className="flex flex-col items-start gap-2 w-full">
              <label className="text-xs text-[var(--text-muted)] mb-1 block">API Key</label>
              <div className="flex gap-2">
                <Input
                  value={playgroundKey}
                  onChange={(e) => setPlaygroundKey(e.target.value)}
                  placeholder="bl_live_..."
                  className="font-mono text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter") runPlayground(); }}
                />
                <Button onClick={runPlayground} disabled={!playgroundKey || playgroundLoading}>
                  {playgroundLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Response */}
          {playgroundResult !== null && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-muted)]">
                  Status:{" "}
                  <Badge colorScheme={playgroundStatus && playgroundStatus < 300 ? "success" : "error"}>
                    {playgroundStatus}
                  </Badge>
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  Duration:{" "}
                  <span style={{ color: playgroundTime && playgroundTime > 1000 ? "var(--error)" : "var(--text-primary)" }}>
                    {playgroundTime}ms
                  </span>
                </span>
                <button
                  onClick={() => { setPlaygroundResult(null); setPlaygroundStatus(null); setPlaygroundTime(null); }}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] ml-auto"
                >
                  Clear
                </button>
              </div>
              <pre className="bg-[var(--bg-page)] border border-[var(--border-color)] rounded-md p-3 text-xs font-mono overflow-x-auto max-h-80 overflow-y-auto">
                <code>{playgroundResult}</code>
              </pre>
            </div>
          )}

          {/* Request History */}
          {playgroundHistory.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[var(--text-muted)]">Request History</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setHistoryPage((p) => Math.max(0, p - 1))}
                    disabled={historyPage === 0}
                    className="px-1.5 py-0.5 text-xs rounded transition-colors disabled:opacity-30"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ‹
                  </button>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {historyPage + 1} / {Math.ceil(playgroundHistory.length / HISTORY_PAGE_SIZE)}
                  </span>
                  <button
                    onClick={() => setHistoryPage((p) => Math.min(Math.ceil(playgroundHistory.length / HISTORY_PAGE_SIZE) - 1, p + 1))}
                    disabled={historyPage >= Math.ceil(playgroundHistory.length / HISTORY_PAGE_SIZE) - 1}
                    className="px-1.5 py-0.5 text-xs rounded transition-colors disabled:opacity-30"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ›
                  </button>
                </div>
              </div>
              {playgroundHistory.slice(historyPage * HISTORY_PAGE_SIZE, (historyPage + 1) * HISTORY_PAGE_SIZE).map((h) => (
                <div
                  key={h.timestamp}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer hover:bg-[var(--bg-surface-alt)] transition-colors"
                  onClick={() => { setPlaygroundEndpoint(h.endpoint); }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: h.status && h.status < 300 ? "var(--success)" : "var(--error)" }}
                  />
                  <code className="flex-1 truncate" style={{ color: "var(--text-secondary)" }}>{h.endpoint}</code>
                  <Badge colorScheme={h.status && h.status < 300 ? "success" : "error"}>{h.status}</Badge>
                  <span style={{ color: "var(--text-muted)" }}>{h.time}ms</span>
                </div>
              ))}
            </div>
          )}
        </DialogBody>
        <DialogFooter justify="end">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)]">Press <kbd className="px-1 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: "var(--bg-surface-alt)", border: "1px solid var(--border-color)" }}>Enter</kbd> to send</span>
            <Button variant="secondary" onClick={() => setPlaygroundOpen(false)}>Close</Button>
          </div>
        </DialogFooter>
      </Dialog>

    </div>
  );
};
