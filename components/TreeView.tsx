"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import type { Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Member, Relationship } from "../lib/types";
import { getNetworkConfig, NetworkSettings } from "../lib/network";
import { useLanguage } from "../lib/i18n";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
}

function PersonNode({ data }: any) {
  return (
    <div
      className={`tree-node ${data.match ? "match" : ""} ${data.dim ? "dim" : ""} ${data.deceased ? "deceased" : ""} ${data.focused ? "focused" : ""} ${data.viewer ? "viewer" : ""}`}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        style={{ opacity: 0 }}
      />
      <div className="avatar">
        {data.photo ? (
          <img
            src={data.photo}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          initials(data.name)
        )}
      </div>
      <div className="tree-node-name">{data.name}</div>
      {data.viewer && <div className="tree-you-badge">You</div>}
      {data.focused && !data.viewer && <div className="tree-focus-badge">Viewing</div>}
      <div className="tree-node-meta">{data.profession || "Member"}</div>
      <div className="tree-node-meta">{data.city || ""}</div>
      {data.deceased && <div className="tree-node-deceased">† In memoriam</div>}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        style={{ opacity: 0 }}
      />
    </div>
  );
}

const nodeTypes = { person: PersonNode };

export default function TreeView({
  members,
  relationships,
  query,
  focusMemberId,
  viewerMemberId,
  compactLineage = false,
  onSelect,
  network,
}: {
  members: Member[];
  relationships: Relationship[];
  query: string;
  focusMemberId?: string;
  viewerMemberId?: string;
  compactLineage?: boolean;
  onSelect: (m: Member) => void;
  network?: NetworkSettings | null;
}) {
  const { language } = useLanguage();
  const copy = language === "hi"
    ? { shown:"सदस्य दिख रहे हैं", focused:"चुनी हुई शाखा", large:"बड़ा परिवार है? किसी को खोजें, उनकी प्रोफ़ाइल खोलें और साफ शाखा देखने के लिए परिवार वृक्ष में देखें चुनें।" }
    : language === "mr"
      ? { shown:"सदस्य दिसत आहेत", focused:"निवडलेली शाखा", large:"कुटुंब मोठे आहे? व्यक्ती शोधा, त्यांची प्रोफाइल उघडा आणि स्पष्ट शाखेसाठी कुटुंब वृक्षात पहा निवडा." }
      : { shown:"members shown", focused:"Focused branch", large:"Large family? Search for someone, open their profile, then choose View in Family Tree for a clear branch." };
  const cfg = getNetworkConfig(network ?? null);
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const byGen = new Map<number, Member[]>();
    members.forEach((m) =>
      byGen.set(m.generation_level, [
        ...(byGen.get(m.generation_level) || []),
        m,
      ]),
    );

    const generations = Array.from(byGen.entries()).sort((a, b) => a[0] - b[0]);
    const maxPerGen = Math.max(
      1,
      ...generations.map(([, list]) => list.length),
    );
    const canvasWidth = Math.max(1300, maxPerGen * 205 + 300);
    const nodes: Node[] = [];

    for (const [gen, list] of generations) {
      const totalWidth = Math.max(0, (list.length - 1) * 205);
      list.forEach((m, i) => {
        const match =
          !query ||
          `${m.full_name} ${m.profession || ""} ${m.city || ""}`
            .toLowerCase()
            .includes(query.toLowerCase());
        nodes.push({
          id: m.id,
          type: "person",
          position: {
            x: Math.max(50, canvasWidth / 2 - totalWidth / 2 + i * 205),
            y: (gen - 1) * 190 + 55,
          },
          data: {
            name: m.full_name,
            profession: m.profession,
            city: m.city,
            photo: m.photo_url,
            match,
            dim: !!query && !match,
            deceased: !!m.date_of_death,
            focused: m.id === focusMemberId,
            viewer: m.id === viewerMemberId,
          },
        });
      });
    }

    const memberIds = new Set(members.map((m) => m.id));
    const byId = new Map(members.map((m) => [m.id, m]));
    const humanRole = (member: Member | undefined, type: "parent" | "child" | "spouse") => {
      if (type === "parent") return member?.gender === "Male" ? "Father" : member?.gender === "Female" ? "Mother" : "Parent";
      if (type === "child") return member?.gender === "Male" ? "Son" : member?.gender === "Female" ? "Daughter" : "Child";
      return member?.gender === "Male" ? "Husband" : member?.gender === "Female" ? "Wife" : "Spouse";
    };
    const edges: Edge[] = relationships
      .filter(
        (r) => memberIds.has(r.person_id) && memberIds.has(r.related_person_id),
      )
      .map((r) => {
        const sourceMember = byId.get(r.person_id);
        const targetMember = byId.get(r.related_person_id);
        const label = r.relationship_type === "spouse"
          ? `${humanRole(sourceMember, "spouse")} · ${humanRole(targetMember, "spouse")}`
          : `${humanRole(sourceMember, "parent")} · ${humanRole(targetMember, "child")}`;
        return {
          id: r.id,
          source: r.person_id,
          target: r.related_person_id,
          type: r.relationship_type === "spouse" ? "straight" : "smoothstep",
          sourceHandle: r.relationship_type === "spouse" ? "right" : undefined,
          targetHandle: r.relationship_type === "spouse" ? "left" : undefined,
          animated: false,
          label,
          labelStyle: { fill: "#53615a", fontSize: 10, fontWeight: 700 },
          labelBgPadding: [5, 3],
          labelBgBorderRadius: 6,
          labelBgStyle: { fill: "#fffdf8", fillOpacity: 0.94 },
          style:
            r.relationship_type === "spouse"
              ? { strokeDasharray: "7 5", strokeWidth: compactLineage ? 3.2 : 2.5, stroke: compactLineage ? "#28352f" : undefined }
              : { strokeWidth: compactLineage ? 3.4 : 1.7, stroke: compactLineage ? "#28352f" : undefined },
        } as Edge;
      });

    return { nodes, edges };
  }, [members, relationships, query, focusMemberId, viewerMemberId, compactLineage]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_e: any, node: Node) => {
      const m = members.find((x) => x.id === node.id);
      if (m) onSelect(m);
    },
    [members, onSelect],
  );

  return (
    <div className="tree-card card">
      <div className={`tree-toolbar ${compactLineage && focusMemberId ? "lineage-status" : ""}`}>
        <span className="tree-count">{members.length} {copy.shown}</span>
        {focusMemberId && <span className="tree-focus">{copy.focused}</span>}
        <span className="tree-legend">
          <i className="legend-solid" /> {cfg.child_label}{" "}
          <i className="legend-dashed" /> {cfg.peer_label}
        </span>
      </div>
      {members.length > 60 && !focusMemberId && (
        <div className="tree-guide">
          {copy.large}
        </div>
      )}
      {compactLineage && focusMemberId && (
        <div className="mobile-lineage-view">
          {([
            { key: "older", label: "Parents & ancestors", items: members.filter(m => m.generation_level < (members.find(x=>x.id===focusMemberId)?.generation_level ?? m.generation_level)) },
            { key: "current", label: focusMemberId === viewerMemberId ? "You & partner" : "This person & partner", items: members.filter(m => m.generation_level === (members.find(x=>x.id===focusMemberId)?.generation_level ?? m.generation_level)) },
            { key: "younger", label: "Children & descendants", items: members.filter(m => m.generation_level > (members.find(x=>x.id===focusMemberId)?.generation_level ?? m.generation_level)) },
          ] as const).map(group => group.items.length ? <section className="mobile-lineage-group" key={group.key}><h3>{group.label}</h3>{group.items.map(m => <button className={`mobile-lineage-person ${m.id===viewerMemberId?"viewer":""} ${m.id===focusMemberId?"focused":""}`} key={m.id} onClick={()=>onSelect(m)}><span className="mobile-lineage-avatar">{m.photo_url?<img src={m.photo_url} alt=""/>:initials(m.full_name)}</span><span><b>{m.full_name}</b><small>{m.id===viewerMemberId?"You":m.profession||"Family member"}</small></span></button>)}</section> : null)}
          <div className="mobile-lineage-hint">Showing the direct family line only. Use “Full Tree” when you want to explore every branch.</div>
        </div>
      )}
      <div className={`tree-flow ${compactLineage ? "has-mobile-lineage" : ""}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18, minZoom: 0.15, maxZoom: 1.1 }}
        minZoom={0.06}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(node) => (node.data?.deceased ? "#a7adba" : "#3559c7")}
        />
      </ReactFlow>
      </div>
    </div>
  );
}
