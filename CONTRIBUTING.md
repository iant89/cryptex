# Contributing to Cryptex

## Branches
- `main` is the integration branch. Never commit to it directly.
- Branch names: `feature/<short-name>`, `fix/<short-name>`, `docs/<short-name>`.
- **One git worktree per agent/contributor** (`git worktree add ../cryptex-<name> -b feature/<name>`). Never share a working tree.

## Commits
- Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ci:`.

## Pull requests
- Open a PR against `main`; keep it focused and describe what changed and how it was verified.
- **Code PRs** need an approval comment from the Technical Lead **and** green CI (once CI exists).
- **Docs-only PRs** need a Repository Maintainer check plus green CI (once CI exists).
- Do not merge with unresolved critical findings or failing required checks.

## Merging
- **Squash-merge only.** The squash commit title must follow Conventional Commits.
- Merges are performed by the Repository Maintainer.

## Safety
- **Never force-push** or rewrite shared history.
- Do not delete important branches or content without the owner's authorization.
- Never commit secrets, `.env` files, or build output.
