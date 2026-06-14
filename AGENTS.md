@/Users/cpf/.codex/RTK.md

# Repository workflow

- Run repository commands through a login interactive zsh, for example `zsh -lic 'rtk npm test'`, so `.zprofile` and `.zshrc` are sourced and local shell tools are available.
- Commit after every user prompt that changes files.
- Run the repository hooks before each commit.
- Use Conventional Commits without scopes: `type: subject`.
- Allowed commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Do not use scoped headers such as `feat(ui): subject`.
