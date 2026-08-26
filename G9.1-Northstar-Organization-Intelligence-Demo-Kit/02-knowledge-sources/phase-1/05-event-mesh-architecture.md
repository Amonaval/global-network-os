# Event Mesh Architecture and Ownership
Updated: 2026-08-05

Event Mesh is Northstar's shared Kafka-based event-streaming platform.
Meera Rao is the technical owner of Event Mesh and the principal expert for Kafka partitioning, schema evolution and producer reliability.
Dev Patel is the architecture reviewer for cross-domain event contracts.

Billing Service publishes invoice-state events to Event Mesh.
Checkout API publishes checkout-completed events to Event Mesh.
Order Orchestrator consumes checkout and billing events from Event Mesh.

Northstar chose Kafka for Event Mesh because ordered partitioned streams, replay, consumer independence and established operational tooling were required.
The team deliberately rejected direct service-to-service fan-out for these domain events because it increased runtime coupling.
