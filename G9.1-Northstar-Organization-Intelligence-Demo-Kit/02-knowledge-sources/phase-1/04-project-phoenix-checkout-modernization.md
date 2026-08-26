# Project Phoenix — Checkout Modernization
Updated: 2026-08-12

Project Phoenix modernizes Checkout API and Order Orchestrator.
Neha Iyer is the engineering owner for Project Phoenix, and Ananya Gupta is the product lead.
Karan Malhotra manages the Checkout Platform delivery team.

Checkout API depends on Identity Gateway to authenticate customer sessions.
Checkout API publishes checkout-completed events to Event Mesh.
Order Orchestrator depends on Checkout API and Event Mesh.
Customer Profile Service depends on Identity Gateway during authenticated profile lookups.

Sana Khan is the strongest hands-on engineer for the new checkout event flow.
Meera Rao is the primary Event Mesh expert supporting the program.
A major release should involve Neha Iyer, Sana Khan, Rahul Verma or Priya Nair for identity impact, and Meera Rao for event-streaming impact.
