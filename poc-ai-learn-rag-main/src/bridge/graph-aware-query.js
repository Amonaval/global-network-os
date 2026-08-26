/**
 * Optional G9.1-C Knowledge Hub sidecar orchestration.
 * Existing Knowledge Hub query.js remains untouched. This adapter retrieves only
 * the caller-authorized corpus and returns evidence; Network OS owns graph truth.
 */
const { NetworkKnowledgeAdapter } = require('./network-knowledge-adapter');

class GraphAwareKnowledgeQuery {
  constructor(options = {}) { this.adapter = options.adapter || new NetworkKnowledgeAdapter(options); }
  async evidence(question, context, options = {}) {
    const result = await this.adapter.retrieve(question, context, { topK: options.topK || 8 });
    return { question, blocked: result.blocked, reason: result.reason || null, hits: result.hits || [], synthesisAllowed: options.synthesisAllowed === true };
  }
}
module.exports = { GraphAwareKnowledgeQuery };
