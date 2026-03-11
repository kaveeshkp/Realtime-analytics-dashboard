import { useTheme } from "../hooks/useTheme";

interface ScoreEntry {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: "live" | "final" | "scheduled";
  league: string;
  time?: string;
}

// Static placeholder data — replace with a real sports API integration
const SCORES: ScoreEntry[] = [
  {
    homeTeam: "Lakers",
    awayTeam: "Celtics",
    homeScore: 108,
    awayScore: 104,
    status: "final",
    league: "NBA",
  },
  {
    homeTeam: "Chiefs",
    awayTeam: "Eagles",
    homeScore: 21,
    awayScore: 17,
    status: "live",
    league: "NFL",
    time: "Q3 8:22",
  },
  {
    homeTeam: "Yankees",
    awayTeam: "Red Sox",
    homeScore: 0,
    awayScore: 0,
    status: "scheduled",
    league: "MLB",
    time: "7:05 PM ET",
  },
  {
    homeTeam: "Man City",
    awayTeam: "Arsenal",
    homeScore: 2,
    awayScore: 1,
    status: "final",
    league: "EPL",
  },
  {
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    homeScore: 1,
    awayScore: 1,
    status: "live",
    league: "La Liga",
    time: "67'",
  },
];

const statusStyle: Record<ScoreEntry["status"], string> = {
  live: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  final: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function Sports() {
  const { dark } = useTheme();

  const byLeague = SCORES.reduce<Record<string, ScoreEntry[]>>((acc, s) => {
    (acc[s.league] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <h2 className={`text-xl font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
        Sports Scores
      </h2>

      {Object.entries(byLeague).map(([league, games]) => (
        <section key={league}>
          <h3
            className={`text-sm font-semibold uppercase tracking-widest mb-3 ${
              dark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {league}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {games.map((g, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border transition-colors ${
                  dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      statusStyle[g.status]
                    }`}
                  >
                    {g.status === "live" ? `● LIVE${g.time ? ` — ${g.time}` : ""}` : g.status === "scheduled" ? `⏰ ${g.time}` : "Final"}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{g.homeTeam}</span>
                    <span className="font-bold text-lg tabular-nums">
                      {g.status === "scheduled" ? "—" : g.homeScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{g.awayTeam}</span>
                    <span className="font-bold text-lg tabular-nums">
                      {g.status === "scheduled" ? "—" : g.awayScore}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
