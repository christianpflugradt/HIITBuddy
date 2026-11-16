# Repository governance

The separately installed published CLI pinned in `mise.toml` governs HIITBuddy. Local Rules
contain only HIITBuddy tooling (`.please/checks/`, release glue in `.github/scripts/`); the
repository-conventions, security, open-source-software and releasable-open-source-software Rule Sets
and the Gemini providers use immutable pins that Renovate keeps current.

## Setup

Run `mise trust`, `mise install` and `mise run setup`, then synchronize the hooks:

```sh
mise exec -- please sync --yes
```

Use `mise exec -- git commit` and `mise exec -- git push` so hooks inherit the pinned tools.
Docker is a prerequisite for the release candidate only. Export `GEMINI_API_KEY` for the advisory
commit wording review; its failures stay visible without blocking commits.

## Execution points

| Local Rule | Execution points |
| --- | --- |
| format-python | pre-commit, pre-push, check |
| ts-check, node-tests, python-tests | pre-push, check |
| release-candidate | release |

`node-tests` runs `npm test`, which builds `dist/` and runs the Node tests. `release-candidate`
builds the Docker image for linux/amd64 and checks that it serves the application. Commit headers
are Conventional Commits without scopes; `commit-scopes.txt` lists no scope.

## Release

`.github/workflows/ci.yml` runs the `check` point. The manual `Release` workflow on main follows the
shared structure (`plan`, `release-readiness`, `release-candidate`, `publish`). The candidate exports
the verified image as an archive with a receipt bound to version, source and workflow run; `publish`
verifies it, loads the same image and pushes it to GHCR as the planned version and `latest`, then
semantic-release tags the source. Publication never builds. `.github/release-ci.json` and
`.github/release-artifacts.json` hold the workflow policies. Only `linux/amd64` is released.

## Statistics

`.github/workflows/statistics.yml` runs on pushes to main and manually. Job `collect` builds the app, runs the Node
tests with the built-in coverage and takes the test count from their summary. Line and branch coverage cover the
compiled files under `dist/` that the tests load. Production lines of `src/**/*.ts` are counted with the scc version
pinned in `mise.toml`. `.github/scripts/write-*-metrics.py` write the metric files. Job `publish` alone uses
`STATISTICS_TOKEN` to send them as project `hiitbuddy` to badges-and-stuff, which renders the README badges. The
shared `statistics-workflow` rule checks the structure.
