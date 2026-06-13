import { useState } from "react";
import { FaChevronRight, FaChevronDown, FaShoppingBag, FaUserPlus, FaCode } from "react-icons/fa";
import type { ReferralTreeNode } from "../../../types/referral";
import { Card, CardBody, Badge, Spinner } from "../../../design-system";

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" });
};

interface TreeNodeProps {
  nodes: ReferralTreeNode[];
  level?: number;
}

const TreeNode = ({ nodes, level = 0 }: TreeNodeProps) => {
  return (
    <>
      {nodes.map((node) => (
        <TreeNodeItem key={node.user._id} node={node} level={level} />
      ))}
    </>
  );
};

const TreeNodeItem = ({
  node,
  level,
}: {
  node: ReferralTreeNode;
  level: number;
}) => {
  const [expanded, setExpanded] = useState(level < 1);
  const hasChildren = node.children && node.children.length > 0;
  const orders = node.user.totalOrders || 0;

  return (
    <div>
      <div
        className="flex items-start gap-2 py-2 px-2 cursor-pointer rounded transition-colors"
        style={{
          paddingLeft: `${level * 28 + 8}px`,
        }}
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "color-mix(in srgb, var(--color-primary) 8%, transparent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {hasChildren ? (
          <span className="mt-1 shrink-0" style={{ color: "var(--text-muted)" }}>
            {expanded ? <FaChevronDown className="w-2.5 h-2.5" /> : <FaChevronRight className="w-2.5 h-2.5" />}
          </span>
        ) : (
          <span className="w-2.5 shrink-0" />
        )}

        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{
            background: "color-mix(in srgb, var(--color-primary) 18%, transparent)",
            color: "var(--color-primary)",
          }}
        >
          {node.user.fullName?.charAt(0)?.toUpperCase() || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {node.user.fullName}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {node.user.phone}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
              <FaCode className="w-2.5 h-2.5" />
              {node.user.referralCode}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>&middot;</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {formatDate(node.user.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Badge
            colorScheme={orders > 0 ? "success" : "default"}
            variant="subtle"
            size="xs"
            className="flex items-center gap-1"
          >
            <FaShoppingBag className="w-2.5 h-2.5" />
            {orders}
          </Badge>
          {level > 0 && (
            <Badge variant="subtle" colorScheme="info" size="xs">
              L{level}
            </Badge>
          )}
        </div>
      </div>

      {expanded && hasChildren && (
        <div>
          <TreeNode nodes={node.children} level={level + 1} />
        </div>
      )}
    </div>
  );
};

interface ReferralTreeProps {
  tree: ReferralTreeNode[];
  loading?: boolean;
}

export const ReferralTree = ({ tree, loading }: ReferralTreeProps) => {
  if (loading) {
    return (
      <Card variant="outlined">
        <CardBody>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!tree || tree.length === 0) {
    return (
      <Card variant="outlined">
        <CardBody>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FaUserPlus className="w-8 h-8 mb-2 opacity-40" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No referrals yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Share your referral code to grow your network
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardBody>
        <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <FaUserPlus className="w-4 h-4" style={{ color: "var(--color-secondary)" }} />
          Referral Network
          <Badge variant="subtle" colorScheme="info" size="sm">{tree.length}</Badge>
        </h3>
        <div
          className="rounded-lg py-1"
          style={{
            background: "color-mix(in srgb, var(--color-primary) 4%, transparent)",
          }}
        >
          <TreeNode nodes={tree} level={0} />
        </div>
      </CardBody>
    </Card>
  );
};