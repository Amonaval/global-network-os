# G7 — Platform Template Contract

A vertical template should define how a product composes the Generic Network OS. It must not become a giant JSON file that contains all business logic.

## Conceptual direction

```ts
type VerticalTemplate = {
  id: string;
  version: number;

  identity: {
    entityKinds: string[];
    primaryEntityKind: string;
    profileSchemaRef: string;
  };

  structure: {
    dimensions: DimensionDefinition[];
    relationships: RelationshipDefinition[];
    projections: ProjectionDefinition[];
  };

  capabilities: CapabilitySelection[];

  discovery: {
    searchableFields: string[];
    filters: FilterDefinition[];
    defaultSort?: string;
  };

  terminology: Record<string, string>;

  navigation: NavigationSurfaceDefinition[];
  homeExperience: HomeExperienceDefinition;

  privacyDefaults: PrivacyPolicyDefinition;
  rolePolicy: RolePolicyDefinition;

  guide: GuideDefinition;
  playground: PlaygroundDefinition;
  launch: LaunchPolicyDefinition;

  intelligenceAdapters?: IntelligenceAdapterRegistration[];
};
```

## Template MAY define
- terminology
- entity kinds
- dimensions
- typed relationship vocabulary
- capability selection
- profile schema references
- search/filter configuration
- projection definitions
- navigation surfaces
- guide/playground metadata
- privacy defaults
- intelligence adapter registration

## Template MUST NOT
- contain raw SQL
- bypass RLS
- import another vertical implementation
- encode arbitrary executable business logic
- force all vertical pages through one universal renderer
- weaken strict feature-key ownership
- cosmetically rename deployed Family/Alumni persistence

## Projection contract

```ts
type ProjectionDefinition = {
  id: string;
  label: string;
  levels: string[];
  allowedRootKinds?: string[];
  defaultFilters?: Record<string, unknown>;
};
```

MET examples:

```text
institution-program-batch-stream
levels = [institution, program, batch, stream]

institution-batch-program-stream
levels = [institution, batch, program, stream]

city-institution-batch
levels = [city, institution, batch]
```

This is the key to avoiding rigid one-tree designs.

## Capability packs

Candidate packs:
- identity
- profiles
- affiliation
- explorer
- discovery
- groups
- events
- memories
- maps
- milestones
- contributions
- connection-paths
- notifications
- construction
- media

Capability packs define reusable lifecycle/runtime contracts. Domain semantics remain in vertical adapters/configuration.
