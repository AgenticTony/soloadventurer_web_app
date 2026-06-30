# Build scripts — The AI-Native Platform Playbook

Regenerates the master DOCX/PDF from the Markdown sources after you edit a chapter.

## Layout

- `../part-01.md` … `../part-13-*.md` — source chapters (edit these)
- `../platform-playbook.md` — master working doc (front matter + all 13 parts)
- `../diagrams/` — 7 hand-generated SVG figures
- `../build/` — generated build-copies (glyph-fixed, image refs) — build artifact, safe to delete
- `../The-AI-Native-Platform-Playbook.{pdf,docx}` — final outputs

## Pipeline (run from `docs/research/`, in this order)

```bash
# 1. Normalize chapter titles to Title Case + extract Part 1 into its own file
node build-scripts/prep-build.js

# 2. Write fresh build/ copies; convert math glyphs (∝ ⁿ ≥ ≤) to inline LaTeX,
#    replace emoji (Latin Modern lacks them). Keeps source .md pristine.
node build-scripts/glyph-fix.js

# 3. Regenerate the 7 SVGs into diagrams/ and insert/replace them in build/ copies.
#    (Only run on a fresh build/ produced by step 2.)
node build-scripts/diagrams.js

# 4. Make image paths absolute (pandoc resolves from cwd, not the input file's dir)
sed -i '' "s#(\.\./diagrams/#($PWD/diagrams/#g" build/part-*.md

# 5. Build both formats
TITLE="The AI-Native Platform Playbook"
SUB="A Founder's Guide to Reverse-Engineering Addictive Social Products and Building What Comes Next"
pandoc build/part-*.md --metadata title="$TITLE" --metadata subtitle="$SUB" --metadata date="2026" \
  --toc --toc-depth=1 -o "The-AI-Native-Platform-Playbook.docx"
pandoc build/part-*.md --metadata title="$TITLE" --metadata subtitle="$SUB" --metadata date="2026" \
  --toc --toc-depth=1 -V geometry:margin=1in -V fontsize=11pt -V monofont="Menlo" \
  --pdf-engine=tectonic -o "The-AI-Native-Platform-Playbook.pdf"
```

## Requirements

`pandoc`, `tectonic` (LaTeX engine), `librsvg` (`rsvg-convert`, embeds SVG into PDF), `node`. macOS font: Menlo.

## Notes

- Paths inside the `.js` scripts are absolute to this machine; update `DIR`/`BUILD`/`DG` if the project moves.
- Source `.md` files keep clean Unicode (∝, ⁿ, ≥, ≤); only the `build/` copies are modified for rendering.
- To add your name as author on the title page, add `--metadata author="Your Name"` to both pandoc commands.
