# Handover Notes

One file per milestone, written so a new engineer (human or AI) can pick up this project without re-reading the full build history. `/docs` is still the source of truth for _what the product should be_; this folder is the record of _what actually happened, in what order, and why_ — the two diverge in places (see `Milestone-3.md` and the Project Health Review), and that gap is exactly what these notes exist to surface.

Each completed milestone's file covers: what shipped, the non-obvious decisions made along the way, the audit history (findings and how they were resolved), and open items carried forward. The next milestone's file is a forward-looking kickoff brief, not a retrospective — written before that work starts, so scope and dependencies are explicit up front rather than reconstructed after the fact.

| File                         | Status                                            |
| ---------------------------- | ------------------------------------------------- |
| `Milestone-1.md`             | Complete — tagged `v1.0`                          |
| `Milestone-2.md`             | Complete — tagged `v2.0`                          |
| `Milestone-3.md`             | Complete — tagged `v3.0`                          |
| `Milestone-4.md`             | Complete — tagged `v4.0`                          |
| `End-of-Phase-Report.md`     | End-of-phase handover, written after Milestone 3  |
| `technical-debt-register.md` | Living register of deliberately deferred findings |

**Milestones 5-8 are complete and tagged (`v5.0`-`v8.0`) but don't have a
narrative `Milestone-N.md` file** — an honest gap in this folder's own
stated purpose, not a silent one. For what actually shipped in each, the
audit trail is in the commit messages on each `milestone-N` branch and the
completion-audit conversation history, not reconstructed here after the
fact. If a genuine need for the narrative form shows up (a new engineer
who needs the "why," not just the "what"), backfill from git history at
that point rather than guessing retroactively now.

See `docs/InvestorHub-project-health-review.md` for the full cross-milestone architecture/quality/compliance review — this folder is the narrative history, that document is the point-in-time audit.

See `technical-debt-register.md` for findings that were knowingly deferred rather than fixed, with the engineering reasoning and the condition that would trigger revisiting each one.

If a future milestone's kickoff brief is wanted, add `Milestone-N.md`
following the original template rather than editing this README's table
structurally.
