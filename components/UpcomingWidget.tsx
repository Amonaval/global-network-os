"use client";
import { CalendarHeart } from "lucide-react";
import { LifeEvent, Member } from "../lib/types";

export type UpcomingMilestone = {
  event: LifeEvent;
  member: Member;
  nextDate: Date;
  daysAway: number;
};
export default function UpcomingWidget({
  items,
  onSelect,
}: {
  items: UpcomingMilestone[];
  onSelect: (m: Member) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="card upcoming-widget">
      <div className="upcoming-head">
        <CalendarHeart size={18} />
        <div>
          <b>Coming up</b>
          <span>Family milestones in the next 30 days</span>
        </div>
      </div>
      <div className="upcoming-scroll">
        {items.map(({ event, member, nextDate, daysAway }) => (
          <button
            key={event.id}
            className="upcoming-chip"
            onClick={() => onSelect(member)}
          >
            <span className="avatar">
              {member.photo_url ? (
                <img src={member.photo_url} alt="" />
              ) : (
                member.full_name.slice(0, 1)
              )}
            </span>
            <span>
              <b>{member.full_name}</b>
              <small>
                {event.event_type} ·{" "}
                {nextDate.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
                {daysAway === 0 ? " · today" : ` · ${daysAway}d`}
              </small>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
