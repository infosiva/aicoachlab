import type { Role } from './types'

export const DATA_ENGINEER: Role = {
  slug: 'data-engineer',
  title: 'Data Engineer',
  blurb: 'Builds the pipelines that move messy source data into trusted tables that analytics and AI features read from.',
  asOf: '2026-10',
  demand: [
    {
      claim: 'Data engineer is one of the 10 technology roles in highest demand, with above-average sequential growth and consistent demand over the past 12 months.',
      source: 'Robert Half, 2026',
      url: 'https://www.roberthalf.com/us/en/insights/research/data-reveals-which-technology-roles-are-in-highest-demand',
    },
  ],
  scenario: {
    title: 'Daily sales and app-event pipeline for a subscription app',
    story:
      'Orders sit in a Postgres database and usage events arrive from the app. Finance wants a trusted daily revenue table, and the product team wants the same data for a recommendation feature. You build one pipeline both can rely on.',
  },
  steps: [
    { stackId: 'sources', label: 'Sources', happens: 'List every source, its owner, how often it changes and what a "wrong" row looks like.' },
    { stackId: 'ingest', label: 'Ingest', happens: 'Orders are copied incrementally from Postgres and events are streamed in, with the raw copy kept as-is.' },
    { stackId: 'lake', label: 'Land in storage', happens: 'Raw data lands in cheap object storage as columnar files, then loads into the warehouse.' },
    { stackId: 'transform', label: 'Transform', happens: 'SQL models clean, join and aggregate raw tables into a tested daily revenue table.' },
    { stackId: 'orchestrate', label: 'Schedule', happens: 'A scheduler runs the steps in order, retries failures and alerts when a run is late.' },
    { stackId: 'quality', label: 'Check quality', happens: 'Tests block bad data from reaching dashboards, and lineage shows who is affected when one fails.' },
  ],
  stack: [
    {
      id: 'sources', name: 'Source systems and contracts',
      what: 'The databases, APIs and event streams your data starts in, plus the agreement on what they will send.',
      why: 'Most pipeline failures start upstream, when a source changes a column nobody told you about.',
      mustKnow: ['Know each source\'s owner and change process', 'Agree on a schema contract, not just a table name', 'Tell apart append-only events from rows that get updated'],
      mistake: 'Building on a table without asking whether its columns can change or rows can be deleted.',
    },
    {
      id: 'ingest', name: 'Ingestion (batch and streaming)',
      what: 'Moving data out of sources on a schedule or continuously, for example with managed connectors, change data capture or Kafka.',
      why: 'Incremental loads keep cost and load on the source low, and streaming covers events that cannot wait for a nightly run.',
      mustKnow: ['Incremental loads need a reliable cursor such as an updated-at column or a log position', 'Make loads idempotent so a re-run does not duplicate rows', 'Keep the raw copy untouched'],
      mistake: 'Full-copying a large production table every night and slowing the live app.',
    },
    {
      id: 'lake', name: 'Object storage, columnar files and warehouse',
      what: 'Cheap object storage holding Parquet-style files, with a warehouse such as BigQuery, Snowflake or Redshift on top for fast SQL.',
      why: 'Keeping raw files lets you rebuild any table later, and the warehouse gives analysts fast queries.',
      mustKnow: ['Columnar formats read only the columns a query needs', 'Partition by a column queries filter on, usually date', 'Cost comes from data scanned, so avoid select-star on big tables'],
      mistake: 'Partitioning by a high-cardinality column and ending up with millions of tiny files.',
    },
    {
      id: 'transform', name: 'SQL transformation (dbt-style models)',
      what: 'Versioned SQL models that turn raw tables into clean, documented, tested tables.',
      why: 'Putting the business logic in reviewed SQL means finance and product get the same revenue number.',
      mustKnow: ['Layer models: raw, cleaned, then business-ready', 'Define each metric once and reuse it', 'Add tests for unique keys, not-null and accepted values'],
      mistake: 'Copy-pasting the revenue calculation into five dashboards so they drift apart.',
    },
    {
      id: 'orchestrate', name: 'Orchestration (Airflow, Dagster or similar)',
      what: 'A scheduler that runs tasks in dependency order, retries failures and tracks every run.',
      why: 'Without it, a failed step silently leaves downstream tables stale.',
      mustKnow: ['Model dependencies explicitly', 'Backfill a date range safely', 'Alert on late or failed runs, not only on errors'],
      mistake: 'Scheduling jobs with cron at fixed times and hoping the upstream job has finished.',
    },
    {
      id: 'quality', name: 'Data quality, lineage and cost',
      what: 'Automated checks on freshness, volume and values, plus a map of which tables feed which dashboards.',
      why: 'Trust is the product: one wrong revenue number costs more than a day of downtime.',
      mustKnow: ['Check freshness, row counts and key uniqueness', 'Fail loudly before bad data reaches consumers', 'Track warehouse cost per pipeline'],
      mistake: 'Only finding a broken pipeline when an executive asks why the dashboard looks wrong.',
    },
  ],
}
