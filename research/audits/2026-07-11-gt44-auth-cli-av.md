# GT-44 authentication, CLI, and A/V reconciliation

Primary process 3316 and blind process 3324 independently audited ten smart
wallet, authentication, audit, examples, and CLI cases.

Durable corrections:

- New smart-wallet work should start from Smart Account Kit/OpenZeppelin;
  Passkey Kit is a legacy demo/deployment path.
- P27 made delegation first-class, but custom-account delegation patterns were
  possible from P20.
- The host manages standard Soroban address-credential nonce/expiry/replay;
  custom `__check_auth` verifies the contract's signature scheme and policy.
- Veridise authorization-recursion IDs changed between V2 and V2.1; the later
  invalid/not-practical conclusion remains controlling.
- Lumenloop A/V rows are summaries plus source metadata, not transcripts or
  playback timestamps.
- CLI 27 TypeScript bindings accept Wasm/hash/contract ID; Rust accepts local
  Wasm; other visible language subcommands are placeholders. Optimization is
  default-on.

Upstream candidate requiring owner confirmation: the public CLI manual/help
surfaces Python, Java, Flutter, Swift, and PHP “Generate bindings” commands
that CLI 27 exits as not implemented. The current improvements service map has
no direct stellar-cli owner, so this remains research rather than a speculative
finding ID.

Full source and empirical ledgers are in Solo scratchpad 575.
