# icons (priority + x5 simplify)

Generated from `packages/ui/assets/oracle-bone-icons` with priority:
`oracle > bronze > seal`.

For each character, only one source variant is selected and simplified.
Output directory structure mirrors source categories.

Pipeline:
1. Variant selection by priority
2. Inkscape `path-simplify` x5
3. Aggressive SVGO cleanup

Artifacts:
- `selection.csv`
- `metrics.csv`
- `summary.txt`
- `.logs/`
