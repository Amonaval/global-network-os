import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const sql=read('supabase/migrations/111_engagement_community_posts_broadcasts.sql');
const ui=read('components/shared/NetworkPostsPanel.tsx');
const app=read('components/TemplateNetworkApp.tsx');
const remote=read('capabilities/activity/remote.ts');
const storage=read('lib/storage.ts');
const cfg=read('templates/productized/config.ts');
const checks=[
 ['reuses network activities',sql.includes('public.network_activities')&&sql.includes("'content_kind','post'")],
 ['member post RPC',sql.includes('create_network_post')&&sql.includes('Network membership required')],
 ['admin-only important broadcast',sql.includes("p_importance<>'normal' or p_notify_all")&&sql.includes('public.is_network_admin')],
 ['broadcast creates deep-linked notifications',sql.includes("'community','activity',activity_id")&&sql.includes('community_post_broadcast')],
 ['post comment notifies author',sql.includes('add_network_post_comment')&&sql.includes('community_post_comment')],
 ['pinning audited',sql.includes('set_network_activity_pinned')&&sql.includes('network_post_pinned')],
 ['social metadata merged',remote.includes('get_network_activity_social_flags')&&remote.includes('row.metadata=f.metadata')],
 ['push handoff for broadcasts/comments',remote.includes('requestPushDelivery')&&remote.includes('notification_ids')],
 ['shared media post preset',storage.includes("post:{bucket:COMMUNITY_BUCKET")],
 ['post UI exists',ui.includes('qa-network-posts-panel')&&ui.includes('E9NotifyEveryoneTxt')],
 ['mentions route to exact post',ui.includes('routeNetworkMentions')&&ui.includes('entityType:"activity"')],
 ['photo binding uses shared media registry',ui.includes('uploadMediaAsset(photo,"post")')&&ui.includes('bindMediaAsset(media.assetId,"activity",id)')],
 ['comments and reactions exposed',ui.includes('toggleNetworkActivityLike')&&ui.includes('addNetworkPostComment')],
 ['community surface wired',app.includes('<NetworkPostsPanel')&&app.includes('content_kind!=="post"')],
 ['showcase has MPF post',cfg.includes('Sports Day registrations close on 15 September')&&cfg.includes('content_kind:"post"')],
 ['showcase has Residential post',cfg.includes('Water tank cleaning on Sunday')&&cfg.includes('Managing Committee')],
];
let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} E9 ${name}`);if(!ok)fail++}console.log(`E9 ${checks.length-fail}/${checks.length} PASS`);if(fail)process.exit(1);
