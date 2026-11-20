# Repository workflow

- The published Please Behave version pinned in `mise.toml` governs this repository. Git hooks are the validation gates: pre-commit checks formatting, pre-push runs the complete local suite. Install them with `please sync --yes`, never bypass them and do not manually repeat the full gate. Inspect failures with `please status --details`, fix them and retry. See [repository governance](.please/README.md).
- Use Conventional Commits `type: subject` with the scopes in `.please/commit-scopes.txt`.
- Allowed commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
