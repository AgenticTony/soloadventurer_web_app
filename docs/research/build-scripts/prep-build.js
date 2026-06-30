const fs = require('fs')
const path = require('path')

const DIR = '/Users/anthonyforan/Desktop/SoloAdventurerWeb/docs/research'

// Canonical H1 per part: clean Title Case, em-dash separator.
const titles = {
  1: '# Part 1 — The Psychology of Daily Use',
  2: '# Part 2 — Why Each Platform Became Addictive',
  3: '# Part 3 — The Science of Virality',
  4: '# Part 4 — Design Patterns of the Best Products',
  5: '# Part 5 — Network Effects',
  6: '# Part 6 — The Economics of Platforms',
  7: '# Part 7 — Algorithms and the AI Stack — From Feeds to Agents',
  8: '# Part 8 — AI Changes Everything',
  9: '# Part 9 — The Building Blocks of a Social Product',
  10: '# Part 10 — Why New Social Apps Fail',
  11: '# Part 11 — How a Platform Could Win in 2026',
  12: '# Part 12 — Future Trends — The Next 5–10 Years',
  13: "# Part 13 — The Founder's Framework",
}

const reH1 = /^# PART\s+(\d+)\s*[-–—]\s*.+$/gm
const repl = (m, n) => titles[+n] || m

// 1) Normalize per-chapter files
for (const f of fs.readdirSync(DIR)) {
  if (!/^part-\d+-.*\.md$/.test(f)) continue
  const p = path.join(DIR, f)
  const b = fs.readFileSync(p, 'utf8')
  const a = b.replace(reH1, repl)
  if (a !== b) {
    fs.writeFileSync(p, a)
    console.log('normalized:', f)
  }
}

// 2) Normalize master
const mp = path.join(DIR, 'platform-playbook.md')
let master = fs.readFileSync(mp, 'utf8').replace(reH1, repl)
fs.writeFileSync(mp, master)
console.log('normalized: platform-playbook.md')

// 3) Extract Part 1 into its own file (it only lived in the master)
const i1 = master.search(/^# Part 1 —/m)
const i2 = master.search(/^# Part 2 —/m)
if (i1 >= 0 && i2 > i1) {
  let part1 =
    master
      .slice(i1, i2)
      .replace(/(\s*\n?---\s*)+\s*$/m, '\n')
      .trimEnd() + '\n'
  fs.writeFileSync(path.join(DIR, 'part-01-the-psychology-of-daily-use.md'), part1)
  console.log('wrote: part-01-the-psychology-of-daily-use.md')
} else {
  console.log('WARN: could not locate Part 1/2 boundaries', i1, i2)
}
console.log('done')
