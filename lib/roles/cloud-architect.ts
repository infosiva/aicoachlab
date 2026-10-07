import type { Role } from './types'

export const CLOUD_ARCHITECT: Role = {
  slug: 'cloud-solutions-architect',
  title: 'Cloud Solutions Architect',
  blurb: 'Designs how an application is laid out on a cloud platform so it is secure, resilient and affordable to run.',
  asOf: '2026-10',
  demand: [],
  scenario: {
    title: 'Moving a booking web app from one server to the cloud',
    story:
      'A small travel company runs its booking site on a single rented server that goes down during busy weekends. You design its move to a managed cloud setup that survives a failure and has a cost the owners can predict.',
  },
  steps: [
    { stackId: 'requirements', label: 'Requirements', happens: 'Write down traffic, acceptable downtime, data rules and budget before drawing anything.' },
    { stackId: 'network', label: 'Network and identity', happens: 'Create a private network, split public and private subnets and give each service least-privilege access.' },
    { stackId: 'compute', label: 'Compute', happens: 'The web app runs as containers behind a load balancer across two availability zones.' },
    { stackId: 'data', label: 'Data', happens: 'A managed relational database with automated backups replaces the database on the old server.' },
    { stackId: 'iac', label: 'Infrastructure as code', happens: 'The whole design is written in Terraform so a second environment can be created from it.' },
    { stackId: 'cost', label: 'Cost and resilience', happens: 'Budgets, tagging and a failure drill confirm the design is affordable and survives a zone loss.' },
  ],
  stack: [
    {
      id: 'requirements', name: 'Requirements and trade-offs',
      what: 'Turning business needs into targets for availability, recovery time, data location and cost.',
      why: 'An architecture is only right relative to what the business needs, and those needs differ for every system.',
      mustKnow: ['Ask for recovery time and recovery point targets', 'Separate must-have from nice-to-have', 'Write down the trade-off behind each major choice'],
      mistake: 'Designing a multi-region setup for a site that can honestly tolerate an hour of downtime.',
    },
    {
      id: 'network', name: 'Networking and identity (VPC, IAM)',
      what: 'Private networks, subnets, security groups and the identity and permission system that controls who can touch what.',
      why: 'Most cloud breaches come from open networks and over-broad permissions, so this is the foundation.',
      mustKnow: ['Keep databases in private subnets', 'Give each service its own role with minimum permissions', 'Use short-lived credentials instead of long-lived keys'],
      mistake: 'Attaching an administrator role to an application so it just works.',
    },
    {
      id: 'compute', name: 'Compute options (VMs, containers, serverless)',
      what: 'The choice of where code runs: virtual machines, a container service such as ECS or Kubernetes, or functions.',
      why: 'Containers on a managed service suit a steady web app without the work of running servers.',
      mustKnow: ['More managed means less operations work but less control', 'Run across at least two availability zones', 'Put a load balancer with health checks in front'],
      mistake: 'Choosing Kubernetes for a single small app and spending the savings on operating it.',
    },
    {
      id: 'data', name: 'Managed data services and backups',
      what: 'Managed databases, object storage and caches with built-in replication and backup.',
      why: 'Backups, patching and failover are easy to get wrong by hand and cheap to rent.',
      mustKnow: ['Enable automated backups and test a restore', 'Choose storage by access pattern: relational, key-value or object', 'Encrypt data at rest and in transit'],
      mistake: 'Having backups but never testing that one can actually be restored.',
    },
    {
      id: 'iac', name: 'Infrastructure as code (Terraform)',
      what: 'Describing cloud resources in versioned files that a tool creates and updates for you.',
      why: 'The design becomes reviewable and repeatable for test, staging and production.',
      mustKnow: ['Keep state in a shared remote backend with locking', 'Split environments cleanly', 'Review the plan output before every apply'],
      mistake: 'Clicking resources together in the console and never being able to rebuild them.',
    },
    {
      id: 'cost', name: 'Cost, resilience and well-architected review',
      what: 'Budgets, tagging and regular reviews against the cloud provider\'s well-architected guidance, plus failure drills.',
      why: 'A design that nobody can afford, or that breaks when a zone fails, has not met the brief.',
      mustKnow: ['Tag resources by team and environment', 'Set budget alerts early', 'Rehearse a zone failure instead of assuming it works'],
      mistake: 'Leaving unused test environments running for months.',
    },
  ],
}
