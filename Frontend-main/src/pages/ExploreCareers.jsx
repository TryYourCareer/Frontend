import { useEffect, useMemo, useState, useRef } from "react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { ArrowLeft, Search, X } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";
const API_TIMEOUT_MS = 3000;
const CSV_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

const cardColors = [
  "from-[#e9f6ff] via-[#dff0ff] to-[#d8e9ff]",
  "from-[#efeafe] via-[#e6dcff] to-[#ddd2ff]",
  "from-[#e8f9f1] via-[#dcf4ea] to-[#d2ede4]",
  "from-[#fff2e5] via-[#ffe9d8] to-[#ffdfcb]",
  "from-[#ffeff4] via-[#ffe3ec] to-[#ffd8e4]",
  "from-[#f2f7e6] via-[#e8f2d6] to-[#deebc6]",
  "from-[#e7f7f7] via-[#d9efef] to-[#cde6e6]",
  "from-[#f9f0ff] via-[#f0e3ff] to-[#e8d6ff]",
  "from-[#edf5ff] via-[#e3efff] to-[#d9e8ff]",
  "from-[#fff6e8] via-[#ffeed8] to-[#ffe4c6]",
];

function sortByClusterNumber(a, b) {
  const aNum = Number(String(a.cluster_id || a.id).replace(/\D/g, ""));
  const bNum = Number(String(b.cluster_id || b.id).replace(/\D/g, ""));
  return aNum - bNum;
}

function parseClusterNumber(value) {
  const match = String(value || "").trim().toLowerCase().match(/^cluster\s*(\d+)$/);
  return match ? Number(match[1]) : null;
}

function parseNumberFromText(value) {
  const match = String(value || "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function average(values) {
  if (!values.length) return null;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

function collectTopItems(items, limit = 3) {
  const map = items.reduce((acc, item) => {
    if (!item) return acc;
    const key = String(item).trim();
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}

function formatLpa(value) {
  if (!value && value !== 0) return "NA";
  return `${Number(value).toFixed(1)} LPA`;
}

export default function ExploreCareers({ onBack, initialSearch = "", selectedClusterId, onClusterSelected }) {
  const [clusters, setClusters] = useState([]);
  const [careers, setCareers] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasAutoSelected = useRef(false);

  useEffect(() => {
    setGlobalSearch(initialSearch || "");
  }, [initialSearch]);

  useEffect(() => {
    let isMounted = true;

    function normalizeCluster(row) {
      return {
        id: row.cluster_id || row.id || "",
        name: row.cluster_name || row.name || "",
      };
    }

    function normalizeCareer(row) {
      return {
        id: Number(row.id || row["No."] || 0),
        clusterId: row.cluster || row.Cluster || "",
        name: row.title || row["Career Name"] || "",
        summary: row.one_line_summary || row["One-Line Summary"] || "",
        whatTheyDo: row.what_they_do || row["What They Do"] || "",
        industries: row.industries || row.Industries || "",
        demand: row.demand_level || row["Demand Level"] || "",
        entrySalary: row.entry_salary || row["Entry Salary (LPA)"] || "",
        midSalary: row.mid_salary || row["Mid Salary (LPA)"] || "",
        seniorSalary: row.senior_salary || row["Senior Salary (LPA)"] || "",
        topEarnings: row.top_earnings || row["Top Earnings (LPA)"] || "",
        growthRate: row.growth_rate || row["Growth Rate"] || "",
        aiImpact: row.ai_impact || row["AI Impact"] || "",
        coreSkills: row.core_skills || row["Core Skills"] || "",
        keyCertifications: row.key_certifications || row["Key Certifications"] || "",
        degreeRequired: row.degree_required || row["Degree Required"] || "",
        workLifeBalance: row.work_life_balance || row["Work-Life Balance"] || "",
        stressLevel: row.stress_level || row["Stress Level"] || "",
        entryPath: row.entry_path || row["Entry Path"] || "",
        whoShouldChoose: row.who_should_choose || row["Who Should Choose"] || "",
        whoShouldAvoid: row.who_should_avoid || row["Who Should Avoid"] || "",
        verdict: row.verdict || row.Verdict || "",
        moneyScore: row.money_score || row["Money Score"] || "",
        growthScore: row.growth_score || row["Growth Score"] || "",
        stabilityScore: row.stability_score || row["Stability Score"] || "",
      };
    }

    async function loadDatabaseData() {
      setLoading(true);
      setError("");

      try {
        let clustersResult = [];
        let careersResult = [];

        try {
          const [clustersResponse, careersResponse] = await Promise.all([
            fetchWithTimeout(`${API_BASE_URL}/clusters`, API_TIMEOUT_MS),
            fetchWithTimeout(`${API_BASE_URL}/careers/full`, API_TIMEOUT_MS),
          ]);

          if (!clustersResponse.ok || !careersResponse.ok) {
            throw new Error("Could not load database data");
          }

          [clustersResult, careersResult] = await Promise.all([
            clustersResponse.json(),
            careersResponse.json(),
          ]);
        } catch {
          const [clustersCsv, careersCsv] = await Promise.all([
            fetchWithTimeout("/data/ClusterSummary.csv", CSV_TIMEOUT_MS).then((res) => {
              if (!res.ok) {
                throw new Error("Could not load ClusterSummary.csv");
              }
              return res.text();
            }),
            fetchWithTimeout("/data/Careers.csv", CSV_TIMEOUT_MS).then((res) => {
              if (!res.ok) {
                throw new Error("Could not load Careers.csv");
              }
              return res.text();
            }),
          ]);

          const parsedClusters = Papa.parse(clustersCsv, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
          });
          const parsedCareers = Papa.parse(careersCsv, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
          });

          if (parsedClusters.errors.length > 0) {
            throw new Error(parsedClusters.errors[0].message || "Could not parse cluster data");
          }

          if (parsedCareers.errors.length > 0) {
            throw new Error(parsedCareers.errors[0].message || "Could not parse career data");
          }

          clustersResult = parsedClusters.data || [];
          careersResult = parsedCareers.data || [];
        }

        if (!isMounted) {
          return;
        }

        const parsedClusters = (clustersResult || [])
          .map(normalizeCluster)
          .filter((cluster) => cluster.id && cluster.name)
          .sort(sortByClusterNumber);

        const parsedCareers = (careersResult || [])
          .map(normalizeCareer)
          .filter((career) => career.id > 0 && career.clusterId && career.name)
          .sort((a, b) => a.id - b.id);

        setClusters(parsedClusters);
        setCareers(parsedCareers);
      } catch {
        if (!isMounted) {
          return;
        }
        setError("Could not load cluster/career data.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDatabaseData();
    return () => {
      isMounted = false;
    };
  }, []);

  const groupedClusters = useMemo(() => {
    const countMap = careers.reduce((acc, career) => {
      acc[career.clusterId] = (acc[career.clusterId] || 0) + 1;
      return acc;
    }, {});

    const query = globalSearch.trim().toLowerCase();

    return clusters
      .map((cluster) => {
        const clusterCareers = careers.filter((career) => career.clusterId === cluster.id);
        const demandMix = collectTopItems(clusterCareers.map((career) => career.demand), 1)[0] || "NA";
        const topIndustries = collectTopItems(
          clusterCareers.flatMap((career) => String(career.industries || "").split(",")),
          3
        );
        const topSkills = collectTopItems(
          clusterCareers.flatMap((career) => String(career.coreSkills || "").split(",")),
          4
        );
        const degreePaths = collectTopItems(clusterCareers.map((career) => career.degreeRequired), 3);
        const avgEntry = average(
          clusterCareers
            .map((career) => parseNumberFromText(career.entrySalary))
            .filter((value) => value !== null)
        );
        const avgGrowth = average(
          clusterCareers
            .map((career) => parseNumberFromText(career.growthRate))
            .filter((value) => value !== null)
        );

        return {
          ...cluster,
          count: countMap[cluster.id] || 0,
          careers: clusterCareers,
          details: {
            demandMix,
            topIndustries,
            topSkills,
            degreePaths,
            avgEntry,
            avgGrowth,
          },
        };
      })
      .filter((cluster) => {
        if (!query) {
          return true;
        }

        const queryClusterNumber = parseClusterNumber(query);
        const clusterNumber = Number(String(cluster.id || "").replace(/\D/g, ""));

        if (queryClusterNumber !== null) {
          return clusterNumber === queryClusterNumber;
        }

        const inClusterId = String(cluster.id || "").toLowerCase().includes(query);
        const inClusterName = cluster.name.toLowerCase().includes(query);
        const inIndustries = cluster.details.topIndustries.some((industry) =>
          industry.toLowerCase().includes(query)
        );
        const inCareers = cluster.careers.some((career) =>
          career.name.toLowerCase().includes(query)
        );

        return inClusterId || inClusterName || inIndustries || inCareers;
      });
  }, [clusters, careers, globalSearch]);

  const selectedCareers = useMemo(() => {
    if (!selectedCluster) {
      return [];
    }

    return selectedCluster.careers;
  }, [selectedCluster]);

  useEffect(() => {
    if (!hasAutoSelected.current && selectedClusterId && !loading && clusters.length > 0) {
      const clusterNum = selectedClusterId.toLowerCase().replace(/[^\d]/g, "");
      const matching = clusters.find((c) =>
        String(c.id).toLowerCase().replace(/[^\d]/g, "") === clusterNum
      );
      if (matching) {
        const clusterCareers = careers.filter((c) => c.clusterId === matching.id);
        if (clusterCareers.length > 0) {
          // Reconstruct cluster details
          const demandMix = collectTopItems(clusterCareers.map((c) => c.demand), 1)[0] || "NA";
          const topIndustries = collectTopItems(
            clusterCareers.flatMap((c) => String(c.industries || "").split(",")),
            3
          );
          const topSkills = collectTopItems(
            clusterCareers.flatMap((c) => String(c.coreSkills || "").split(",")),
            4
          );
          const degreePaths = collectTopItems(clusterCareers.map((c) => c.degreeRequired), 3);
          const avgEntry = average(
            clusterCareers
              .map((c) => parseNumberFromText(c.entrySalary))
              .filter((v) => v !== null)
          );
          const avgGrowth = average(
            clusterCareers.map((c) => parseNumberFromText(c.growthRate)).filter((v) => v !== null)
          );

          hasAutoSelected.current = true;
          setSelectedCluster({
            ...matching,
            count: clusterCareers.length,
            careers: clusterCareers,
            details: {
              demandMix,
              topIndustries,
              topSkills,
              degreePaths,
              avgEntry,
              avgGrowth,
            },
          });
          onClusterSelected?.();
        }
      }
    }
  }, [selectedClusterId, loading, clusters, careers, onClusterSelected]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4f9ff_0%,#f9fbff_55%,#fefaf6_100%)]">
      <header className="border-b border-[#d7e6fb] bg-[#eff6ff]/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#bdd2f3] bg-white px-4 py-2 text-sm font-semibold text-[#28569e] transition hover:bg-[#edf4ff]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
          <h1 className="text-4xl font-black text-[#173b72]">Explore Careers</h1>
          <p className="mt-2 text-[#47689f]">
            Browse 10 career clusters and discover the right path with real career data.
          </p>

          <div className="mt-5 max-w-lg">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7091c3]" />
              <input
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                placeholder="Search cluster or career name"
                className="w-full rounded-xl border border-[#c6d9f7] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1f497f] placeholder:text-[#88a5d0] focus:border-[#84aee8] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </header>

      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading && <p className="text-sm font-semibold text-[#5f7ead]">Loading career data...</p>}
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          {!loading && !error && (
            <div className="grid gap-6 xl:grid-cols-[1.5fr_0.95fr]">
              <div className="space-y-6">
                <div className="rounded-[32px] border border-[#dfe7f7] bg-white/90 p-6 shadow-[0_25px_60px_rgba(64,107,179,0.12)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4e72a3]">Explore Careers</p>
                      <h2 className="mt-3 text-3xl font-black text-[#152d5b]">Choose a cluster and discover the best-fit roles</h2>
                      <p className="mt-3 max-w-2xl text-sm text-[#556a8f]">Each cluster contains real career profiles, salary signals, and skills that matter most in today’s job market.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-3xl bg-[#eef4ff] px-3 py-4">
                        <p className="text-2xl font-black text-[#2c4d8a]">{clusters.length}</p>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[#5f7ca5]">Clusters</p>
                      </div>
                      <div className="rounded-3xl bg-[#eefbf4] px-3 py-4">
                        <p className="text-2xl font-black text-[#2e6f4b]">{careers.length}</p>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[#5f7ca5]">Careers</p>
                      </div>
                      <div className="rounded-3xl bg-[#fff5e9] px-3 py-4">
                        <p className="text-2xl font-black text-[#a86a1f]">{Math.max(1, groupedClusters.length)}</p>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[#5f7ca5]">Matches</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedClusters.map((cluster, index) => (
                    <motion.button
                      key={cluster.id}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedCluster(cluster);
                        onClusterSelected?.();
                      }}
                      className={`group overflow-hidden rounded-[28px] border border-transparent bg-gradient-to-br ${
                        cardColors[index % cardColors.length]
                      } p-5 text-left text-[#20395f] shadow-[0_12px_30px_rgba(91,128,188,0.18)] transition hover:border-white hover:shadow-[0_18px_48px_rgba(91,128,188,0.2)]`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4b6d8a]">
                        {cluster.id}
                      </p>
                      <h3 className="mt-3 text-xl font-black leading-tight text-[#16355f]">{cluster.name}</h3>
                      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3b5f88]">
                        <span>{cluster.count} careers</span>
                        <span>•</span>
                        <span>Top Demand: {cluster.details.demandMix}</span>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-[#374b74]">
                        <p>Avg Entry: {formatLpa(cluster.details.avgEntry || 0)}</p>
                        <p>Avg Growth: {cluster.details.avgGrowth ? `${cluster.details.avgGrowth.toFixed(1)}%` : "NA"}</p>
                        <p>Industries: {cluster.details.topIndustries.slice(0, 3).join(" • ") || "NA"}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <aside className="space-y-4 lg:space-y-6">
                <div className="lg:sticky lg:top-6 lg:space-y-4">
                  {selectedCluster ? (
                    <div className="space-y-4">
                      <div className="rounded-[32px] border border-[#dfe7f7] bg-white/95 p-6 shadow-[0_18px_40px_rgba(80,113,171,0.1)]">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4c6ea3]">Selected cluster</p>
                            <h3 className="mt-3 text-2xl font-black text-[#17355d]">{selectedCluster.name}</h3>
                            <p className="mt-2 text-sm text-[#4f6d93]">Explore the {selectedCluster.count} most relevant careers and role details for this cluster.</p>
                          </div>
                          <button
                            onClick={() => setSelectedCluster(null)}
                            className="inline-flex items-center justify-center rounded-2xl border border-[#c8d6ef] bg-[#f8fbff] px-4 py-2 text-sm font-semibold text-[#3a5f92] transition hover:bg-[#eef3ff]"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Clear selection
                          </button>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-3xl bg-[#eef4ff] p-4 text-sm text-[#2f5180]">
                            <p className="font-semibold">Cluster size</p>
                            <p className="mt-2 text-3xl font-black">{selectedCluster.count}</p>
                          </div>
                          <div className="rounded-3xl bg-[#eefbf4] p-4 text-sm text-[#2f5f4f]">
                            <p className="font-semibold">Demand profile</p>
                            <p className="mt-2 text-lg font-black text-[#2a5d45]">{selectedCluster.details.demandMix}</p>
                          </div>
                          <div className="rounded-3xl bg-[#fff5e9] p-4 text-sm text-[#7b5a2d]">
                            <p className="font-semibold">Average entry salary</p>
                            <p className="mt-2 text-lg font-black text-[#9a6a2f]">{formatLpa(selectedCluster.details.avgEntry)}</p>
                          </div>
                          <div className="rounded-3xl bg-[#f9f0ff] p-4 text-sm text-[#5f467d]">
                            <p className="font-semibold">Avg growth</p>
                            <p className="mt-2 text-lg font-black text-[#593d8f]">{selectedCluster.details.avgGrowth ? `${selectedCluster.details.avgGrowth.toFixed(1)}%` : "NA"}</p>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-3xl bg-[#f4f7ff] p-4 text-sm text-[#3b5b84]">
                            <p className="font-semibold">Top industries</p>
                            <p className="mt-2 text-sm text-[#4c648b]">{selectedCluster.details.topIndustries.join(" • ") || "NA"}</p>
                          </div>
                          <div className="rounded-3xl bg-[#f4f7ff] p-4 text-sm text-[#3b5b84]">
                            <p className="font-semibold">Top skills</p>
                            <p className="mt-2 text-sm text-[#4c648b]">{selectedCluster.details.topSkills.join(" • ") || "NA"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[32px] border border-[#dfe7f7] bg-white/95 p-6 shadow-[0_18px_40px_rgba(80,113,171,0.1)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4c6ea3]">Career detail cards</p>
                        <div className="mt-5 space-y-4">
                          {selectedCareers.map((career) => (
                            <article
                              key={career.id}
                              className="rounded-3xl border border-[#d4e2fa] bg-[#f8fbff] p-4 shadow-sm"
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <h4 className="text-lg font-bold text-[#14366d]">{career.name}</h4>
                                  <p className="mt-2 text-sm text-[#3f6293]">{career.summary}</p>
                                </div>
                                <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-semibold text-[#2c5eab]">#{career.id}</span>
                              </div>

                              <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                                {career.demand && <p className="rounded bg-white/80 px-2 py-1 text-[#355988]">Demand: {career.demand}</p>}
                                {career.entrySalary && <p className="rounded bg-white/80 px-2 py-1 text-[#355988]">Entry: {career.entrySalary}</p>}
                                {career.midSalary && <p className="rounded bg-white/80 px-2 py-1 text-[#355988]">Mid: {career.midSalary}</p>}
                                {career.seniorSalary && <p className="rounded bg-white/80 px-2 py-1 text-[#355988]">Senior: {career.seniorSalary}</p>}
                                {career.topEarnings && <p className="rounded bg-white/80 px-2 py-1 text-[#355988]">Top: {career.topEarnings}</p>}
                                {career.growthRate && <p className="rounded bg-white/80 px-2 py-1 text-[#355988]">Growth: {career.growthRate}</p>}
                              </div>

                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <p className="text-sm text-[#4a6a99]"><span className="font-semibold text-[#2d518d]">Skills:</span> {career.coreSkills}</p>
                                <p className="text-sm text-[#4a6a99]"><span className="font-semibold text-[#2d518d]">Degree:</span> {career.degreeRequired}</p>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-[28px] border border-[#d8e4f5] bg-[#f8fbff] p-6 shadow-[0_18px_40px_rgba(80,113,171,0.1)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4c6ea3]">Need help?</p>
                        <h3 className="mt-3 text-xl font-black text-[#17355d]">How to use this page</h3>
                        <ul className="mt-4 space-y-3 text-sm text-[#4c6080]">
                          <li>• Search for a cluster or career name.</li>
                          <li>• Open any cluster to see the career list.</li>
                          <li>• Use the details panel to compare roles and paths.</li>
                        </ul>
                      </div>
                      <div className="rounded-[28px] border border-[#d9e7f7] bg-white p-6 shadow-[0_18px_40px_rgba(89,129,181,0.08)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4b6e97]">Tips</p>
                        <p className="mt-3 text-sm text-[#3b5480]">If you want to focus quickly, start with the clusters that match your interests above and explore the top careers in each.</p>
                      </div>
                    </>
                  )}
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
