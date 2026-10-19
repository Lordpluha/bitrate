# Writing lessons from the taste-skill pack

Optional reference, not loaded automatically. Read it when writing or editing a skill,
rule, agent, command, `CLAUDE.md` or a reference doc.

Source: the `Leonxlnx/taste-skill` pack (analysed 2026-09-30). The visual-design practices
that fit Bitrate live in [ui-design-practices](ui-design-practices.md); this file keeps the
*way the documents are written*. Part 3 applies it to Bitrate's own instruction files, together with the
`mattpocock-skills:writing-for-agents` vocabulary (context pointer, information hierarchy,
sprawl, leading word, no-op, sediment).

Audit coverage: `CLAUDE.md`, `rules/code-style.md`, `skills/br-review`, `skills/br-verify`,
`skills/fsd`, `references/execution-policy.md`, `references/verification.md`,
`references/large-task-planning.md`. Agents, commands, other rules and other skills are not
audited yet.

## 1. What the pack does well

| # | Technique | Where it shows | Why it works |
|---|---|---|---|
| 1 | **Top-loaded hard rules.** A `READ FIRST` block holds the two or three rules the model is most likely to break. | `imagegen-frontend-web`: "one image PER section" and "hero composition bias" precede everything. | Attention is strongest at the top of a long file; the costly default is blocked before the model settles on it. |
| 2 | **Each rule names the model's failure mode**, then the replacement. | `gpt-taste`: models produce 6-line H1s, leave empty bento cells, hide button text; each has a numeric fix (H1 at most 3 lines, `grid-flow-dense`, contrast rule). | The model recognises its own habit in the text. The fix is a checkable number, not an adjective. |
| 3 | **A ban comes with a substitute.** | `redesign-existing-projects`: "Inter everywhere" is followed by concrete alternatives; `minimalist-ui`: banned shadows are followed by the allowed value (`< 0.05` opacity). | A bare prohibition raises the forbidden idea's prominence; a pair gives the model a target. |
| 4 | **Named step sequence with a gate between steps.** | `image-to-code`: generate, analyse, extract, implement; anti-drift and "missing detail resolution" sit between analysis and code. | Each step has a visible output, so "done" is observable. |
| 5 | **A checkable exit list.** | `image-to-code` "Clarity check" (21 yes/no items); `imagegen-frontend-web` "Pre-output check". | Exhaustive and binary: the model cannot declare done while an item is unanswered. |
| 6 | **Forced variation from an enumerated menu.** | "Combinatorial variation engine": pick one value per axis (theme, hero, components, motion). | Turns "be creative" into a lookup, which removes the mode-collapse default. |
| 7 | **Tables where the content is a mapping.** | `brandkit`: category to core ideas to symbol logic; 11 tables, 15 imperatives in 2600 words. | Fewer commands, more usable data; the easiest of the five to maintain. |
| 8 | **Numeric dials for taste.** | `design-taste-frontend`: `DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`. | One parameter changes many decisions consistently. |

## 2. What not to copy

- **Priority inflation.** 60-70 `MUST/NEVER/CRITICAL` per file; when everything is critical,
  nothing is. Reserve capitals for the hard guardrails.
- **Sprawl and duplication.** `imagegen-*` and `image-to-code` are ~6000 words each and repeat
  anti-slop, spacing, typography and variation sections almost verbatim.
- **Bans as the main steering tool.** The lists of "never do X" pull X into context. Techniques 2
  and 3 are the good part; the bare lists are not.
- **Tool-bound wording** ("Codex", "image call", Stitch). A rule that needs a tool the client
  lacks is unexecutable.
- **Prompt-only examples.** Long lists, almost no worked output.

## 3. Findings in Bitrate's current writing

Each finding cites where it was seen, names the problem, and says which technique or
`writing-for-agents` lever fixes it.

### High impact

**F1. One rule, many homes (single source of truth).**
- `run-heavy.py` is stated in `rules/code-style.md`, `skills/br-verify` step 3,
  `references/execution-policy.md` "Heavy work" and the head of `references/verification.md`.
- The "rerun only after relevant changes, missing evidence or a new risk" rule is stated in
  `CLAUDE.md` (Execution), `br-verify` step 6, `br-review` step 4 and `execution-policy`.
- The definition of a large task and the grill-me requirement appear in `CLAUDE.md`
  (Planning) and again in `large-task-planning.md` "Trigger and ownership".
- Fix: keep the definition in one owner file; elsewhere keep a one-line pointer with its trigger.
  Coin one leading word for the rerun rule, e.g. **stale evidence** (defined once in
  `execution-policy`: evidence is stale when any recorded input changed), then say "rerun only
  stale evidence" everywhere. Technique 6 applies: name the concept once.

**F2. `verification.md` is sprawl, and its order fights its reader.**
- 320 lines; the file is titled "Code style — bitrate" but holds verification.
- The agent-specific rules ("Hard limits for agent runs", line 276) sit at the tail; the head is a
  human CLI tutorial. `code-style.md` sends agents here before heavy checks and on failures, so
  the agent path is the primary one.
- The hard-limit table (line 282) is the best content in the file and is reached last.
- Fix: order by consumer. Top: the agent gate (run-heavy exit codes, the limits table). Then
  disclose the rest behind pointers by branch (Biome nursery rules, `biome ci` vs `lint`, rtk
  proxy, Biome/ESLint split). Technique 1 (top-load) plus the information-hierarchy ladder.
  Rename the H1 to match the content.

**F3. Environment restated as text (cache that goes stale).**
- `verification.md` line 147 restates `biome.json` (indent, quotes, width); lines 157-158 restate
  per-app `tsconfig` flags; lines 99-102 and 150-153 list which workspaces run which script (that is
  `package.json`).
- `skills/fsd` re-draws every template tree while stating that `.claude/templates/` is canonical,
  then adds a "keep in sync" step to pay for the duplication.
- Fix: delete lookups the agent can do in one command. Keep what no config confesses. Keep these
  gems: `files.includes` is required, an `overrides` entry is not enough; the nursery promise
  rules work only at root; CI runs `biome ci`, so local `lint` plus `format` can still be red.

**F4. Incident stories inside rules (sediment).**
- `verification.md`: "has already cost a session", "caused real breakage once", the 2026-09-17
  swap incident; also measurement anecdotes (10 417 commands, 58.5 % saved).
- `MEMORY.md` already carries these incidents (`watch-memory-on-verification-runs`,
  `agents-must-use-worktrees`).
- Fix: technique 2 wants the rule plus a one-clause failure mode ("exit 137 is out-of-memory, not
  a lint failure"), not the story. Dates and stats go to memory or an ADR.

### Medium impact

**F5. Weak context pointers ("relevant", "applicable").**
- `br-review` step 2: "Read only applicable sections of the architecture checklist".
- `CLAUDE.md`: "relevant sections of `.claude/references/architecture-checklist.md`".
- The trigger is unstated, so a must-read section can be skipped or all sections get loaded.
- Contrast with the good pointer already in `CLAUDE.md`: verification is read "before heavy
  checks, when a check fails, or when editing lint/type/build configuration" (three branches).
- Fix: a mapping table (change type to checklist section), the style of `brandkit`'s category
  table. One row per branch, no synonyms.

**F6. Negation-led rules with no positive target.**

| Now | Positive form |
|---|---|
| "Never bulk-load rules, skills or templates." (`CLAUDE.md`) | "Load the one rule for the area you are editing, then stop." |
| "Do not ask delegates to reread all instructions, redo exploration or repeat grill-me." (`execution-policy`) | "A delegate starts from the handoff; findings already made are inputs." |
| "Avoid speculative/style-only findings." (`br-review` step 3) | "Report a finding only when you can state the trigger input and the wrong outcome." |
| "Do not keep polishing unrelated code after acceptance." | "Stop when every acceptance ID has evidence; extras become separate tasks." (the sentence before it already says this) |

Keep bare bans only for hard guardrails (never force-push, never read real `.env`), each with the
positive target next to it.

**F7. Steps with no exit criterion.**
- `br-review` steps 1-6 pack three or four actions each; step 6 is the only one with a checkable
  end ("report findings by severity or say none, and state coverage limits").
- `br-verify` is better: step 3 lists exit codes 75/78/124; step 6 lists what to report.
- Fix: one action and one "done when" per step; add technique 5, a closing list. Example for
  `br-review`: "Done when every hunk is classified reviewed or out of scope, and each finding has
  file:line, trigger, impact, correction."

**F8. Compressed prose that hides its purpose.**
- `CLAUDE.md` chains rules with semicolons: "Read a representative source file; before creating in
  a new area, read its app rule." Why the representative file (to copy idiom) is not stated, so
  the agent cannot generalise it.
- Fix: technique 2, add a clause naming the mistake the rule prevents. Split into short items when
  a line holds more than one instruction.

### Low impact

**F9. Probable no-ops** (settle each by running the document without the line).
- "Be concise and concrete." (`CLAUDE.md` intro).
- "Zero errors is the baseline. A commit with linting or type errors will fail CI."
  (`verification.md` line 213).
- "PASS — exits 0, no diagnostics." and "Common fixes: `noUnusedVariables` — remove unused
  imports/vars." (`verification.md`).

**F10. Stale references (sediment).**
- `skills/fsd` says "`implement` applies this skill"; the skill is now `br-implement`.
- `skills/fsd` lists `project-conventions` and `web-player-rules` under related skills; neither is
  in the skill list (they may be rules; verify and rename the heading).
- `skills/fsd` frontmatter carries `metadata` (version, type, author) and `license`; nothing reads
  them, so they add to the always-loaded cost without changing behaviour.
- `verification.md` still gives manual `MemAvailable` awk checks next to `run-heavy.py`, which owns
  the preflight.

## 4. What is already strong (keep)

- Path-scoped rule loading and the explicit "read before X, Y or Z" pointer in `CLAUDE.md`.
- Gotcha-first content that no config reveals (Biome `files.includes`, nursery rules, `biome ci`).
- Checkable exit codes in `br-verify` (75, 78, 124) and the memory-limits table.
- The concrete `verification-evidence.py record` example at the end of `execution-policy`.
- The handoff as a leading word, plus "canonical spec" as a single-owner term.

## 5. Suggested order of work

1. F1: define **stale evidence** once; reduce the other three homes of each duplicated rule to
   pointers. Smallest edit, biggest drift reduction.
2. F2 and F4: reorder `verification.md` for the agent reader and drop incident narrative.
3. F5 and F7: table-based pointer for the architecture checklist; a "done when" line for
   `br-review` and `br-verify`.
4. F3, F6, F8, F9, F10: as the files are next touched, not as a separate sweep.

Method check: run the edited document against a task, and remove any line whose absence changes
nothing. Do not argue about no-ops.
