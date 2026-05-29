import { useState } from "react";
import { FaChevronRight, FaChevronDown, FaShareAlt } from "react-icons/fa";
import { Card, CardBody } from "../../../design-system/components/card";
import { Badge } from "../../../design-system/components/badge";
import { formatDate } from "./badge-helpers";
import type { ReferralTreeNode } from "../../../types/referral";

interface ReferralTreeProps {
  tree: ReferralTreeNode[];
}

const TreeBranch = ({ node, level = 0 }: { node: ReferralTreeNode; level?: number }) => {
  const [expanded, setExpanded] = useState(level < 1);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-colors"
        style={{ paddingLeft: `${level * 24 + 8}px` }}
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={(e) => e.currentTarget.style.background = "color-mix(in srgb, var(--color-primary) 8%, transparent)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
      >
        {hasChildren ? (
          expanded
            ? <FaChevronDown className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
            : <FaChevronRight className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
        ) : (
          <span className="w-3" />
        )}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            background: "color-mix(in srgb, var(--color-primary) 20%, transparent)",
            color: "var(--color-primary)",
          }}
        >
          {node.user.fullName?.charAt(0) || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{node.user.fullName}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {node.user.phone} &middot; {formatDate(node.user.createdAt)}
          </p>
        </div>
        <Badge size="xs" variant="subtle" colorScheme="info">Level {level}</Badge>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeBranch key={child.user._id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const ReferralTree = ({ tree }: ReferralTreeProps) => {
  if (tree.length === 0) {
    return (
      <Card variant="outlined">
        <CardBody>
          <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>
            <FaShareAlt className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No referral tree data</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardBody>
        <h3 className="text-sm sm:text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <FaShareAlt className="w-4 h-4" style={{ color: "var(--color-secondary)" }} /> Referral Network
        </h3>
        <div className="rounded-lg p-3" style={{ background: "color-mix(in srgb, var(--color-primary) 8%, transparent)" }}>
          <TreeBranch node={tree[0]} />
        </div>
      </CardBody>
    </Card>
  );
};
