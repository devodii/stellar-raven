# Agent Playground

Status: deferred idea, not planned work.

Origin: split from Solo todo `solo://proj/49/todo/backlog-playground-i--832` on
2026-07-03 before removing that backlog todo.

## Idea

The original backlog item proposed an authenticated playground for trying Raven's
`search` and `execute` tools against the live Worker. A raw API console would help
debugging, but it probably would not demonstrate the product well unless the user
already understood the protocol.

If this comes back, the stronger product shape is an agent/chat playground:

- User enters intent in a chat-like interface.
- The playground uses the existing WorkOS OAuth session; it must not embed or proxy
  credentials client-side.
- Raven calls are shown as an inspectable trace: `search` query, ranked hits,
  selected operation or skill, `execute` request, and the response envelope.
- Envelope rendering should preserve the real contract: `ok/data` versus
  `error.kind`, including denied, soft-empty, and validation failures.
- A manual `search` / `execute` console can exist as an advanced tab, but should not
  be the primary onboarding experience.

## Constraints

- Keep auth posture unchanged: admin-token and local unauthenticated bypasses stay
  non-production only.
- Paid Lumenloop research remains disabled by default in any playground path.
- Prefer proving what Raven does for an agent over teaching users to hand-author JSON.

## Open Questions

- Should the chat surface run a real hosted agent, or a deterministic demo flow that
  only exercises Raven `search` and `execute`?
- If a real hosted agent is used, where does its model provider configuration live,
  and how is cost controlled?
- What trace detail is useful to developers without exposing implementation noise or
  sensitive upstream data?
