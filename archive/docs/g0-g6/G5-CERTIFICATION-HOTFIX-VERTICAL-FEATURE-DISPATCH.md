# G5 Certification Hotfix — Vertical Feature Dispatch

Historical compatibility artifact restored during G8.5-A baseline integrity repair.

The G5 post-certification fix ensured active Alumni rendering is handed off before Family-only feature evaluation, so Alumni feature keys are never interpreted by the Family feature runtime. This behavior remains protected by later G6/G7/G8 gates and current `NetworkApp` ordering.

This file restores the release-history artifact expected by the accepted G5/G6/G7/G8 baseline manifests; it does not introduce a new runtime change.
