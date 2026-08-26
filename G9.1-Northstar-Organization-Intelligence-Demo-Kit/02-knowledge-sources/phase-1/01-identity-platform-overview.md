# Identity Platform — Ownership and Expertise Overview
Updated: 2026-08-18

Identity Gateway is the primary customer authentication entry point for Northstar Digital Systems.
Rahul Verma is the current technical owner of Identity Gateway and is accountable for production changes to the gateway.
Priya Nair is the designated technical backup for Identity Gateway and has deep expertise in OAuth 2.0, OIDC, SSO and authentication architecture.
Aman Shah contributes to the Node.js gateway codebase and is being prepared for broader ownership, but Rahul remains the current owner.

Identity Gateway depends on Authentication Platform for identity validation and token lifecycle services.
Identity Gateway also depends on Redis Session Cache for short-lived browser session state.
API Edge routes external authentication traffic to Identity Gateway.

The Identity & Access team owns day-to-day delivery for Identity Gateway.
Ishita Sen from Security Architecture reviews OAuth scopes, token lifetime and threat-model changes.
