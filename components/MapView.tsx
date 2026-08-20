"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Member } from "../lib/types";

function FitToMembers({ members }: { members: Member[] }) {
  const map = useMap();
  const coords = members
    .filter(m => Number.isFinite(m.latitude) && Number.isFinite(m.longitude))
    .map(m => [m.latitude!, m.longitude!] as [number, number]);

  if (coords.length) {
    const bounds: LatLngBoundsExpression = coords;
    map.fitBounds(bounds, { padding: [35, 35], maxZoom: 6 });
  }
  return null;
}

export default function MapView({ members, onSelect }: { members: Member[]; onSelect: (m: Member) => void }) {
  const groups = useMemo(() => {
    const map = new Map<string, { city: string; country: string; lat: number; lng: number; members: Member[] }>();
    members.forEach(m => {
      if (!Number.isFinite(m.latitude) || !Number.isFinite(m.longitude)) return;
      const key = `${m.city || "Unknown"}|${m.country || ""}|${m.latitude}|${m.longitude}`;
      const existing = map.get(key);
      if (existing) existing.members.push(m);
      else map.set(key, { city: m.city || "Unknown", country: m.country || "", lat: m.latitude!, lng: m.longitude!, members: [m] });
    });
    return Array.from(map.values());
  }, [members]);

  return (
    <div className="map-layout">
      <div className="map-card card">
        <MapContainer center={[20.59, 78.96]} zoom={4} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitToMembers members={members} />
          {groups.map(group => (
            <CircleMarker
              key={`${group.city}-${group.lat}-${group.lng}`}
              center={[group.lat, group.lng]}
              radius={Math.min(22, 9 + Math.log2(group.members.length + 1) * 4)}
              pathOptions={{ fillOpacity: 0.8, weight: 2 }}
            >
              <Popup>
                <div style={{ minWidth: 190 }}>
                  <strong style={{ fontSize: 15 }}>{group.city}</strong>
                  <div style={{ color: "#687386", margin: "4px 0 10px" }}>{group.country} · {group.members.length} member{group.members.length === 1 ? "" : "s"}</div>
                  {group.members.slice(0, 8).map(m => (
                    <button key={m.id} className="map-person" onClick={() => onSelect(m)}>
                      <span>{m.full_name}</span><small>{m.profession || "Member"}</small>
                    </button>
                  ))}
                  {group.members.length > 8 && <div style={{ fontSize: 11, marginTop: 5 }}>+ {group.members.length - 8} more</div>}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <aside className="map-summary card">
        <div className="map-summary-head"><div><h3>Members by location</h3><p>City-level locations only</p></div><strong>{members.filter(m => Number.isFinite(m.latitude) && Number.isFinite(m.longitude)).length}</strong></div>
        {groups.sort((a,b)=>b.members.length-a.members.length).map(g => <button key={`${g.city}-${g.lat}`} className="location-row" onClick={() => onSelect(g.members[0])}><span><b>{g.city}</b><small>{g.country}</small></span><strong>{g.members.length}</strong></button>)}
        {!groups.length && <div className="empty">No member has valid coordinates. Import latitude/longitude or use the supplied demo dataset.</div>}
      </aside>
    </div>
  );
}
