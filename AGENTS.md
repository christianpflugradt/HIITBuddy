@/Users/cpf/.codex/RTK.md

# Repository workflow

- Run repository commands through a login interactive zsh, for example `zsh -lic 'rtk npm test'`, so `.zprofile` and `.zshrc` are sourced and local shell tools are available.
- Commit after every user prompt that changes files.
- Push after every commit created for a user prompt that changes files.
- Before every push, run `git pull --rebase` against the target branch.
- The published Please Behave version pinned in `mise.toml` governs this repository. Git hooks are the validation gates: pre-commit checks formatting, pre-push runs the complete local suite. Install them with `please sync --yes`, never bypass them and do not manually repeat the full gate. Inspect failures with `please status --details`, fix them and retry. See [repository governance](.please/README.md).
- Use Conventional Commits without scopes: `type: subject`.
- Allowed commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Do not use scoped headers such as `feat(ui): subject`.
