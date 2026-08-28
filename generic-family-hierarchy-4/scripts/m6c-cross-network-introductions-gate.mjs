import fs from "node:fs";const checks=[
["migration",fs.existsSync("supabase/migrations/059_m6c_cross_network_discovery_introductions.sql")],
["anonymous candidates",fs.readFileSync("supabase/migrations/059_m6c_cross_network_discovery_introductions.sql","utf8").includes("Identity is disclosed to the requester only after target consent")],
["accepted bridge discovery",fs.readFileSync("supabase/migrations/059_m6c_cross_network_discovery_introductions.sql","utf8").includes("capabilities->>'discovery'")],
["introduction consent",fs.readFileSync("supabase/migrations/059_m6c_cross_network_discovery_introductions.sql","utf8").includes("review_trusted_introduction")],
["target acceptance disclosure",fs.readFileSync("supabase/migrations/059_m6c_cross_network_discovery_introductions.sql","utf8").includes("i.status='accepted' then e.label")],
["M5 command runtime",fs.readFileSync("app/api/v1/trust-bridges/discover/route.ts","utf8").includes("executeCommand")],
["UI",fs.existsSync("components/CrossNetworkDiscovery.tsx")],
["My Networks integration",fs.readFileSync("components/MyNetworksHome.tsx","utf8").includes("CrossNetworkDiscovery")],
["privacy copy",fs.readFileSync("lib/i18n/messages/en.ts","utf8").includes("Identity hidden until consent")],
["mission doc rule",fs.existsSync("MISSION-DOCUMENTATION-RULE.md")],
["mission markdown",fs.existsSync("MISSION-6C-PRIVACY-SAFE-DISCOVERY-INTRODUCTIONS.md")],
["runtime checklist",fs.existsSync("MISSION-6C-RUNTIME-VERIFICATION-CHECKLIST.md")]];for(const [n,ok] of checks)console.log(`${ok?"PASS":"FAIL"} ${n}`);if(checks.some(x=>!x[1]))process.exit(1);console.log(`M6-C source gate: ${checks.length}/${checks.length} PASS`);
