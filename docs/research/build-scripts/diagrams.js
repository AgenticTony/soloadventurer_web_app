const fs = require('fs')
const path = require('path')

const DIR = '/Users/anthonyforan/Desktop/SoloAdventurerWeb/docs/research'
const DG = DIR + '/diagrams'
const BUILD = DIR + '/build'
fs.mkdirSync(DG, { recursive: true })

const INK = '#1f2933',
  BLUE = '#2b6cb0',
  ORANGE = '#c05621',
  GREEN = '#2f855a',
  GRAY = '#7b8794',
  PURPLE = '#6b46c1'

// ---------- SVG helpers ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const svgEl = (w, h, body) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="Helvetica, Arial, sans-serif">\n${body}\n</svg>\n`
const rect = (x, y, w, h, o = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx ?? 8}" fill="${o.fill || '#fff'}" stroke="${o.stroke || INK}" stroke-width="${o.sw ?? 1.6}"/>`
const text = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-size="${o.fs ?? 15}" fill="${o.fill || INK}" text-anchor="${o.ta ?? 'middle'}" font-weight="${o.fw ?? 'normal'}" ${o.rot ? `transform="rotate(${o.rot} ${x} ${y})"` : ''}>${esc(s)}</text>`
const line = (x1, y1, x2, y2, o = {}) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.stroke || INK}" stroke-width="${o.sw ?? 1.6}" stroke-dasharray="${o.dash || ''}"/>`
const poly = (pts, o = {}) =>
  `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="${o.stroke || INK}" stroke-width="${o.sw ?? 2}" stroke-dasharray="${o.dash || ''}"/>`
const polyg = (pts, o = {}) =>
  `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${o.fill || 'none'}" stroke="${o.stroke || 'none'}" stroke-width="${o.sw ?? 1}"/>`
const circle = (cx, cy, r, o = {}) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${o.fill || '#fff'}" stroke="${o.stroke || INK}" stroke-width="${o.sw ?? 1.6}"/>`
const marker = () =>
  `<defs><marker id="ah" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,3 L0,6 Z" fill="${INK}"/></marker></defs>`
const arrow = (x1, y1, x2, y2, o = {}) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.stroke || INK}" stroke-width="${o.sw ?? 1.8}" marker-end="url(#ah)" stroke-dasharray="${o.dash || ''}"/>`

// ---------- 01 Hook loop ----------
function hookLoop() {
  const w = 720,
    h = 440
  let b = marker()
  const box = (x, y, t, sub) =>
    rect(x, y, 200, 70, { fill: '#f7fafc', rx: 10 }) +
    text(x + 100, y + 30, t, { fs: 18, fw: 'bold' }) +
    text(x + 100, y + 52, sub, { fs: 12, fill: GRAY })
  const T = [60, 60],
    A = [460, 60],
    R = [460, 300],
    I = [60, 300]
  b += box(T[0], T[1], 'TRIGGER', 'internal feeling / external ping')
  b += box(A[0], A[1], 'ACTION', 'simplest behaviour (B = MAP)')
  b += box(R[0], R[1], 'VARIABLE REWARD', 'tribe · hunt · self')
  b += box(I[0], I[1], 'INVESTMENT', 'loads the next trigger')
  b += arrow(T[0] + 200, T[1] + 35, A[0], A[1] + 35)
  b += arrow(A[0] + 100, A[1] + 70, R[0] + 100, R[1])
  b += arrow(R[0], R[1] + 35, I[0] + 200, I[1] + 35)
  b += arrow(I[0] + 100, I[1], T[0] + 100, T[1] + 70)
  b += text(360, 226, 'THE HOOK MODEL', { fs: 20, fw: 'bold' })
  b += text(360, 250, 'Eyal, 2014', { fs: 13, fill: GRAY })
  return svgEl(w, h, b)
}

// ---------- 02 Network-effect curves ----------
function netCurves() {
  const w = 720,
    h = 460,
    ox = 70,
    oy = 400,
    plotW = 560,
    plotH = 330,
    xmax = 6,
    ymax = 70
  const X = n => ox + (n / xmax) * plotW
  const Y = v => oy - (v / ymax) * plotH
  let b = marker()
  b += line(ox, oy, ox + plotW, oy)
  b += line(ox, oy, ox, oy - plotH)
  b += text(ox + plotW / 2, oy + 38, 'n  (users / nodes)', {
    fs: 14,
    fill: GRAY,
  })
  b += text(24, oy - plotH / 2, 'Value', { fs: 14, fill: GRAY, rot: -90 })
  for (let n = 0; n <= 6; n++) {
    b += line(X(n), oy, X(n), oy + 5)
    b += text(X(n), oy + 20, String(n), { fs: 12, fill: GRAY })
  }
  const lin = [],
    met = [],
    reed = [],
    sig = []
  for (let n = 0; n <= 6; n += 0.5) {
    lin.push([X(n), Y(n)])
    met.push([X(n), Y(n * n)])
    reed.push([X(n), Y(Math.pow(2, n))])
  }
  for (let n = 0; n <= 6; n += 0.25) {
    const s = 62 / (1 + Math.exp(-(n - 3) * 1.2))
    sig.push([X(n), Y(s)])
  }
  b += poly(lin, { stroke: GRAY, sw: 2, dash: '5,4' })
  b += poly(met, { stroke: BLUE, sw: 2.6 })
  b += poly(reed, { stroke: ORANGE, sw: 2.6 })
  b += poly(sig, { stroke: GREEN, sw: 2.6 })
  b += text(X(6) + 8, Y(64) + 4, '2^n  Reed', {
    fs: 13,
    fill: ORANGE,
    ta: 'start',
  })
  b += text(X(6) + 8, Y(40) + 4, 'n^2  Metcalfe', {
    fs: 13,
    fill: BLUE,
    ta: 'start',
  })
  b += text(X(6) + 8, Y(22) + 4, 'S-curve', {
    fs: 13,
    fill: GREEN,
    ta: 'start',
  })
  b += text(X(6) + 8, Y(6) + 18, 'n  linear', {
    fs: 13,
    fill: GRAY,
    ta: 'start',
  })
  b += text(w / 2, 28, 'Network-effect value curves', { fs: 18, fw: 'bold' })
  return svgEl(w, h, b)
}

// ---------- 03 Recommendation pipeline ----------
function pipeline() {
  const w = 760,
    h = 400
  let b = marker()
  const stages = [
    ['Candidate gen', '~10^6'],
    ['Retrieval', '~10^3'],
    ['Ranking', '~10^2'],
    ['Re-ranking', '~10^1'],
    ['Serve', '~10^1'],
  ]
  const x0 = 40,
    gap = 10,
    bw = 130,
    row1y = 70
  for (let i = 0; i < 5; i++) {
    const hh = 96 - i * 12,
      x = x0 + i * (bw + gap),
      y = row1y + (96 - hh) / 2
    b += rect(x, y, bw, hh, { fill: '#eaf2fb', rx: 8 })
    b += text(x + bw / 2, y + hh / 2 - 4, stages[i][0], { fs: 14, fw: 'bold' })
    b += text(x + bw / 2, y + hh / 2 + 16, stages[i][1], {
      fs: 12,
      fill: GRAY,
    })
    if (i < 4) b += arrow(x + bw, y + hh / 2, x + bw + gap, y + hh / 2)
  }
  const last = x0 + 4 * (bw + gap),
    trainX = x0
  b += arrow(last + bw / 2, row1y + 96, last + bw / 2, row1y + 150)
  b += rect(last, row1y + 150, bw, 70, { fill: '#f0f4f8', rx: 8 })
  b += text(last + bw / 2, row1y + 180, 'Log', { fs: 14, fw: 'bold' })
  b += text(last + bw / 2, row1y + 200, 'implicit + explicit', {
    fs: 11,
    fill: GRAY,
  })
  b += arrow(last, row1y + 185, trainX + bw, row1y + 185)
  b += rect(trainX, row1y + 150, bw, 70, { fill: '#f0f4f8', rx: 8 })
  b += text(trainX + bw / 2, row1y + 180, 'Train', { fs: 14, fw: 'bold' })
  b += text(trainX + bw / 2, row1y + 200, 'retrain models', {
    fs: 11,
    fill: GRAY,
  })
  b += `<path d="M${trainX + bw / 2} ${row1y + 220} C ${trainX + bw / 2} ${row1y + 300}, ${x0 + bw / 2} ${row1y + 300}, ${x0 + bw / 2} ${row1y + 96}" fill="none" stroke="${PURPLE}" stroke-width="2" stroke-dasharray="6,4" marker-end="url(#ah)"/>`
  b += text(w / 2, row1y + 300 + 22, 'Feedback loop — signals improve the next candidate set', {
    fs: 12,
    fill: PURPLE,
  })
  b += text(w / 2, 30, 'The recommendation pipeline', { fs: 18, fw: 'bold' })
  return svgEl(w, h, b)
}

// ---------- 04 AI-native platform architecture ----------
function architecture() {
  const w = 720,
    h = 480
  let b = ''
  const layers = [
    ['Participants', 'Humans  +  AI agents (as users, creators, moderators)', '#eaf2fb'],
    ['Interface', 'conversational · voice · ambient · feed', '#f0f4f8'],
    ['Intelligence', 'LLMs · planning · agents · MCP / tool use', '#eaf2fb'],
    ['Memory & retrieval', 'RAG · vector DB · knowledge graph · long-term memory', '#f0f4f8'],
    ['Graphs', 'social · interest · agent-to-agent', '#eaf2fb'],
    ['Economics', 'attention  ->  agent-mediated value', '#f0f4f8'],
  ]
  const x = 80,
    lw = 560,
    lh = 56,
    gap = 12,
    y0 = 40
  for (let i = 0; i < layers.length; i++) {
    const y = y0 + i * (lh + gap)
    b += rect(x, y, lw, lh, { fill: layers[i][2], rx: 8 })
    b += text(x + 18, y + 24, layers[i][0], {
      fs: 16,
      fw: 'bold',
      ta: 'start',
    })
    b += text(x + 18, y + 44, layers[i][1], {
      fs: 13,
      fill: GRAY,
      ta: 'start',
    })
    if (i < layers.length - 1) b += arrow(x + lw / 2, y + lh, x + lw / 2, y + lh + gap, { sw: 1.4 })
  }
  b += text(44, y0 + (layers.length * (lh + gap)) / 2, 'signals up', {
    fs: 12,
    fill: GRAY,
    rot: -90,
  })
  b += text(w - 36, y0 + (layers.length * (lh + gap)) / 2, 'actions down', {
    fs: 12,
    fill: GRAY,
    rot: 90,
  })
  return svgEl(w, h, b)
}

// ---------- 05 Agent-to-agent interaction graph ----------
function agentGraph() {
  const w = 720,
    h = 460
  let b = marker()
  const HA = [130, 110],
    HB = [590, 110],
    aA = [130, 320],
    aB = [590, 320],
    PA = [360, 110]
  const node = (p, t, sub, fill) =>
    circle(p[0], p[1], 46, { fill }) +
    text(p[0], p[1] - 2, t, { fs: 13, fw: 'bold' }) +
    text(p[0], p[1] + 17, sub, { fs: 10, fill: GRAY })
  b += node(HA, 'Human A', '', '#fdebc8')
  b += node(HB, 'Human B', '', '#fdebc8')
  b += node(aA, 'Agent A', 'personal AI', '#dfeaf5')
  b += node(aB, 'Agent B', 'personal AI', '#dfeaf5')
  b += node(PA, 'Platform', 'agents', '#e9d8f5')
  b += line(HA[0], HA[1] + 46, aA[0], aA[1] - 46, { sw: 1.6 })
  b += line(HB[0], HB[1] + 46, aB[0], aB[1] - 46, { sw: 1.6 })
  b += text(HA[0] - 40, (HA[1] + aA[1]) / 2, 'delegates', {
    fs: 11,
    fill: GRAY,
  })
  b += line(aA[0] + 46, aA[1], aB[0] - 46, aB[1], { stroke: ORANGE, sw: 2.2 })
  b += text(360, aA[1] - 14, 'agent-to-agent: negotiate · transact · schedule', {
    fs: 12,
    fill: ORANGE,
    fw: 'bold',
  })
  b += line(aA[0] + 32, aA[1] - 32, PA[0] - 32, PA[1] + 32, {
    sw: 1.4,
    stroke: GRAY,
    dash: '4,3',
  })
  b += line(aB[0] - 32, aB[1] - 32, PA[0] + 32, PA[1] + 32, {
    sw: 1.4,
    stroke: GRAY,
    dash: '4,3',
  })
  b += text(w / 2, h - 22, 'A new social layer forms below human interaction', {
    fs: 13,
  })
  return svgEl(w, h, b)
}

// ---------- 06 Founder scoring radar ----------
function radar() {
  const dims = [
    'Virality',
    'Retention',
    'Daily use',
    'Habit',
    'Network fx',
    'Monetization',
    'Switching cost',
    'Defensibility',
    'Community',
    'AI leverage',
    'Sustainability',
  ]
  const scores = [2, 3, 2, 2, 1, 2, 1, 2, 3, 3, 2]
  const w = 660,
    h = 660,
    cx = 330,
    cy = 340,
    R = 210,
    N = dims.length
  const pt = (level, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / N
    const r = (R * level) / 3
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)]
  }
  let b = ''
  for (let lv = 1; lv <= 3; lv++) {
    const pts = []
    for (let i = 0; i < N; i++) pts.push(pt(lv, i))
    b += poly(pts, { stroke: '#cbd2d9', sw: 1 })
  }
  for (let i = 0; i < N; i++) {
    const [ex, ey] = pt(3, i)
    b += line(cx, cy, ex, ey, { stroke: '#cbd2d9', sw: 1 })
    const [lx, ly] = pt(3.45, i)
    b += text(lx, ly, dims[i], { fs: 13 })
  }
  const sp = scores.map((s, i) => pt(s, i))
  b += polyg(sp, { fill: 'rgba(43,108,176,0.22)', stroke: BLUE, sw: 2.4 })
  for (const [x, y] of sp) b += circle(x, y, 4, { fill: BLUE, stroke: BLUE })
  b += text(cx, 28, 'Founder scorecard — example startup', {
    fs: 18,
    fw: 'bold',
  })
  b += text(
    cx,
    52,
    '11 dimensions · 0–3 each · polygon = a hypothetical AI-native learning community',
    { fs: 11, fill: GRAY }
  )
  return svgEl(w, h, b)
}

// ---------- 07 Platform lifecycle (enshittification) ----------
function lifecycle() {
  const w = 760,
    h = 420,
    ox = 70,
    oy = 360,
    plotW = 640,
    plotH = 290
  const X = t => ox + t * plotW,
    Y = v => oy - (v / 100) * plotH
  let b = marker()
  b += line(ox, oy, ox + plotW, oy)
  b += line(ox, oy, ox, oy - plotH)
  b += text(ox + plotW / 2, oy + 40, 'time', { fs: 13, fill: GRAY })
  b += text(24, oy - plotH / 2, 'value / capture', {
    fs: 13,
    fill: GRAY,
    rot: -90,
  })
  const user = [],
    ad = [],
    margin = []
  for (let t = 0; t <= 1; t += 0.02) {
    user.push([X(t), Y(t < 0.45 ? 80 - 10 * t : Math.max(15, 80 - 175 * (t - 0.45)))])
    ad.push([X(t), Y(Math.min(85, t * 125) * (t < 0.75 ? 1 : Math.max(0.2, 1 - 1.6 * (t - 0.75))))])
    margin.push([X(t), Y(Math.max(0, (t - 0.3) * 140))])
  }
  b += poly(user, { stroke: BLUE, sw: 2.6 })
  b += poly(ad, { stroke: ORANGE, sw: 2.6 })
  b += poly(margin, { stroke: GREEN, sw: 2.6 })
  const phases = [
    ['Subsidize users', 0.12],
    ['Attract advertisers', 0.4],
    ['Extract margin', 0.66],
    ['Decline', 0.9],
  ]
  for (const [lab, t] of phases) {
    b += line(X(t), oy, X(t), oy - plotH, {
      stroke: '#cbd2d9',
      sw: 1,
      dash: '3,3',
    })
    b += text(X(t), oy + 20, lab, { fs: 11, fill: GRAY })
  }
  b += text(ox + plotW - 165, 44, '— User value', {
    fs: 12,
    fill: BLUE,
    ta: 'start',
  })
  b += text(ox + plotW - 165, 62, '— Advertiser value', {
    fs: 12,
    fill: ORANGE,
    ta: 'start',
  })
  b += text(ox + plotW - 165, 80, '— Platform margin', {
    fs: 12,
    fill: GREEN,
    ta: 'start',
  })
  b += text(w / 2, 24, "Platform lifecycle (Doctorow's enshittification)", {
    fs: 17,
    fw: 'bold',
  })
  return svgEl(w, h, b)
}

// ---------- write SVGs ----------
const svgs = {
  '01-hook-loop.svg': hookLoop(),
  '02-network-effect-curves.svg': netCurves(),
  '03-recommendation-pipeline.svg': pipeline(),
  '04-ai-native-architecture.svg': architecture(),
  '05-agent-to-agent-graph.svg': agentGraph(),
  '06-founder-scoring-radar.svg': radar(),
  '07-platform-lifecycle.svg': lifecycle(),
}
for (const [name, content] of Object.entries(svgs)) {
  fs.writeFileSync(path.join(DG, name), content)
}
console.log('Wrote', Object.keys(svgs).length, 'SVGs to', DG)

// ---------- edit build-copy markdown ----------
const img = (file, caption, width) => `![${caption}](../diagrams/${file}){width=${width}}`

function replaceOnlyFence(file, md) {
  const p = path.join(BUILD, file)
  let t = fs.readFileSync(p, 'utf8')
  const count = (t.match(/```[\s\S]*?```/g) || []).length
  if (count === 0) {
    console.log('WARN no fence:', file)
    return
  }
  t = t.replace(/```[\s\S]*?```/, md.trim())
  fs.writeFileSync(p, t)
  console.log('replaced fence -> image:', file)
}
function insertAfterHeading(file, re, md) {
  const p = path.join(BUILD, file)
  let t = fs.readFileSync(p, 'utf8')
  if (!re.test(t)) {
    console.log('WARN heading not found:', file, re)
    return
  }
  t = t.replace(re, m => m + '\n\n' + md.trim())
  fs.writeFileSync(p, t)
  console.log('inserted after heading:', file)
}

replaceOnlyFence(
  'part-01-the-psychology-of-daily-use.md',
  img(
    '01-hook-loop.svg',
    'Figure 1.1 — The Hook Model (Eyal, 2014): Trigger -> Action -> Variable Reward -> Investment, looping.',
    '5.6in'
  )
)
replaceOnlyFence(
  'part-05-network-effects.md',
  img(
    '02-network-effect-curves.svg',
    'Figure 5.1 — Network-effect value curves: linear, Metcalfe (quadratic), Reed (exponential), and the adoption S-curve.',
    '5.8in'
  )
)
replaceOnlyFence(
  'part-07-algorithms-and-the-ai-stack-from-feeds-to-agents.md',
  img(
    '03-recommendation-pipeline.svg',
    'Figure 7.1 — The recommendation pipeline as a narrowing funnel with a retraining feedback loop.',
    '6in'
  )
)
replaceOnlyFence(
  'part-08-ai-changes-everything.md',
  img(
    '04-ai-native-architecture.svg',
    'Figure 8.1 — Layered architecture of an AI-native platform.',
    '5.2in'
  )
)
replaceOnlyFence(
  'part-13-the-founder-s-framework.md',
  img(
    '06-founder-scoring-radar.svg',
    'Figure 13.1 — Founder scorecard: an example startup plotted across the 11 evaluation dimensions.',
    '4in'
  )
)
insertAfterHeading(
  'part-08-ai-changes-everything.md',
  /^##\s+8\.7\b.*$/m,
  img(
    '05-agent-to-agent-graph.svg',
    'Figure 8.2 — Agent-to-agent interaction: a new social layer below human interaction.',
    '5.8in'
  )
)
insertAfterHeading(
  'part-06-the-economics-of-platforms.md',
  /^##\s+6\.13\b.*$/m,
  img(
    '07-platform-lifecycle.svg',
    "Figure 6.1 — Platform lifecycle (Doctorow's enshittification): user value, advertiser value, and platform margin diverge over time.",
    '6in'
  )
)

console.log('done')
