const fs = require('fs')
const path = require('path')

const SRC = '/Users/anthonyforan/Desktop/SoloAdventurerWeb/docs/research'
const BUILD = SRC + '/build'
fs.mkdirSync(BUILD, { recursive: true })

// Glyphs Latin Modern lacks -> inline LaTeX math (renders correctly in both PDF and DOCX).
const repl = [
  [/∝/g, '$\\propto$'], // ∝  proportional to
  [/ⁿ/g, '$^{n}$'], // ⁿ  superscript n (Reed's 2ⁿ)
  [/≥/g, '$\\geq$'], // ≥
  [/≤/g, '$\\leq$'], // ≤
  [/\u{1f602}/gu, ':D'], // 😂 face-with-tears-of-joy (only emoji flagged)
]

const files = fs
  .readdirSync(SRC)
  .filter(f => /^part-\d+-.*\.md$/.test(f))
  .sort()

const total = {}
for (const f of files) {
  let t = fs.readFileSync(path.join(SRC, f), 'utf8')
  for (const [re, rep] of repl) {
    const m = t.match(re)
    if (m) total[rep] = (total[rep] || 0) + m.length
    t = t.replace(re, rep)
  }
  fs.writeFileSync(path.join(BUILD, f), t)
}
console.log('Build-copy written to:', BUILD)
console.log('Replacements applied:', JSON.stringify(total))
