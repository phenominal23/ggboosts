import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { Guide } from "@/lib/guides";

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link className="gd-card" href={`/guides/${guide.slug}`}>
      <span className="gd-card__tag"><BookOpen size={13} /> {guide.topic} · {guide.minutes} min read</span>
      <h3>{guide.title}</h3>
      <p>{guide.description}</p>
      <span className="gd-card__more">Read guide <ArrowRight size={15} /></span>
    </Link>
  );
}
