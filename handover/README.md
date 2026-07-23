# Handover Notes

One file per milestone, written so a new engineer (human or AI) can pick up this project without re-reading the full build history. `/docs` is still the source of truth for _what the product should be_; this folder is the record of _what actually happened, in what order, and why_ — the two diverge in places (see `Milestone-3.md` and the Project Health Review), and that gap is exactly what these notes exist to surface.

Each completed milestone's file covers: what shipped, the non-obvious decisions made along the way, the audit history (findings and how they were resolved), and open items carried forward. The next milestone's file is a forward-looking kickoff brief, not a retrospective — written before that work starts, so scope and dependencies are explicit up front rather than reconstructed after the fact.

| File                         | Status                                            |
| ---------------------------- | ------------------------------------------------- |
| `Milestone-1.md`             | Complete — tagged `v1.0`                          |
| `Milestone-2.md`             | Complete — tagged `v2.0`                          |
| `Milestone-3.md`             | Complete — tagged `v3.0`                          |
| `Milestone-4.md`             | Complete — approved, pending `v4.0` tag           |
| `End-of-Phase-Report.md`     | End-of-phase handover, written after Milestone 3  |
| `technical-debt-register.md` | Living register of deliberately deferred findings |

See `docs/InvestorHub-project-health-review.md` for the full cross-milestone architecture/quality/compliance review — this folder is the narrative history, that document is the point-in-time audit.

See `technical-debt-register.md` for findings that were knowingly deferred rather than fixed, with the engineering reasoning and the condition that would trigger revisiting each one.

When Milestone 5 begins, add `Milestone-5.md` following the same kickoff-brief template rather than editing this README's table structurally.
