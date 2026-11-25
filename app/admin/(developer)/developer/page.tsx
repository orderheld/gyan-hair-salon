import Link from "next/link";
import { citations, lighthouse, seoScore } from "@/content/insights";
import { profileHistory } from "@/content/google-profile-history";
import { keywords, rankingChecks } from "@/content/rankings";
import { scHistory } from "@/content/search-console-history";
import { getAdminText } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { fill } from "@/lib/i18n";
import { getSearchConsole, type ScRow } from "@/lib/search-console";
import { getBookingHistory, getTechStats, getVisitStats, VITAL_LIMITS, type Count, type VitalKey, type VitalRow } from "@/lib/visits";

export const dynamic = "force-dynamic";

type Search = Promise<{ tage?: string; sc?: string }>;
const RANGES = [7, 30, 90, 365] as const;
/** Grosse Plattformen und Suchmaschinen sind keine Backlinks im eigentlichen Sinn */
const PLATFORMS = /(^|\.)(google|bing|instagram|facebook|fb|tiktok|whatsapp|wa|duckduckgo|yahoo|ecosia|qwant|chatgpt|openai|perplexity|com\.google)\./;

/** Developer: Besucher, Quellen, Herkunft, Seiten und Google-Platzierung auf einen Blick */
export default async function Developer({ searchParams }: { searchParams: Search }) {
  await requireAdmin();
  const { tage, sc } = await searchParams;
  const { locale, t: all } = await getAdminText();
  const t = all.dev;
  const days = RANGES.find((r) => String(r) === tage) ?? 30;
  const [stats, tech, bookingHist, console_] = await Promise.all([
    getVisitStats(days),
    getTechStats(days),
    getBookingHistory(),
    getSearchConsole(sc === "1").catch(() => ({ state: "error" as const, error: "" })),
  ]);

  const num = new Intl.NumberFormat(locale === "en" ? "en-GB" : "de-CH");
  const dec = new Intl.NumberFormat(locale === "en" ? "en-GB" : "de-CH", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const pct = new Intl.NumberFormat(locale === "en" ? "en-GB" : "de-CH", { style: "percent", maximumFractionDigits: 1 });
  const dateFmt = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : `${locale}-CH`, { day: "numeric", month: "numeric", year: "numeric", timeZone: "Europe/Zurich" });
  const shortDay = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : `${locale}-CH`, { day: "numeric", month: "numeric", timeZone: "UTC" });
  const timeFmt = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : `${locale}-CH`, { weekday: "short", day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" });
  const regions = new Intl.DisplayNames([locale], { type: "region" });
  const country = (code: string) => {
    if (!code) return t.unknown;
    try {
      return regions.of(code) ?? code;
    } catch {
      return code;
    }
  };
  const day = (key: string) => shortDay.format(new Date(`${key}T12:00:00Z`));
  const fullDay = (key: string) => dateFmt.format(new Date(`${key}T12:00:00Z`));

  const delta = (now: number, before: number) => {
    if (!before) return null;
    const d = (now - before) / before;
    return `${d >= 0 ? "+" : "−"}${pct.format(Math.abs(d))}`;
  };

  const { totals, previous } = stats;
  const kpis = [
    { label: t.visitors, value: num.format(totals.visitors), hint: t.visitorsHint, delta: delta(totals.visitors, previous.visitors) },
    { label: t.visits, value: num.format(totals.visits), delta: delta(totals.visits, previous.visits) },
    { label: t.pageviews, value: num.format(totals.pageviews), hint: `${dec.format(totals.pagesPerVisit)} ${t.perVisit}`, delta: delta(totals.pageviews, previous.pageviews) },
    { label: t.bookings, value: num.format(totals.bookings), hint: totals.visits ? `${pct.format(totals.bookings / totals.visits)} · ${t.bookingsHint}` : t.bookingsHint, delta: delta(totals.bookings, previous.bookings) },
  ];
  const empty = totals.pageviews === 0;
  const latest = rankingChecks[0];
  // Suchbegriffe: live aus der Search Console, sonst der von Hand gesicherte Verlauf seit dem Start
  const scRows: ScRow[] =
    console_.state === "ok" && console_.queries?.length
      ? console_.queries
      : scHistory.queries.map(([key, clicks, impressions, position]) => ({ key, clicks, impressions, ctr: impressions ? clicks / impressions : 0, position }));
  const scFirst = scHistory.daily.find((d) => d[1] > 0 || d[2] > 0)?.[0] ?? scHistory.daily[0]?.[0] ?? "";
  const scDaily = scHistory.daily.filter((d) => d[0] >= scFirst).map(([day, clicks, impressions]) => ({ day, visitors: clicks, pageviews: impressions }));
  const monthFmt = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : `${locale}-CH`, { month: "long", year: "numeric", timeZone: "UTC" });
  const thisMonth = new Date().toISOString().slice(0, 7);
  const bkWeeks = bookingHist.weeks.map((w) => ({ day: w.week, visitors: w.online, pageviews: w.online + w.admin }));

  return (
    <div className="dev">
      <div className="admin-title">
        <h1 className="h2">{t.title}</h1>
        <p className="muted">{t.intro}</p>
      </div>

      <nav className="dev-jump" aria-label={t.title}>
        <a href="#verlauf">{t.navHistory}</a>
        <a href="#besucher">{t.navVisitors}</a>
        <a href="#quellen">{t.navSources}</a>
        <a href="#google">{t.navGoogle}</a>
        <a href="#seo">{t.navSeo}</a>
        <a href="#technik">{t.navTech}</a>
        <a href={`/admin/developer/daten?tage=${days}`} title={t.exportHint}>{t.export} ↗</a>
      </nav>

      <section className="dev-history" id="verlauf">
        <div className="admin-title">
          <h2 className="h3">{t.history}</h2>
          <p className="small muted">{t.historyHint}</p>
        </div>

        <section className="panel">
          <h3 className="h4">{fill(t.bkTitle, { d: bookingHist.first ? fullDay(bookingHist.first) : "–" })}</h3>
          <div className="dev-kpis">
            <div className="panel"><span>{t.bkOnline}</span><strong>{num.format(bookingHist.totals.online)}</strong></div>
            <div className="panel"><span>{t.bkCustomers}</span><strong>{num.format(bookingHist.totals.customers)}</strong></div>
            <div className="panel"><span>{t.bkAdmin}</span><strong>{num.format(bookingHist.totals.admin)}</strong></div>
            <div className="panel"><span>{t.bkCancelled}</span><strong>{num.format(bookingHist.totals.cancelled)}</strong></div>
          </div>
          {bkWeeks.length > 0 && (
            <>
              <h4 className="h5 dev-sub">{t.bkWeekly}</h4>
              <DayChart data={bkWeeks} label={(d) => day(d)} format={(n) => num.format(n)} views={t.bkAll} visitors={t.bkOnline} />
            </>
          )}
        </section>

        <section className="panel">
          <h3 className="h4">{fill(t.scHistTitle, { d: scFirst ? fullDay(scFirst) : "–" })}</h3>
          <p className="small muted">{fill(t.scHistHint, { d: fullDay(scHistory.asOf) })}</p>
          <div className="dev-kpis">
            <div className="panel"><span>{t.scClicks}</span><strong>{num.format(scHistory.totals.clicks)}</strong></div>
            <div className="panel"><span>{t.scImpressions}</span><strong>{num.format(scHistory.totals.impressions)}</strong></div>
            <div className="panel"><span>{t.scCtr}</span><strong>{pct.format(scHistory.totals.ctr)}</strong></div>
            <div className="panel"><span>{t.scPosition}</span><strong>{dec.format(scHistory.totals.position)}</strong></div>
          </div>
          <h4 className="h5 dev-sub">{t.clicksPerDay}</h4>
          <DayChart data={scDaily} label={(d) => day(d)} format={(n) => num.format(n)} views={t.scImpressions} visitors={t.scClicks} />
          <div className="dev-grid">
            <div>
              <h4 className="h5 dev-sub">{t.scQueries}</h4>
              <ScTable rows={scHistory.queries.slice(0, 20).map(([key, clicks, impressions, position]) => ({ key, clicks, impressions, ctr: 0, position }))} t={t} num={num} dec={dec} />
            </div>
            <div>
              <h4 className="h5 dev-sub">{t.scPages}</h4>
              <BarTable rows={scHistory.pages.map(([key, clicks, impressions]) => ({ key, visits: impressions, visitors: clicks }))} label={(k) => k} t={t} firstCol={t.scImpressions} secondCol={t.scClicks} mono />
              <h4 className="h5 dev-sub">{t.devices}</h4>
              <BarTable rows={scHistory.devices.map(([key, clicks, impressions]) => ({ key, visits: impressions, visitors: clicks }))} label={(k) => t.device[k] ?? k} t={t} firstCol={t.scImpressions} secondCol={t.scClicks} />
              <h4 className="h5 dev-sub">{t.countries}</h4>
              <BarTable rows={scHistory.countries.map(([key, clicks, impressions]) => ({ key, visits: impressions, visitors: clicks }))} label={country} t={t} firstCol={t.scImpressions} secondCol={t.scClicks} />
            </div>
          </div>
        </section>

        <section className="panel">
          <h3 className="h4">{t.gbp}</h3>
          <p className="small muted">{fill(t.gbpHint, { p: profileHistory.period })}</p>
          <div className="dev-kpis">
            <div className="panel"><span>{t.gbpViews}</span><strong>{num.format(profileHistory.views.total)}</strong></div>
            <div className="panel"><span>{t.gbpSearches}</span><strong>{num.format(profileHistory.searches)}</strong></div>
            <div className="panel"><span>{t.gbpInteractions}</span><strong>{num.format(profileHistory.months.reduce((a, m) => a + m.interactions, 0))}</strong></div>
            <div className="panel"><span>{t.gbpWebsite}</span><strong>{num.format(profileHistory.months.reduce((a, m) => a + m.websiteClicks, 0))}</strong></div>
          </div>
          <div className="dev-table-wrap">
            <table className="dev-table">
              <thead>
                <tr>
                  <th scope="col">{t.gbpMonth}</th>
                  <th scope="col" className="num">{t.gbpInteractions}</th>
                  <th scope="col" className="num">{t.gbpWebsite}</th>
                  <th scope="col" className="num">{t.gbpDirections}</th>
                  <th scope="col" className="num">{t.gbpCalls}</th>
                  <th scope="col" className="num">{t.gbpChat}</th>
                </tr>
              </thead>
              <tbody>
                {[...profileHistory.months].reverse().map((m) => (
                  <tr key={m.month}>
                    <th scope="row">{monthFmt.format(new Date(`${m.month}-15T12:00:00Z`))} {m.month === thisMonth && <small className="muted">{t.partial}</small>}</th>
                    <td className="num"><strong>{num.format(m.interactions)}</strong></td>
                    <td className="num">{num.format(m.websiteClicks)}</td>
                    <td className="num">{num.format(m.directions)}</td>
                    <td className="num">{num.format(m.calls)}</td>
                    <td className="num">{num.format(m.chatClicks)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="dev-grid">
            <div>
              <h4 className="h5 dev-sub">{t.gbpViews}</h4>
              <BarTable rows={(["searchMobile", "mapsMobile", "searchDesktop", "mapsDesktop"] as const).map((k) => ({ key: k, visits: profileHistory.views[k], visitors: 0 }))} label={(k) => t.gbpSplit[k] ?? k} t={t} firstCol={t.gbpViews} hideSecond />
            </div>
            <div>
              <h4 className="h5 dev-sub">{t.gbpTerms}</h4>
              <BarTable rows={profileHistory.searchTerms.map(([key, c]) => ({ key, visits: c, visitors: 0 }))} label={(k) => k} t={t} firstCol={t.gbpSearches} hideSecond />
            </div>
          </div>
        </section>
      </section>

      <nav className="dev-range" aria-label={t.title} id="besucher">
        {RANGES.map((r) => (
          <Link key={r} href={`/admin/developer?tage=${r}`} className={r === days ? "active" : ""} aria-current={r === days ? "page" : undefined}>
            {t.range[r]}
          </Link>
        ))}
        <span className="small muted dev-today">
          {t.today}: <strong>{num.format(stats.today.visitors)}</strong> {t.visitors} · <strong>{num.format(stats.today.pageviews)}</strong> {t.pageviews}
        </span>
      </nav>

      <div className="dev-kpis">
        {kpis.map((k) => (
          <div className="panel" key={k.label}>
            <span>{k.label}</span>
            <strong>{k.value}</strong>
            {k.hint && <small>{k.hint}</small>}
            {k.delta && <small className={k.delta.startsWith("+") ? "dev-up" : "dev-down"}>{fill(t.vsBefore, { d: k.delta, n: days })}</small>}
          </div>
        ))}
      </div>

      {empty && <p className="panel muted">{stats.firstDay ? fill(t.empty, { d: fullDay(stats.firstDay) }) : t.emptyNew}</p>}

      <section className="panel dev-chart">
        <h2 className="h4">{t.chart}</h2>
        <DayChart data={stats.daily} label={(d) => day(d)} format={(n) => num.format(n)} views={t.chartPageviews} visitors={t.visitors} />
      </section>

      <div className="dev-grid" id="quellen">
        <section className="panel">
          <h2 className="h4">{t.sources}</h2>
          <BarTable rows={stats.sources} label={(k) => t.source[k] ?? k} t={t} withBookings />
          <p className="small muted">{t.sourcesHint}</p>
        </section>

        <section className="panel">
          <h2 className="h4">{t.referrers}</h2>
          <BarTable rows={stats.referrers} label={(k) => k} t={t} withBookings />
          {stats.campaigns.length > 0 && (
            <>
              <h3 className="h5 dev-sub">{t.campaigns}</h3>
              <BarTable rows={stats.campaigns} label={(k) => k} t={t} withBookings />
            </>
          )}
        </section>

        <section className="panel">
          <h2 className="h4">{t.cities}</h2>
          <BarTable rows={stats.cities.map((c) => ({ ...c, key: c.country && c.country !== "CH" ? `${c.key} (${c.country})` : c.key }))} label={(k) => k} t={t} />
          <p className="small muted">{t.geoHint}</p>
        </section>

        <section className="panel">
          <h2 className="h4">{t.countries}</h2>
          <BarTable rows={stats.countries} label={country} t={t} withBookings />
        </section>

        <section className="panel dev-wide">
          <h2 className="h4">{t.pages}</h2>
          <BarTable rows={stats.pages.map((p) => ({ key: p.key, visits: p.pageviews, visitors: p.visitors }))} label={(k) => k} t={t} firstCol={t.colViews} mono />
        </section>

        <section className="panel">
          <h2 className="h4">{t.landings}</h2>
          <BarTable rows={stats.landings} label={(k) => k} t={t} withBookings mono />
        </section>

        <section className="panel">
          <h2 className="h4">{t.devices}</h2>
          <BarTable rows={stats.devices} label={(k) => t.device[k] ?? k} t={t} withBookings />
          <h3 className="h5 dev-sub">{t.languages}</h3>
          <BarTable rows={stats.locales} label={(k) => k.toUpperCase()} t={t} withBookings />
        </section>

        <section className="panel dev-wide">
          <h2 className="h4">{t.hours}</h2>
          <HourChart hours={stats.hours} />
        </section>
      </div>

      <section className="panel" id="google">
        <h2 className="h4">{t.rankings}</h2>
        <p className="small muted">{t.rankingsHint}</p>
        <div className="dev-table-wrap">
          <table className="dev-table">
            <thead>
              <tr>
                <th scope="col">{t.keyword}</th>
                <th scope="col" className="num">{t.maps}</th>
                <th scope="col" className="num">{t.organic}</th>
                <th scope="col" className="num">{console_.state === "ok" ? t.scPosition : t.scHistPos}</th>
                <th scope="col" className="num">{t.scClicks}</th>
                <th scope="col" className="num">{t.scImpressions}</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((k) => {
                const r = latest?.results[k];
                const g = scRows.find((q) => q.key.toLowerCase() === k);
                const place = (v: number | null | undefined) =>
                  v === undefined ? <span className="muted">–</span> : v === null ? <span className="muted">{t.notFound}</span> : <strong className={v <= 3 ? "dev-top" : undefined}>{v}</strong>;
                return (
                  <tr key={k}>
                    <th scope="row">{k}</th>
                    {r ? (
                      <>
                        <td className="num">{place(r.maps)}</td>
                        <td className="num">{place(r.organic)}</td>
                      </>
                    ) : (
                      <td className="num muted" colSpan={2}>{t.notChecked}</td>
                    )}
                    <td className="num">{g ? dec.format(g.position) : <span className="muted">–</span>}</td>
                    <td className="num">{g ? num.format(g.clicks) : "–"}</td>
                    <td className="num">{g ? num.format(g.impressions) : "–"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {latest && (
          <p className="small muted">
            {fill(t.checkedOn, { d: fullDay(latest.date) })}
            {latest.note ? ` · ${latest.note}` : ""}
          </p>
        )}
      </section>

      {console_.state === "ok" && (
      <section className="panel">
        <div className="dev-head">
          <h2 className="h4">{t.sc}</h2>
          {console_.state === "ok" && (
            <Link href={`/admin/developer?tage=${days}&sc=1#google`} className="btn btn-light btn-sm">{t.refresh}</Link>
          )}
        </div>
        {console_.state === "ok" ? (
          <>
            <p className="small muted">{t.scHint}</p>
            <div className="dev-kpis">
              <div className="panel"><span>{t.scClicks}</span><strong>{num.format(console_.totals?.clicks ?? 0)}</strong></div>
              <div className="panel"><span>{t.scImpressions}</span><strong>{num.format(console_.totals?.impressions ?? 0)}</strong></div>
              <div className="panel"><span>{t.scCtr}</span><strong>{pct.format(console_.totals?.ctr ?? 0)}</strong></div>
              <div className="panel"><span>{t.scPosition}</span><strong>{dec.format(console_.totals?.position ?? 0)}</strong></div>
            </div>
            <div className="dev-grid">
              <div>
                <h3 className="h5 dev-sub">{t.scQueries}</h3>
                <ScTable rows={(console_.queries ?? []).slice(0, 25)} t={t} num={num} dec={dec} />
              </div>
              <div>
                <h3 className="h5 dev-sub">{t.scPages}</h3>
                <ScTable rows={(console_.pages ?? []).map((p) => ({ ...p, key: p.key.replace(/^https?:\/\/[^/]+/, "") || "/" }))} t={t} num={num} dec={dec} mono />
              </div>
            </div>
            <p className="small muted">
              {console_.at ? fill(t.scUpdated, { d: timeFmt.format(new Date(console_.at)) }) : ""}
              {console_.error ? ` · ${fill(t.scError, { e: console_.error })}` : ""}
            </p>
          </>
        ) : (
          <div className="dev-note">
            <p>
              {console_.state === "notConnected" ? t.scNotConnected
              : console_.state === "noScope" ? t.scNoScope
              : console_.state === "noSite" ? t.scNoSite
              : fill(t.scError, { e: console_.error ?? "" })}
            </p>
            <Link href="/admin/stempel/bewertungen" className="btn btn-light btn-sm">{t.scConnect}</Link>
          </div>
        )}
      </section>
      )}

      <section className="panel" id="seo">
        <h2 className="h4">{t.seo}: {seoScore.total} %</h2>
        <p className="small muted">{fill(t.seoHint, { d: fullDay(seoScore.date) })}</p>
        <ul className="dev-score">
          {seoScore.parts.map((p) => (
            <li key={p.name}>
              <span>{p.name}</span>
              <span className="dev-meter" aria-hidden><i style={{ width: `${p.value}%` }} className={p.value >= 85 ? "good" : p.value >= 60 ? "mid" : "bad"} /></span>
              <strong>{p.value} %</strong>
            </li>
          ))}
        </ul>
      </section>

      <div className="dev-grid">
        <section className="panel">
          <h2 className="h4">{t.citations}</h2>
          <p className="small muted">
            {fill(t.citationsDone, { n: citations.filter((c) => c.status === "live").length, m: citations.filter((c) => c.status !== "skip").length })} · {t.citationsHint}
          </p>
          <ul className="dev-citations">
            {citations.map((c) => (
              <li key={c.id}>
                <em className={`dev-status dev-status-${c.status}`}>{t.citationStatus[c.status]}</em>
                <a href={c.url} target="_blank" rel="noopener noreferrer">{c.name}</a>
                <small className="muted">{t.linkType[c.link]}{c.note ? ` · ${c.note}` : ""}</small>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h2 className="h4">{t.backlinksTraffic}</h2>
          <BarTable rows={stats.referrers.filter((r) => !PLATFORMS.test(r.key))} label={(k) => k} t={t} withBookings />
          <p className="small muted">{t.backlinksTrafficHint}</p>
        </section>
      </div>

      <section className="panel" id="technik">
        <h2 className="h4">{t.tech}</h2>
        <p className="small muted">{t.techHint}</p>
        {tech.overall.length === 0 ? (
          <p className="muted">{t.noVitals}</p>
        ) : (
          <>
            <VitalsTable rows={tech.overall} first={t.devices} label={(k) => (k === "all" ? t.allDevices : t.device[k] ?? k)} t={t} />
            {tech.pages.length > 0 && (
              <>
                <h3 className="h5 dev-sub">{t.slowPages}</h3>
                <VitalsTable rows={tech.pages} first={t.pages} label={(k) => k} t={t} mono />
              </>
            )}
          </>
        )}
      </section>

      <div className="dev-grid">
        <section className="panel">
          <h2 className="h4">{t.errors}</h2>
          <p className="small muted">{t.errorsHint}</p>
          {tech.errors.length === 0 ? (
            <p className="dev-ok">{t.noErrors}</p>
          ) : (
            <ul className="dev-issues">
              {tech.errors.map((e) => (
                <li key={e.message}>
                  <strong>{fill(t.times, { n: e.count })}</strong>
                  <span>
                    {e.message}
                    <small className="muted dev-path">{e.path}{e.detail ? ` · ${e.detail}` : ""} · {timeFmt.format(e.last)}</small>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="panel">
          <h2 className="h4">{t.notFoundTitle}</h2>
          <p className="small muted">{t.notFoundHint}</p>
          {tech.notFound.length === 0 ? (
            <p className="dev-ok">{t.noNotFound}</p>
          ) : (
            <ul className="dev-issues">
              {tech.notFound.map((e) => (
                <li key={e.path}>
                  <strong>{fill(t.times, { n: e.count })}</strong>
                  <span>
                    <span className="dev-path">{e.path}</span>
                    <small className="muted">{e.refHost ? `${fill(t.from, { h: e.refHost })} · ` : ""}{timeFmt.format(e.last)}</small>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="panel">
        <h2 className="h4">{t.lighthouse}</h2>
        <p className="small muted">{t.lighthouseHint}</p>
        <div className="dev-table-wrap">
          <table className="dev-table">
            <thead>
              <tr>
                <th scope="col">{t.date}</th>
                <th scope="col" className="num">{t.lhHome}</th>
                <th scope="col" className="num">{t.lhBooking}</th>
                <th scope="col" className="num">{t.lhSeo}</th>
              </tr>
            </thead>
            <tbody>
              {lighthouse.slice(0, 8).map((l) => (
                <tr key={`${l.date}${l.commit ?? ""}`}>
                  <th scope="row">{fullDay(l.date)}{l.commit ? <small className="muted dev-path"> {l.commit}</small> : null}</th>
                  <td className="num"><Score v={l.home} /></td>
                  <td className="num"><Score v={l.booking} /></td>
                  <td className="num">{l.seo ? <Score v={l.seo} /> : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2 className="h4">{t.recent}</h2>
        {stats.recent.length === 0 ? (
          <p className="muted">{t.emptyNew}</p>
        ) : (
          <ul className="dev-recent">
            {stats.recent.map((r, i) => (
              <li key={i}>
                <time>{timeFmt.format(r.at)}</time>
                <span className="dev-recent-main">
                  <strong>{t.source[r.source] ?? r.source}</strong>
                  {r.refHost && <span className="muted"> · {r.refHost}</span>}
                  <span className="dev-path">{r.path}</span>
                </span>
                <span className="dev-recent-meta muted">
                  {[r.city, r.country && r.country !== "CH" ? country(r.country) : "", t.device[r.device] ?? r.device, r.pages === 1 ? t.recentPage : fill(t.recentPages, { n: r.pages })].filter(Boolean).join(" · ")}
                  {r.booked && <em className="dev-booked">{t.booked}</em>}
                </span>
              </li>
            ))}
          </ul>
        )}
        {stats.firstDay && <p className="small muted">{fill(t.since, { d: fullDay(stats.firstDay) })}</p>}
      </section>
    </div>
  );
}

type DevText = Awaited<ReturnType<typeof getAdminText>>["t"]["dev"];

/** Tabelle mit Balken: Name, Anteil als Balken, Besuche, Besucher, Buchungen */
function BarTable({
  rows,
  label,
  t,
  withBookings,
  firstCol,
  secondCol,
  hideSecond,
  mono,
}: {
  rows: Count[];
  label: (key: string) => string;
  t: DevText;
  withBookings?: boolean;
  firstCol?: string;
  secondCol?: string;
  hideSecond?: boolean;
  mono?: boolean;
}) {
  if (!rows.length) return <p className="muted small">–</p>;
  const total = rows.reduce((s, r) => s + r.visits, 0);
  const max = Math.max(...rows.map((r) => r.visits), 1);
  return (
    <div className="dev-table-wrap">
      <table className="dev-table dev-bars">
        <thead>
          <tr>
            <th scope="col"><span className="sr-only">{t.keyword}</span></th>
            <th scope="col" className="num">{firstCol ?? t.colVisits}</th>
            {!hideSecond && <th scope="col" className="num">{secondCol ?? t.colVisitors}</th>}
            {withBookings && <th scope="col" className="num">{t.colBookings}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row" className={mono ? "dev-path" : undefined}>
                <span className="dev-bar" style={{ width: `${Math.max(2, (r.visits / max) * 100)}%` }} aria-hidden />
                <span className="dev-bar-label">{label(r.key) || "–"}</span>
                <small className="muted"> {Math.round((r.visits / total) * 100)} %</small>
              </th>
              <td className="num">{r.visits}</td>
              {!hideSecond && <td className="num">{r.visitors}</td>}
              {withBookings && <td className="num">{r.bookings ? <strong>{r.bookings}</strong> : <span className="muted">0</span>}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScTable({ rows, t, num, dec, mono }: { rows: ScRow[]; t: DevText; num: Intl.NumberFormat; dec: Intl.NumberFormat; mono?: boolean }) {
  if (!rows.length) return <p className="muted small">{t.scNoData}</p>;
  return (
    <div className="dev-table-wrap">
      <table className="dev-table">
        <thead>
          <tr>
            <th scope="col">{t.keyword}</th>
            <th scope="col" className="num">{t.scClicks}</th>
            <th scope="col" className="num">{t.scImpressions}</th>
            <th scope="col" className="num">{t.scPosition}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row" className={mono ? "dev-path" : undefined}>{r.key}</th>
              <td className="num">{num.format(r.clicks)}</td>
              <td className="num">{num.format(r.impressions)}</td>
              <td className="num">{dec.format(r.position)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Säulen pro Tag (Besucher), Seitenaufrufe als feine Linie darüber */
function DayChart({ data, label, format, views, visitors }: { data: { day: string; visitors: number; pageviews: number }[]; label: (d: string) => string; format: (n: number) => string; views: string; visitors: string }) {
  const W = 1000;
  const H = 220;
  // Säulen und Linie mit eigener Skala, damit kleine Werte (z. B. Klicks neben Impressionen) sichtbar bleiben
  const max = Math.max(...data.map((d) => d.pageviews), 1);
  const maxCol = Math.max(...data.map((d) => d.visitors), 1);
  const step = W / data.length;
  const gap = data.length > 60 ? 0.5 : 2;
  const y = (v: number) => H - (v / max) * (H - 10);
  const yc = (v: number) => H - (v / maxCol) * (H - 10);
  const line = data.map((d, i) => `${i ? "L" : "M"}${(i + 0.5) * step},${y(d.pageviews)}`).join(" ");
  const ticks = data.length <= 14 ? data.map((_, i) => i) : [0, Math.floor(data.length / 4), Math.floor(data.length / 2), Math.floor((3 * data.length) / 4), data.length - 1];
  return (
    <figure className="dev-daychart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${visitors} / ${views}`}>
        {data.map((d, i) => (
          <rect key={d.day} x={i * step + gap / 2} y={yc(d.visitors)} width={Math.max(step - gap, 0.5)} height={H - yc(d.visitors)} rx={data.length > 60 ? 0 : 3} className="dev-col">
            <title>{`${label(d.day)}: ${format(d.visitors)} ${visitors}, ${format(d.pageviews)} ${views}`}</title>
          </rect>
        ))}
        <path d={line} className="dev-line" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="dev-ticks">
        {ticks.map((i) => (
          <span key={i} style={{ left: `${((i + 0.5) / data.length) * 100}%` }}>{label(data[i].day)}</span>
        ))}
      </div>
      <figcaption className="small muted">
        <i className="dev-key dev-key-col" /> {visitors} (max {format(maxCol)}) <i className="dev-key dev-key-line" /> {views} (max {format(max)})
      </figcaption>
    </figure>
  );
}

function HourChart({ hours }: { hours: number[] }) {
  const max = Math.max(...hours, 1);
  return (
    <div className="dev-hours">
      {hours.map((v, h) => (
        <div key={h} title={`${h}:00 · ${v}`}>
          <span style={{ height: `${(v / max) * 100}%` }} />
          <small>{h % 3 === 0 ? h : ""}</small>
        </div>
      ))}
    </div>
  );
}

function Score({ v }: { v: number }) {
  return <strong className={v >= 90 ? "dev-good" : v >= 50 ? "dev-mid" : "dev-bad"}>{v}</strong>;
}

const VITALS: VitalKey[] = ["lcp", "inp", "cls", "fcp", "ttfb"];

function rate(key: VitalKey, v: number) {
  const [good, poor] = VITAL_LIMITS[key];
  return v <= good ? "dev-good" : v <= poor ? "dev-mid" : "dev-bad";
}

const showVital = (key: VitalKey, v: number) => (key === "cls" ? v.toFixed(2) : v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`);

function VitalsTable({ rows, first, label, t, mono }: { rows: VitalRow[]; first: string; label: (k: string) => string; t: DevText; mono?: boolean }) {
  return (
    <div className="dev-table-wrap">
      <table className="dev-table">
        <thead>
          <tr>
            <th scope="col">{first}</th>
            {VITALS.map((k) => <th scope="col" className="num" key={k}>{t.vitals[k]}</th>)}
            <th scope="col" className="num">{t.samples}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row" className={mono ? "dev-path" : undefined}>{label(r.key)}</th>
              {VITALS.map((k) => {
                const v = r[k];
                return <td className="num" key={k}>{v === null ? <span className="muted">–</span> : <strong className={rate(k, v)}>{showVital(k, v)}</strong>}</td>;
              })}
              <td className="num muted">{r.samples}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
