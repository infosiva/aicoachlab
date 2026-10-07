import type { Role } from './types'

export const DATABASE_ENGINEER: Role = {
  slug: 'database-engineer',
  title: 'Database Engineer',
  blurb: 'Designs, tunes and protects the databases that applications depend on, so data stays correct, fast and recoverable.',
  asOf: '2026-10',
  demand: [],
  scenario: {
    title: 'Fixing a slow orders database for a growing marketplace',
    story:
      'A marketplace app stores orders in PostgreSQL and its order-history page now takes several seconds to load. You find the slow queries, fix the schema and indexes, ship a safe migration and prove the data can be restored.',
  },
  steps: [
    { stackId: 'modeling', label: 'Model data', happens: 'Review the tables for sensible keys, relationships and data types, and note where the schema is fighting the app.' },
    { stackId: 'queries', label: 'Find slow queries', happens: 'Slow-query statistics point to the order-history query that scans the whole orders table.' },
    { stackId: 'indexing', label: 'Index and tune', happens: 'A composite index and a rewritten query bring the page back to milliseconds.' },
    { stackId: 'migrations', label: 'Migrate safely', happens: 'The schema change ships as a versioned migration that does not lock the live table.' },
    { stackId: 'backup', label: 'Back up and restore', happens: 'Backups with point-in-time recovery are enabled, and a restore is rehearsed on a copy.' },
    { stackId: 'scale', label: 'Plan for scale', happens: 'A read replica and connection pooling are added so reporting does not slow checkout.' },
  ],
  stack: [
    {
      id: 'modeling', name: 'Data modeling and normalization',
      what: 'Deciding the tables, keys, relationships and column types that represent the business correctly.',
      why: 'A weak model makes every later query harder and lets inconsistent data in.',
      mustKnow: ['Use primary and foreign keys and let the database enforce them', 'Normalize first, then denormalize deliberately where reads need it', 'Pick precise types, such as numeric for money'],
      mistake: 'Storing money in a floating-point column or comma-separated ids in a text field.',
    },
    {
      id: 'queries', name: 'Query analysis (EXPLAIN, pg_stat_statements)',
      what: 'Reading query plans and execution statistics to see why a query is slow.',
      why: 'Measuring first stops you from adding indexes that do nothing.',
      mustKnow: ['EXPLAIN ANALYZE shows the real plan and timings', 'A sequential scan on a big table is a signal, not always a bug', 'Fix the worst queries by total time, not just the slowest single one'],
      mistake: 'Guessing which column to index without ever reading the plan.',
    },
    {
      id: 'indexing', name: 'Indexing strategy',
      what: 'Creating structures such as B-tree indexes that let the database find rows without scanning everything.',
      why: 'The right index turns a seconds-long order-history query into a millisecond one.',
      mustKnow: ['Column order in a composite index matters', 'Indexes slow writes and use storage', 'Partial and covering indexes fit specific queries'],
      mistake: 'Indexing every column and then wondering why inserts got slow.',
    },
    {
      id: 'migrations', name: 'Schema migrations (Flyway, Liquibase, Alembic)',
      what: 'Versioned scripts that change a live schema in a controlled, repeatable order.',
      why: 'Schema changes are the riskiest routine change, and they must not take the app down.',
      mustKnow: ['Make changes backward-compatible so old and new code both work during rollout', 'Build indexes concurrently on large tables', 'Test the migration on a copy of production-size data'],
      mistake: 'Adding a column with a default on a huge table and locking it during peak hours.',
    },
    {
      id: 'backup', name: 'Backup, recovery and replication',
      what: 'Regular backups, write-ahead log archiving for point-in-time recovery and replicas for failover.',
      why: 'The only backup that counts is one you have restored.',
      mustKnow: ['Know the recovery time and recovery point you promise', 'Practice a restore on a schedule', 'A replica is not a backup, since it copies mistakes too'],
      mistake: 'Treating a read replica as a backup and losing data to an accidental delete.',
    },
    {
      id: 'scale', name: 'Scaling and operations (pooling, replicas, partitioning)',
      what: 'Techniques for handling more load: connection pooling, read replicas and partitioning large tables.',
      why: 'Reporting and checkout should not compete for the same database capacity.',
      mustKnow: ['Use a pooler such as PgBouncer because connections are expensive', 'Replicas can lag, so route reads carefully', 'Scale vertically and tune before adding complexity'],
      mistake: 'Sharding early when a bigger instance and one good index would have solved it.',
    },
  ],
}
