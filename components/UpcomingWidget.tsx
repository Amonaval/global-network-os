"use client";
import { CalendarHeart } from "lucide-react";
import { LifeEvent, Member } from "../lib/types";
import { useLanguage } from "../lib/i18n";

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
  const { language } = useLanguage();
  const copy = language === "hi" ? { title:"आने वाले दिन", subtitle:"अगले 30 दिनों के पारिवारिक अवसर", birthday:"जन्मदिन", today:"आज", days:"दिन" } : language === "mr" ? { title:"लवकरच", subtitle:"पुढील 30 दिवसांतील कौटुंबिक प्रसंग", birthday:"वाढदिवस", today:"आज", days:"दिवस" } : { title:"Coming up", subtitle:"Family milestones in the next 30 days", birthday:"Birthday", today:"today", days:"d" };
  if (!items.length) return null;
  return (
    <div className="card upcoming-widget">
      <div className="upcoming-head">
        <CalendarHeart size={18} />
        <div>
          <b>{copy.title}</b>
          <span>{copy.subtitle}</span>
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
                {event.title === "Birthday"
                  ? copy.birthday
                  : event.event_type[0].toUpperCase() +
                    event.event_type.slice(1)}{" "}
                ·{" "}
                {nextDate.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
                {daysAway === 0 ? ` · ${copy.today}` : ` · ${daysAway}${copy.days}`}
              </small>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
