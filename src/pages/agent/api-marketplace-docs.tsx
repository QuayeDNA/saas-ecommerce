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
  Lock,
  Webhook,
} from "lucide-react";

type Lang = "curl" | "javascript" | "python";

const LANG_LABELS: Record<Lang, string> = { curl: "cURL", javascript: "JavaScript", python: "Python" };

const METHOD_COLORS: Record<string, "primary" | "success" | "warning" | "error" | "info"> = {
  GET: "primary",
  POST: "success",
  PUT: "warning",
  PATCH: "warning",
  DELETE: "error",
};

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
    const isTopup = path === "/api/marketplace/wallet/topup";
    const data = isPost
      ? isTopup
        ? `{\n      "amount": 100\n    }`
        : `{\n      "bundleId": "BUNDLE_ID_FROM_GET_BUNDLES",\n      "customerPhone": "+233XXXXXXXXX",\n      "quantity": 1\n    }`
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
    if (ep.path === "/api/marketplace/packages") {
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
          {
            _id: "68767270437b5abc082a936b",
            name: "Telecel Data Bundles",
            description: "Telecel data bundle variants",
            provider: "Telecel",
            category: "regular",
            isActive: true,
            slug: "telecel-data-bundles",
            createdAt: "2025-07-15T15:23:28.354Z",
            updatedAt: "2025-10-05T13:53:53.744Z",
          },
        ],
      }, null, 2);
    }
    if (ep.path === "/api/marketplace/packages/:id") {
      return JSON.stringify({
        success: true,
        data: {
          _id: "68767270437b5abc082a936a",
          name: "MTN Unlimited Bundles",
          description: "MTN non-expiry data bundles",
          provider: "MTN",
          category: "unlimited",
          isActive: true,
          slug: "mtn-unlimited-bundles",
          bundleCount: 4,
          createdAt: "2025-07-15T15:23:28.353Z",
          updatedAt: "2025-10-05T13:53:53.743Z",
        },
      }, null, 2);
    }
    if (ep.path === "/api/marketplace/bundles") {
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
          {
            _id: "68767270437b5abc082a936d",
            name: "Telecel 500MB Daily",
            description: "500MB daily bundle. 1-5mins Delivery.",
            dataVolume: 500,
            dataUnit: "MB",
            validity: 1,
            validityUnit: "days",
            price: 2.50,
            currency: "GHS",
            isActive: true,
            bundleCode: "TEL_500MB_DAILY",
            category: "regular",
            provider: { name: "Telecel Ghana", code: "Telecel" },
            packageName: "Telecel Data Bundles",
            createdAt: "2025-07-15T15:23:28.357Z",
            updatedAt: "2025-10-05T13:53:53.746Z",
            formattedDataVolume: "500 MB",
            formattedValidity: "1 Day",
            isAvailable: true,
          },
        ],
      }, null, 2);
    }
    if (ep.path === "/api/marketplace/bundles/:id") {
      return JSON.stringify({
        success: true,
        data: {
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
      }, null, 2);
    }
    if (ep.path === "/api/marketplace/storefront") {
      return JSON.stringify({
        success: true,
        data: {
          _id: "store_abc123def456",
          businessName: "Dave's Digital Hub",
          currency: "GHS",
          contactPhone: "+233541234567",
          email: "dave@digitalhub.com",
          address: "123 Accra Mall, Spintex Road",
          creationFee: 0,
          markupPercent: 10,
          defaultProfitMargin: 15,
          branding: { primaryColor: "#10b981", logoUrl: null },
          isActive: true,
          createdAt: "2025-03-10T08:00:00.000Z",
          updatedAt: "2025-06-15T12:30:00.000Z",
        },
      }, null, 2);
    }
    if (ep.path === "/api/marketplace/wallet/balance") {
      return JSON.stringify({
        success: true,
        data: {
          balance: 245.50,
          currency: "GHS",
        },
      }, null, 2);
    }
    if (ep.path === "/api/marketplace/wallet/topup" && ep.method === "POST") {
      return JSON.stringify({
        success: true,
        message: "Top-up initiated. Complete payment via Paystack.",
        data: {
          reference: "topup_ref_a1b2c3d4e5f6",
          amount: 100,
          authorizationUrl: "https://paystack.com/pay/abc123",
          callbackUrl: "https://app.brytelinks.com/wallet/topup/callback",
        },
      }, null, 2);
    }
    if (ep.path === "/api/marketplace/wallet/topup/:reference" && ep.method === "GET") {
      return JSON.stringify({
        success: true,
        data: {
          reference: "topup_ref_a1b2c3d4e5f6",
          amount: 100,
          status: "success",
          credited: true,
          creditedAt: "2025-06-20T14:30:00.000Z",
        },
      }, null, 2);
    }
    if (ep.path === "/api/marketplace/orders" && ep.method === "GET") {
      return JSON.stringify({
        success: true,
        data: [
          {
            _id: "664d8f1a2b3c4d5e6f7a8b9c",
            orderNumber: "ORD-20250521-ABCD",
            bundle: { _id: "68767270437b5abc082a936c", name: "MTN 1GB Unlimited" },
            quantity: 1,
            customerPhone: "+233541234567",
            total: 5.00,
            status: "completed",
            paymentStatus: "paid",
            createdAt: "2025-05-21T10:30:00.000Z",
          },
          {
            _id: "774d8f1a2b3c4d5e6f7a8b9d",
            orderNumber: "ORD-20250521-EFGH",
            bundle: { _id: "68767270437b5abc082a936d", name: "Telecel 500MB Daily" },
            quantity: 2,
            customerPhone: "+233541234568",
            total: 5.00,
            status: "pending",
            paymentStatus: "paid",
            createdAt: "2025-05-21T11:00:00.000Z",
          },
        ],
        meta: { total: 2, page: 1, limit: 10, hasMore: false },
      }, null, 2);
    }
    if (/\/orders\/[a-f0-9]{24}/.test(ep.path) && ep.method === "GET") {
      return JSON.stringify({
        success: true,
        data: {
          _id: "664d8f1a2b3c4d5e6f7a8b9c",
          orderNumber: "ORD-20250521-ABCD",
          bundle: { _id: "68767270437b5abc082a936c", name: "MTN 1GB Unlimited", bundleCode: "MTN_1GB_UNLIMITED" },
          quantity: 1,
          customerPhone: "+233541234567",
          total: 5.00,
          status: "completed",
          paymentStatus: "paid",
          servedBy: "API",
          notes: "Delivered successfully to +233541234567",
          createdAt: "2025-05-21T10:30:00.000Z",
          updatedAt: "2025-05-21T10:32:00.000Z",
        },
      }, null, 2);
    }
    if (ep.path === "/api/marketplace/orders" && ep.method === "POST") {
      return JSON.stringify({
        success: true,
        message: "Order placed successfully",
        data: {
          _id: "664d8f1a2b3c4d5e6f7a8b9c",
          orderNumber: "ORD-20250622-A1B2",
          bundle: { _id: "68767270437b5abc082a936c", name: "MTN 1GB Unlimited" },
          quantity: 1,
          customerPhone: "+233541234567",
          total: 5.00,
          status: "pending",
          paymentStatus: "paid",
          createdAt: "2025-06-22T12:00:00.000Z",
        },
      }, null, 2);
    }
    return JSON.stringify({ success: true, data: {} }, null, 2);
  };

  const getErrorResponse = (ep: ApiEndpoint): string => {
    if (ep.path === "/api/marketplace/orders" && ep.method === "POST") {
      return JSON.stringify({
        success: false,
        code: "INSUFFICIENT_BALANCE",
        message: "Insufficient wallet balance",
        hint: "Required: GH₵5.00, Available: GH₵2.00. Top up your wallet via the dashboard.",
      }, null, 2);
    }
    if (ep.path === "/api/marketplace/wallet/topup" && ep.method === "POST") {
      return JSON.stringify({
        success: false,
        code: "INVALID_AMOUNT",
        message: "Top-up amount must be at least GH₵1.00",
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

          {/* Consumer API Endpoints */}
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Consumer API
          </h3>
          <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
            These endpoints are accessible with an API key and the required permission scopes.
          </p>
          <Accordion type="single" className="mb-6">
            {metadata.endpoints.filter((ep) => ep.auth).map((ep) => {
              const epId = ep.method + ep.path;
              return (
                <AccordionItem key={epId} value={epId}>
                  <AccordionTrigger>
                    <Badge colorScheme={METHOD_COLORS[ep.method] || "primary"} className="shrink-0 font-mono">{ep.method}</Badge>
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

          {/* Dashboard-Only Management Endpoints */}
          <div
            className="rounded-lg border p-4 -mx-1"
            style={{ borderColor: "color-mix(in srgb, var(--error) 30%, transparent)", backgroundColor: "color-mix(in srgb, var(--error) 4%, transparent)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4" style={{ color: "var(--error)" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Dashboard Only
              </h3>
            </div>
            <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
              These endpoints require dashboard access and cannot be called with an API key. They are listed here for reference.
            </p>
            <Accordion type="single">
              {metadata.endpoints.filter((ep) => !ep.auth && ep.path !== "/api/marketplace").map((ep) => {
                const epId = ep.method + ep.path;
                return (
                  <AccordionItem key={epId} value={epId}>
                    <AccordionTrigger>
                      <Badge colorScheme={METHOD_COLORS[ep.method] || "primary"} className="shrink-0 font-mono">{ep.method}</Badge>
                      <code className="text-sm font-mono flex-1 text-[var(--text-muted)]">{ep.path}</code>
                      <span className="text-xs text-[var(--text-muted)] truncate max-w-[200px] hidden sm:inline">
                        {ep.description}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-[var(--text-secondary)]">{ep.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Lock className="w-3 h-3" style={{ color: "var(--error)" }} />
                        <span className="text-xs font-medium" style={{ color: "var(--error)" }}>
                          Dashboard only — requires session login, not an API key
                        </span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>

        </CardBody>
      </Card>

      {/* ── Webhooks ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Webhooks</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Webhooks deliver real-time events (e.g. order placed, completed, failed) to your
            server via HTTP POST. Your endpoint receives the event payload signed with an HMAC
            signature so you can verify it came from BryteLinks.
          </p>

          {/* Available Events */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Available Events</h3>
            <div className="flex flex-wrap gap-1.5">
              {["order.placed", "order.processing", "order.completed", "order.failed"].map((ev) => (
                <span key={ev} className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: "var(--color-primary)", color: "white" }}>
                  {ev}
                </span>
              ))}
            </div>
          </div>

          {/* Delivery Payload */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Delivery Payload</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              When an event triggers, BryteLinks POSTs a JSON payload to your webhook URL with the following structure:
            </p>
            <pre className="bg-[var(--bg-page)] border border-[var(--border-color)] rounded-md p-3 text-xs font-mono overflow-x-auto">
              <code>{JSON.stringify({
  event: "order.completed",
  timestamp: "2025-06-22T14:30:00.000Z",
  order: {
    id: "664d8f1a2b3c4d5e6f7a8b9c",
    orderNumber: "ORD-20250622-A1B2",
    status: "completed",
    paymentStatus: "paid",
    total: 5.00,
    customerPhone: "+233541234567",
    bundleName: "MTN 1GB Unlimited",
    quantity: 1,
    createdAt: "2025-06-22T12:00:00.000Z",
    updatedAt: "2025-06-22T14:30:00.000Z",
  },
  agentId: "agent_mongo_id_here",
}, null, 2)}</code>
            </pre>
          </div>

          {/* HMAC Verification */}
          <Alert status="info" variant="subtle">
            <div className="space-y-2">
              <p className="text-sm font-medium">Verifying Webhook Signatures</p>
              <p className="text-xs">
                Each webhook POST includes a <code className="text-[10px] font-mono">X-Webhook-Signature</code> header.
                The value is an HMAC-SHA256 hash of the raw request body, computed using your webhook's secret.
                Verify the signature on your end to confirm the payload is authentic and hasn't been tampered with.
              </p>
              <details className="group">
                <summary className="text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--text)] mt-1">
                  Node.js verification example
                </summary>
                <pre className="bg-[var(--bg-page)] border border-[var(--border-color)] rounded-md p-3 text-xs font-mono overflow-x-auto mt-2">
                  <code>{`import crypto from "crypto";

function verifyWebhookSignature(body, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(typeof body === "string" ? body : JSON.stringify(body))
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// Usage in an Express endpoint:
app.post("/webhooks/momo", (req, res) => {
  const sig = req.headers["x-webhook-signature"];
  if (!verifyWebhookSignature(req.body, sig, process.env.WEBHOOK_SECRET)) {
    return res.status(401).json({ error: "Invalid signature" });
  }
  // Process the event...
  res.status(200).end();
});`}</code>
                </pre>
              </details>
            </div>
          </Alert>

          {/* Retry & Delivery Logs */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Retry & Delivery Logs</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              BryteLinks retries failed deliveries up to 3 times with exponential backoff.
              You can view delivery logs (status, duration, attempt count, response body) for each
              webhook endpoint from the API Marketplace dashboard.
            </p>
          </div>
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
