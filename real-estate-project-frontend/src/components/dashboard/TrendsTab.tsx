import { 
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, ThumbsUp } from 'lucide-react';
import { localitySentimentData, localityTrendsData } from '../../assets/mockData';

interface TrendsTabProps {
  currentLocality: string;
}

export default function TrendsTab({
  currentLocality
}: TrendsTabProps) {
  const trendInfo = localityTrendsData[currentLocality] || {
    locality_name: currentLocality,
    trend_score: 75,
    trend_direction: 'flat',
    trend_summary: 'Stable demand metrics matching baseline indexes.',
    quarterly_price_history: [
      { quarter: 'Q2 2025', avg_price_per_sqft: 8000 },
      { quarter: 'Q3 2025', avg_price_per_sqft: 8100 },
      { quarter: 'Q4 2025', avg_price_per_sqft: 8200 },
      { quarter: 'Q1 2026', avg_price_per_sqft: 8420 },
    ]
  };

  // Locality sentiment donut configuration
  const sentimentInfo = localitySentimentData[currentLocality] || {
    sentiment_score: 0.78,
    positive_themes: ["Connectivity", "Amenities", "Construction Quality"],
    negative_themes: ["Traffic", "Construction Delay", "High Price"],
    sentiment_summary: ""
  };
  const sentimentScore = sentimentInfo.sentiment_score;
  const sentimentChartData = [
    { name: 'Positive', value: Math.round(sentimentScore * 100) },
    { name: 'Negative', value: Math.round((1 - sentimentScore) * 60) },
    { name: 'Neutral', value: Math.round((1 - sentimentScore) * 40) }
  ];
  const SENTIMENT_COLORS = ['#10b981', '#ef4444', '#64748b']; // green, red, gray

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-theme-text-light tracking-tight">Market Analytics Center</h2>
        <p className="text-sm text-theme-text-muted mt-0.5">Appreciation histories and social sentiment clouds for active locality: {currentLocality}</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="aceternity-card p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-theme-text-light uppercase tracking-widest font-mono flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-theme-accent" />
              <span>Quarterly Appreciation Index</span>
            </h3>
            <p className="text-xs text-theme-text-muted font-mono mt-1 font-medium">Average price per sqft progression (Q2 2025 - Q1 2026)</p>
          </div>

          <div className="h-56 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendInfo.quarterly_price_history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--theme-accent)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--theme-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" vertical={false} />
                <XAxis dataKey="quarter" stroke="var(--theme-text-muted)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--theme-text-muted)" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ color: 'var(--theme-text)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="avg_price_per_sqft" stroke="var(--theme-accent)" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="p-3 bg-theme-accent-muted border border-theme-accent-border rounded-xl text-xs text-theme-text-muted leading-relaxed font-mono">
            <span className="text-theme-text-light font-bold">Trend Analysis:</span> {trendInfo.trend_summary}
          </div>
        </div>

        <div className="aceternity-card p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-theme-text-light uppercase tracking-widest font-mono flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-theme-accent" />
              <span>Locality Public Sentiment</span>
            </h3>
            <p className="text-xs text-theme-text-muted font-mono mt-1 font-medium">Aggregated public comments themes distribution</p>
          </div>

          <div className="flex items-center justify-between gap-4 p-3 bg-theme-card border border-theme-border rounded-xl">
            <div className="w-32 h-32 relative flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sentimentChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className="text-lg font-black text-theme-text-light">{(sentimentScore * 100).toFixed(0)}%</span>
                <span className="text-[8px] text-theme-text-muted font-mono uppercase tracking-widest mt-1">Positive</span>
              </div>
            </div>

            <div className="flex-1 space-y-2 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-theme-text-muted flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]"></span> Positive
                </span>
                <span className="font-semibold text-theme-text-light font-mono">{(sentimentScore * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-theme-text-muted flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> Negative
                </span>
                <span className="font-semibold text-theme-text-light font-mono">{Math.round((1 - sentimentScore) * 60)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-theme-text-muted flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#64748b]"></span> Neutral
                </span>
                <span className="font-semibold text-theme-text-light font-mono">{Math.round((1 - sentimentScore) * 40)}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold font-mono text-theme-text-muted block mb-1.5">Positive Comment Themes</span>
              <div className="flex flex-wrap gap-1.5">
                {sentimentInfo.positive_themes.map((theme, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs font-mono font-medium">
                    {theme}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold font-mono text-theme-text-muted block mb-1.5">Negative Comment Themes</span>
              <div className="flex flex-wrap gap-1.5">
                {sentimentInfo.negative_themes.map((theme, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-red-950/20 border border-red-900/30 text-red-400 text-xs font-mono font-medium">
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="aceternity-card p-6 rounded-2xl space-y-3">
        <h3 className="text-sm font-bold text-theme-text-light uppercase tracking-widest font-mono">Locality Commentary Summary</h3>
        <p className="text-sm leading-relaxed text-theme-text-muted">
          {sentimentInfo.sentiment_summary || "No sentiment overview compiled for target micro-market."}
        </p>
      </div>
    </div>
  );
}
