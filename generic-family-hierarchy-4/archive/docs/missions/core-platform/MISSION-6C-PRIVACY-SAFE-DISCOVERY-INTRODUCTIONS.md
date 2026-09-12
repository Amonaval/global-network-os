# Mission 6-C — Privacy-Safe Cross-Network Discovery & Trusted Introductions

## Mission intent
Turn accepted M6-B network bridges into useful network-effect value without creating a cross-network people directory.

## Product rule
Discovery reveals **an opportunity, not an identity**. A requester may learn that a relevant claimed person exists in a trusted adjacent network, but does not receive the person's name or profile. The target person sees who is requesting an introduction and why. Only explicit acceptance reveals the target person's identity to the requester.

## What shipped
- intent/keyword discovery across accepted bridges with `discovery=true`;
- ephemeral opaque candidate handles with 30-minute expiry;
- discovery limited to claimed person entities and membership-visible data used only server-side for matching;
- introduction request requiring `introductions=true`;
- target-person accept/decline consent;
- post-accept identity disclosure only;
- audit events for request/accept/decline;
- My Networks discovery and introduction inbox/outbox;
- M4/M5 API command-runtime enforcement.

## Explicit non-goals
No adjacent-network directory, no profile browsing, no contact export, no automatic connection, no AI ranking, no graph merging, no service-role bypass.

## Next strategic step
M6-D should measure the network-effect loop and improve reach/path explanations from real usage rather than broadening disclosure.
