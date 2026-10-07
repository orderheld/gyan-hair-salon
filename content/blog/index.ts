import type { BlogPost } from "../types";
import { post as hochzeitBewerbungHaarschnitt } from "./haarschnitt-hochzeit-bewerbung-biel";
import { post as fadePflegeZuhause } from "./fade-frisur-pflege-tipps";
import { post as barberOderCoiffeur } from "./barber-oder-coiffeur-biel";
import { post as herrenfrisurenTrendsBiel } from "./herrenfrisuren-trends-biel";
import { post as skinFadeLowFadeTaperUnterschied } from "./skin-fade-low-fade-taper-unterschied";
import { post as bartpflegeTippsBielersee } from "./bartpflege-tipps-bielersee";
import { post as wieOftZumCoiffeur } from "./wie-oft-zum-coiffeur";

// Neueste zuerst
export const posts: BlogPost[] = [
  hochzeitBewerbungHaarschnitt,
  fadePflegeZuhause,
  barberOderCoiffeur,
  herrenfrisurenTrendsBiel,
  skinFadeLowFadeTaperUnterschied,
  bartpflegeTippsBielersee,
  wieOftZumCoiffeur,
];

/**
 * Lesetipps für eine Leistung oder lokale Seite: zuerst Beiträge, die genau dazu passen,
 * dann solche zu den gezeigten Leistungen, aufgefüllt mit den neuesten.
 */
export function relatedPosts({ seo, service, services = [] }: { seo?: string; service?: string; services?: string[] }, count = 3): BlogPost[] {
  const score = (p: BlogPost) =>
    (seo && p.related?.seo?.includes(seo) ? 4 : 0) +
    (service && p.related?.services?.includes(service) ? 4 : 0) +
    services.filter((s) => p.related?.services?.includes(s)).length;
  return posts
    .map((p, i) => ({ p, i, s: score(p) }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, count)
    .map((x) => x.p);
}
