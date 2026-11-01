# Security and privacy

Do not store passwords, tokens, personal addresses, private correspondence, or Wi-Fi credentials in this public repository. Keep network-connected prototypes authenticated and local-first; do not expose unauthenticated remote code execution. Report potential issues privately to the maintainer through GitHub rather than posting secrets in an issue.


## Automated checking

- [CodeQL security analysis](.github/workflows/codeql.yml) analyzes JavaScript, Python and GitHub Actions source on pull requests, main branch changes and a weekly schedule using [GitHub's supported CodeQL action](https://github.com/github/codeql-action). The resulting alerts should be reviewed, triaged and corrected; a passing scan is **not** a penetration test.
- `npm audit --audit-level=moderate` remains part of the build workflow but only checks known package advisories. Dependabot version-update proposals are configured separately and require review before merge.
- Physical LED, IR, battery and RF experiments require independent electrical safety/verification; source-code scans cannot validate hardware pinouts, supply voltages, component markings or builds.

For suspected security vulnerabilities, use GitHub's **Report a vulnerability** private advisory entry if this repository has private vulnerability reporting enabled. If it does not, contact the maintainer through a secure channel before sharing exploit details or secrets. Do **not** post proof-of-concept exploit details or credentials in a public GitHub issue.
