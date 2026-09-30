/**
 * Trade Avata AI Analytics evidence layer.
 *
 * The deterministic layer calculates/structures evidence locally first. A
 * trusted backend may optionally receive the resulting prompt through
 * PUBLIC_TRADE_AVATA_AI_ENDPOINT and return a narrative report. Never put an
 * AI provider secret in this Astro page or in PUBLIC_* variables.
 */

const pct = n => `${Number(n || 0).toFixed(1)}%`;
const money = n => `${n >= 0 ? '+' : '-'}$${Math.abs(Number(n || 0)).toFixed(2)}`;

export function buildAIAnalyticsEvidence({ account, trades = [], monthly = [], strategies = [], sessions = [], weekday = [] }) {
  const wins = trades.filter(t => Number(t[6]) > 0);
  const losses = trades.filter(t => Number(t[6]) < 0);
  const net = trades.reduce((s,t) => s + Number(t[6] || 0), 0);
  const lossTotal = losses.reduce((s,t) => s + Math.abs(Number(t[6] || 0)), 0);
  const winTotal = wins.reduce((s,t) => s + Number(t[6] || 0), 0);
  const winRate = trades.length ? wins.length / trades.length * 100 : 0;
  const avgLoss = losses.length ? lossTotal / losses.length : 0;
  const avgWin = wins.length ? winTotal / wins.length : 0;

  let longestLossStreak = 0, streak = 0;
  for (const t of trades) {
    if (Number(t[6]) < 0) { streak++; longestLossStreak = Math.max(longestLossStreak, streak); }
    else streak = 0;
  }

  const lossBySymbol = {};
  const pnlBySymbol = {};
  for (const t of trades) {
    pnlBySymbol[t[1]] = (pnlBySymbol[t[1]] || 0) + Number(t[6] || 0);
    if (Number(t[6]) < 0) lossBySymbol[t[1]] = (lossBySymbol[t[1]] || 0) + Math.abs(Number(t[6] || 0));
  }
  const largestLossSymbol = Object.entries(lossBySymbol).sort((a,b)=>b[1]-a[1])[0];
  const largestLossSymbolShare = largestLossSymbol && lossTotal ? largestLossSymbol[1] / lossTotal * 100 : 0;

  const positionVolumes = trades.map(t => Number(t[3] || 0));
  const avgVolume = positionVolumes.length ? positionVolumes.reduce((a,b)=>a+b,0)/positionVolumes.length : 0;
  const lossVolumes = losses.map(t=>Number(t[3]||0));
  const avgLossVolume = lossVolumes.length ? lossVolumes.reduce((a,b)=>a+b,0)/lossVolumes.length : 0;

  const findings = [];
  if (account?.drawdownPct >= 8) findings.push({
    level:'CONFIRMED', levelClass:'confirmed', title:'Drawdown is a material part of the current account risk profile',
    detail:`The recorded account reports a maximum drawdown of ${pct(account.drawdownPct)}. Trade Avata should treat this as a primary risk dimension when investigating challenge losses or account instability.`,
    evidence:`Maximum drawdown: ${pct(account.drawdownPct)} · ${money(account.drawdownValue)} peak-to-trough`, drill:'risk'
  });
  if (longestLossStreak >= 4) findings.push({
    level:'STRONG EVIDENCE', levelClass:'evidence', title:'A prolonged losing sequence appears in the recorded trade sample',
    detail:`The sample contains a maximum consecutive losing sequence of ${longestLossStreak} trades. The next step is to inspect position size and exposure before and during the sequence rather than treating the streak alone as a cause.`,
    evidence:`Longest recorded losing streak: ${longestLossStreak} trades`, drill:'trades'
  });
  if (largestLossSymbol && largestLossSymbolShare >= 25) findings.push({
    level:'STRONG EVIDENCE', levelClass:'evidence', title:`${largestLossSymbol[0]} contributes a concentrated share of recorded losses`,
    detail:`Losses in this symbol represent ${pct(largestLossSymbolShare)} of the loss value in the supplied sample. This is a concentration signal, not proof that the instrument itself is the reason for failure.`,
    evidence:`${largestLossSymbol[0]} loss concentration: ${pct(largestLossSymbolShare)} · ${money(-largestLossSymbol[1])}`, drill:'comparisons'
  });
  if (avgLossVolume > avgVolume && avgVolume > 0) findings.push({
    level:'POSSIBLE', levelClass:'possible', title:'Losing trades used larger average position size than the overall sample',
    detail:`The average volume on losing trades is ${avgLossVolume.toFixed(2)} versus ${avgVolume.toFixed(2)} across the recorded sample. This can be a useful risk-management investigation, but volume alone is not equivalent to monetary risk across different instruments.`,
    evidence:`Average volume: ${avgVolume.toFixed(2)} · losing-trade average: ${avgLossVolume.toFixed(2)}`, drill:'risk'
  });
  if (winRate < 50) findings.push({
    level:'CONFIRMED', levelClass:'confirmed', title:'The recorded sample has a sub-50% win rate',
    detail:`${wins.length} of ${trades.length} recorded trades are winners. Win rate must be considered alongside average win, average loss, expectancy and risk per trade; it is not by itself an explanation for account failure.`,
    evidence:`Win rate: ${pct(winRate)} · average win ${money(avgWin)} · average loss ${money(-avgLoss)}`, drill:'trades'
  });
  if (!findings.length) findings.push({
    level:'UNKNOWN', levelClass:'unknown', title:'No high-confidence risk contributor was established from this sample',
    detail:'The available records are not sufficient to establish a specific cause. Connect a real account or upload a larger trade history and, for challenge analysis, provide the applicable evaluation rules.',
    evidence:`${trades.length} trades · ${money(net)} sample P&L`, drill:'trades'
  });

  return {
    accountId: account?.id || null,
    evidence: { tradeCount:trades.length, winRate, netPnl:net, longestLossStreak, largestLossSymbol:largestLossSymbol?.[0] || null, largestLossSymbolShare, avgVolume, avgLossVolume, drawdownPct:account?.drawdownPct || null },
    report: {
      headline: findings[0]?.title || 'AI Analytics investigation ready',
      summary:`Trade Avata reviewed ${trades.length} recorded trades for ${account?.name || 'the selected account'}. The findings below separate established calculations from stronger patterns and hypotheses.`,
      findings,
      nextStep:'Inspect the supporting trades, then compare the same risk dimensions across previous periods or challenge attempts.'
    }
  };
}

export function getAIAnalyticsPrompt(evidence) {
  return `You are Trade Avata AI Analytics. Explain trading-data evidence without inventing facts or diagnosing the trader. Return JSON with report:{headline,summary,nextStep,findings:[{level,levelClass,title,detail,evidence,drill}]}. Allowed levels: CONFIRMED, STRONG EVIDENCE, POSSIBLE, UNKNOWN. Treat the supplied calculations as evidence. Do not predict future performance. Do not claim a challenge failure cause unless applicable challenge rules are supplied. Evidence: ${JSON.stringify(evidence)}`;
}

export async function requestAIAnalytics(prompt) {
  const endpoint = import.meta.env.PUBLIC_TRADE_AVATA_AI_ENDPOINT;
  if (!endpoint) return null;
  const res = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ prompt }) });
  if (!res.ok) throw new Error(`AI endpoint returned ${res.status}`);
  return res.json();
}
