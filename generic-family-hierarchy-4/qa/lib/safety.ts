export function qaMode(){return process.env.QA_MODE||'readonly'}
export function mutationAllowed(){return qaMode()==='staging'&&process.env.QA_ALLOW_MUTATION==='true'}
export function assertMutationAllowed(){if(!mutationAllowed())throw new Error('Destructive QA workflow blocked. Set QA_MODE=staging and QA_ALLOW_MUTATION=true.');const u=process.env.QA_BASE_URL||'';const productionLike=/vercel\.app|trustweave|prod/i.test(u);if(productionLike&&process.env.QA_ALLOW_PRODUCTION!=='true')throw new Error(`Refusing destructive QA against production-like URL: ${u}`)}
