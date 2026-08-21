"use client";
import { useMemo, useState } from "react";
import {
  Baby,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  Heart,
  MapPin,
  Milestone,
  MoveRight,
} from "lucide-react";
import { LifeEvent, Member } from "../lib/types";
import { NetworkSettings, getNetworkConfig } from "../lib/network";
import { useLanguage } from "../lib/i18n";

const TYPES = [
  "all",
  "birth",
  "marriage",
  "education",
  "career",
  "move",
  "family",
  "milestone",
  "other",
] as const;
const icon = (type: string) =>
  type === "birth" ? (
    <Baby size={16} />
  ) : type === "marriage" ? (
    <Heart size={16} />
  ) : type === "education" ? (
    <GraduationCap size={16} />
  ) : type === "career" ? (
    <BriefcaseBusiness size={16} />
  ) : type === "move" ? (
    <MoveRight size={16} />
  ) : (
    <Milestone size={16} />
  );

export default function TimelineView({
  events,
  members,
  network,
  onSelect,
}: {
  events: LifeEvent[];
  members: Member[];
  network: NetworkSettings | null;
  onSelect: (m: Member) => void;
}) {
  const { language } = useLanguage();
  const copy = language === "hi" ? { title:"हमारे परिवार की कहानी", subtitle:"पीढ़ियों से जुड़े पल, यात्राएँ और महत्वपूर्ण घटनाएँ।", allTypes:"सभी घटनाएँ", allGenerations:"सभी पीढ़ियाँ", empty:"अभी कोई पारिवारिक पल नहीं", emptyHelp:"किसी सदस्य की प्रोफ़ाइल खोलकर महत्वपूर्ण घटना या याद जोड़ें।", undated:"तारीख नहीं" } : language === "mr" ? { title:"आपल्या कुटुंबाची गोष्ट", subtitle:"पिढ्यांमधील क्षण, प्रवास आणि महत्त्वाच्या घटना.", allTypes:"सर्व घटना", allGenerations:"सर्व पिढ्या", empty:"अजून कौटुंबिक क्षण नाहीत", emptyHelp:"सदस्याची प्रोफाइल उघडून महत्त्वाची घटना किंवा आठवण जोडा.", undated:"तारीख नाही" } : { title:"Our Family Story", subtitle:"Moments, moves and milestones shared across generations.", allTypes:"All event types", allGenerations:"All generations", empty:"No family moments here yet", emptyHelp:"Open a family member’s profile to add a milestone, memory or important life event.", undated:"Undated" };
  const cfg = getNetworkConfig(network),
    [type, setType] = useState("all"),
    [generation, setGeneration] = useState("");
  const memberById = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members],
  );
  const visible = useMemo(
    () =>
      events
        .filter((e) => {
          const m = memberById.get(e.member_id);
          return (
            !!m &&
            (type === "all" || e.event_type === type) &&
            (!generation || String(m.generation_level) === generation)
          );
        })
        .sort((a, b) =>
          String(b.event_date || b.created_at).localeCompare(
            String(a.event_date || a.created_at),
          ),
        ),
    [events, memberById, type, generation],
  );
  const groups = useMemo(() => {
    const x = new Map<string, LifeEvent[]>();
    visible.forEach((e) => {
      const year = e.event_date?.slice(0, 4) || copy.undated;
      x.set(year, [...(x.get(year) || []), e]);
    });
    return [...x.entries()];
  }, [visible, copy.undated]);
  return (
    <section>
      <div className="page-head">
        <div>
          <h1 className="page-title">
            {cfg.network_template === "family"
              ? copy.title
              : "Network Timeline"}
          </h1>
          <p className="page-subtitle">
            {cfg.network_template === "family"
              ? copy.subtitle
              : "A privacy-aware history of visible events across the network."}
          </p>
        </div>
        <CalendarDays size={25} />
      </div>
      <div className="filters">
        <select
          className="select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "all"
                ? copy.allTypes
                : t[0].toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={generation}
          onChange={(e) => setGeneration(e.target.value)}
        >
          <option value="">{copy.allGenerations}</option>
          {[...new Set(members.map((m) => m.generation_level))]
            .sort((a, b) => a - b)
            .map((g) => (
              <option key={g} value={g}>
                {cfg.level_label} {g}
              </option>
            ))}
        </select>
      </div>
      {groups.length === 0 && (
        <div className="card timeline-empty">
          <CalendarDays size={28} />
          <h3>
            {cfg.network_template === "family"
              ? copy.empty
              : "No visible events yet"}
          </h3>
          <p>
            {cfg.network_template === "family"
              ? copy.emptyHelp
              : "Add a visible event from an entity profile to begin the timeline."}
          </p>
        </div>
      )}
      <div className="network-timeline">
        {groups.map(([year, items]) => (
          <div className="timeline-year-group" key={year}>
            <div className="timeline-year">{year}</div>
            <div className="timeline-year-events">
              {items.map((e) => {
                const m = memberById.get(e.member_id)!;
                return (
                  <article className="card network-event" key={e.id}>
                    <div className={`event-icon ${e.event_type}`}>
                      {icon(e.event_type)}
                    </div>
                    <div className="event-main">
                      <div className="event-top">
                        <button
                          className="person-chip"
                          onClick={() => onSelect(m)}
                        >
                          {m.photo_url ? (
                            <img src={m.photo_url} alt="" />
                          ) : (
                            <span>{m.full_name.slice(0, 1)}</span>
                          )}
                          <b>{m.full_name}</b>
                        </button>
                        <span className="event-type">{e.event_type}</span>
                      </div>
                      <h3>{e.title}</h3>
                      <div className="person-meta">
                        {e.event_date
                          ? new Date(
                              `${e.event_date}T00:00:00`,
                            ).toLocaleDateString(language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN")
                          : new Date(e.created_at).toLocaleDateString(language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN")}
                        {e.location && (
                          <>
                            {" "}
                            · <MapPin size={11} /> {e.location}
                          </>
                        )}
                      </div>
                      {e.description && <p>{e.description}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
