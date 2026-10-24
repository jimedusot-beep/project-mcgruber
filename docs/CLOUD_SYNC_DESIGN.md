# Private saving and future synchronization

## Shipping behavior

All user-created records, inventory identifications, drafts, media and mesh scenes stay in browser IndexedDB. A full JSON backup is the supported device-transfer method. The public repository and GitHub Pages contain only source code and original published repository assets. No privileged server secret is requested by the app. Once explicitly configured, the private vault accepts a public Supabase publishable key, a tab-scoped email-auth session and an in-memory encryption passphrase. Local autosave and public contribution are distinct actions.

Account sync is **not enabled by default**. An optional encrypted Supabase vault integration now exists in this repository, but it is not usable until the owner provisions the private backend and explicitly opts in. GitHub Pages cannot keep an OAuth client secret or a privileged installation token confidential. A PAT in JavaScript, local storage, a query string or a checked-in environment file is not an acceptable substitute.

## Proposed backend boundary

The implemented optional provider is a private Supabase project configured by the owner, rather than a GitHub App. No GitHub App credential or installation token is required for private vault data; the public GitHub repository is never the storage target. For publishing as a separate future feature, use independently reviewed OAuth code exchange and GitHub App permissions. Use server-side OAuth code exchange with state/CSRF protection, short-lived app installation tokens, exact redirect allowlisting, Secure/HttpOnly/SameSite cookies, authorization on every project operation, upload size/type limits and revision conflicts. Keep secrets in the host's secret store, not frontend bundles. Review the provider's then-current free plan, retention, private-storage guarantees and limits before activation; no subscription or spending is authorized here.

Use private storage for drafts and attachments. Publishing a draft to the public McGruber repository must have a separate explicit review screen displaying exact files, audience, evidence classification and revision. Saving must never publish as a side effect. GitHub's public repository is not the private media backend.

Define schema-versioned project/record/media APIs and conflict-safe revision IDs; keep the local-first workflow available during outages. Resolve conflicts visibly rather than overwriting a newer draft. Test authorization, origin isolation, revoked accounts, quota failures, media recovery and backup/restore before calling sync reliable.

## Current limitations

Local storage can be evicted, especially in temporary/private browsing. A persistence request may be denied. Backups include current referenced media, not every old recovery revision. Workspace revisions and backups can be large because geometry is serialized; mesh asset deduplication remains future work.

Workspace writes compare revision IDs inside the same IndexedDB transaction as the new snapshot. A stale tab cannot replace a newer workspace; it pauses autosave and offers export or preservation of its local draft before loading the latest version. Recovery drafts count toward the ten-revision history limit. There is no semantic merge across records. Existing schema-1 workspaces gain revision metadata on their next successful save without dropping their content.

Secure-context uploads use a content hash of MIME type and bytes to share identical media. An insecure development preview falls back to unique IDs. Backup restore remaps media IDs and writes imported bytes and workspace atomically, protecting older revisions from ID collisions. Manual cleanup checks current, draft and recovery references in one transaction, checks the workspace revision and keeps unused uploads for at least 24 hours. The Settings panel reports stored and referenced media. Actual iPhone eviction, quota failure and interruption behavior still require device testing.


## Implemented milestone: encrypted *manual* cross-device transfer

McGruber now offers an optional encrypted full-backup workflow in Settings. It uses
WebCrypto PBKDF2-HMAC-SHA-256 (310,000 iterations, a fresh 128-bit salt) to derive
an AES-256-GCM key with a fresh 96-bit nonce per export and authenticated
encryption. The file includes the existing full backup, including media and
workspace records, and never uploads it. Neither passwords nor derived keys
are persisted. Export requires a confirmed passphrase of 12–256 characters;
restore authenticates the file *before* asking to replace local workspace.
Incorrect keys, malformed or tampered files leave the existing workspace
unchanged. Plaintext full backups are still available, labeled accordingly.

This is **not automatic cloud synchronization** or account-based recovery.
It is explicit, portable, passphrase-protected file transfer. Lost passphrases
cannot be recovered. Large backups may require substantial memory when
encrypting/decrypting in a mobile browser. Do not treat manual file transfer as
a substitute for a dedicated private, authenticated backend.

Future optional live sync requires a backend with per-account authentication,
least-privilege storage, media APIs, server-side access control, conflict-safe
revisions, revocation, rate/size limits, encrypted transport and recovery tests.
Never upload personal inventories or photos to the public GitHub Pages repository.


## Implemented opt-in vault integration (backend still requires owner setup)

See [Supabase operator instructions](../supabase/README.md) and [private vault migration](../supabase/migrations/202610240001_private_vault.sql).

McGruber's new Settings panel supports a configured Supabase project URL and **public** publishable/anon key, numerical Email OTP account authentication, client-side encrypted full-workspace snapshots (AES-256-GCM), private Storage bucket paths scoped to the authenticated account, and a PostgreSQL RPC which atomically compares the stored remote revision before replacing its head pointer. It preserves local IndexedDB saving even if the remote upload, auth or quota fails.

When the owner uploads to an empty vault, that initial encrypted snapshot is the base. A second device must explicitly decrypt and restore the current cloud head before uploading. A newer remote head or concurrent upload triggers a **visible conflict**, not a last-writer-wins overwrite. A successful download is authenticated and decrypted before local restore confirmation. Missing media aborts the snapshot, and existing local recovery history is protected. The optional auto-upload switch operates only while this browser tab is open, with a 45-second debounce / 10-minute minimum interval and the passphrase held in memory. It never silently downloads and overwrites another device's changes.

RLS guards both owner-only database head reads and private ciphertext objects. Encrypted orphan objects older than 24 hours can be pruned by the owner after checking they are not active. Object size is capped at 30 MiB; large backups may require the existing manual encrypted transfer instead. Account metadata and ciphertext size are visible to the provider. The client stores only the public project endpoint in localStorage; the account refresh token is scoped to sessionStorage, and the encryption passphrase is neither stored nor recoverable.

**No Supabase project, email SMTP, bucket, account or live cloud service has been created by these changes.** This is a deployable but disabled-by-default implementation. Mock-authentication and concurrency unit/browser tests cannot replace an end-to-end live RLS and mobile-device security test.
