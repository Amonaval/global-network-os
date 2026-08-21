"use client";
import { useState } from "react";
import {
  Database,
  FileUp,
  Sparkles,
  Trash2,
  TreePine,
  Shapes,
} from "lucide-react";
import ImportModal from "./ImportModal";
import { Member, Relationship } from "../lib/types";
import { NetworkSettings, NETWORK_TEMPLATES } from "../lib/network";

type Props = {
  onCreate: (
    settings: NetworkSettings,
    mode: "empty" | "demo" | "import",
    members?: Member[],
    relationships?: Relationship[],
  ) => Promise<void> | void;
  shared: boolean;
  canSetup: boolean;
};
export default function SetupScreen({ onCreate, shared, canSetup }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [error, setError] = useState("");
  const [showOtherTypes, setShowOtherTypes] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(
    NETWORK_TEMPLATES[0],
  );
  const create = async (
    mode: "empty" | "demo" | "import",
    members: Member[] = [],
    relationships: Relationship[] = [],
  ) => {
    setError("");
    if (!name.trim()) {
      setError("Enter a network name first.");
      return;
    }
    setBusy(true);
    try {
      await onCreate(
        {
          id: "network",
          name: name.trim(),
          description,
          entity_label: selectedTemplate.entity_label,
          entity_label_plural: selectedTemplate.entity_label_plural,
          level_label: selectedTemplate.level_label,
          level_label_plural: selectedTemplate.level_label_plural,
          parent_label: selectedTemplate.parent_label,
          child_label: selectedTemplate.child_label,
          peer_label: selectedTemplate.peer_label,
          network_template: selectedTemplate.id,
        },
        mode,
        members,
        relationships,
      );
    } catch (e: any) {
      setError(e.message || "Could not create the network.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="landing">
      <div className="landing-card setup-card">
        <div className="brand-mark">
          <TreePine size={26} />
        </div>
        <div className="setup-eyebrow">Bring generations closer</div>
        <h1>
          {selectedTemplate.id === "family"
            ? "Create your family space"
            : `Create your ${selectedTemplate.name.toLowerCase()}`}
        </h1>
        <p className="page-subtitle">
          {selectedTemplate.id === "family"
            ? "A private, living home for your people, relationships, milestones and memories."
            : "Set up a focused relationship network using the language of your community."}
        </p>
        <div className="field">
          <label>Network name</label>
          <input
            className="text-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Nawal Nandra Network"
            autoFocus
          />
        </div>
        <div className="field">
          <label>
            Description <span className="person-meta">optional</span>
          </label>
          <textarea
            className="text-input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What this network represents…"
          />
        </div>
        <h3>
          {showOtherTypes ? "Choose a network type" : "Made for families"}
        </h3>
        {!showOtherTypes && (
          <div className="family-template-card">
            <TreePine size={22} />
            <div>
              <b>Family Tree</b>
              <span>
                Generations, relationships, milestones and family history.
              </span>
            </div>
          </div>
        )}
        {showOtherTypes && (
          <div className="setup-options">
            {NETWORK_TEMPLATES.map((t) => (
              <button
                key={t.id}
                className={`setup-option${selectedTemplate.id === t.id ? " selected" : ""}`}
                onClick={() => setSelectedTemplate(t)}
              >
                <strong>{t.name}</strong>
                <span>{t.description}</span>
                <span className="person-meta" style={{ marginTop: 4 }}>
                  {t.entity_label} · {t.level_label} · {t.parent_label} /{" "}
                  {t.child_label}
                </span>
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          className="btn setup-switch"
          onClick={() => {
            setShowOtherTypes((x) => !x);
            if (showOtherTypes) setSelectedTemplate(NETWORK_TEMPLATES[0]);
          }}
        >
          <Shapes size={15} />
          {showOtherTypes
            ? "Use the family experience"
            : "Building another kind of network?"}
        </button>
        <h3>Choose starting data</h3>
        <p className="page-subtitle">
          Begin with your own information, import an existing list, or explore a
          realistic demo first.
        </p>
        <div className="setup-options">
          <button
            className="setup-option"
            disabled={busy || !canSetup}
            onClick={() => create("empty")}
          >
            <Trash2 />
            <strong>Build it together</strong>
            <span>Start fresh and invite relatives to help complete it.</span>
          </button>
          <button
            className="setup-option"
            disabled={busy || !canSetup}
            onClick={() => create("demo")}
          >
            <Sparkles />
            <strong>Explore a Demo Family</strong>
            <span>
              See how six generations and their relationships feel before adding
              your own.
            </span>
          </button>
          <button
            className="setup-option"
            disabled={busy || !canSetup}
            onClick={() => setShowImport(true)}
          >
            <FileUp />
            <strong>Bring Existing Records</strong>
            <span>
              Import CSV, XLSX or XML with validation before anything is saved.
            </span>
          </button>
        </div>
        {shared && !canSetup && (
          <div className="notice">
            <Database size={15} /> Only an administrator can initialize the
            shared network.
          </div>
        )}
        {error && <div className="notice danger-text">{error}</div>}
        <div className="setup-help">
          Your family controls what is shared. Private details stay protected,
          and sensitive changes can require family-admin review.
        </div>
      </div>
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImport={(m, r) => {
            setShowImport(false);
            create("import", m, r);
          }}
        />
      )}
    </div>
  );
}
