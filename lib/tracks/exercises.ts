export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Exercise {
  slug: string
  title: string
  difficulty: Difficulty
  tags: string[]
  estimatedMins: number
  question: string
  hints: string[]
  modelAnswer: string
  scoringCriteria: string[]
}

export interface Track {
  id: string
  label: string
  icon: string
  color: string
  glow: string
  description: string
  exercises: Exercise[]
}

export const TRACKS: Track[] = [
  {
    id: 'behavioural',
    label: 'Behavioural',
    icon: '◎',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.35)',
    description: 'STAR method, leadership, conflict, growth mindset',
    exercises: [
      {
        slug: 'tell-me-about-yourself',
        title: 'Tell me about yourself',
        difficulty: 'easy',
        tags: ['intro', 'storytelling'],
        estimatedMins: 5,
        question: 'Tell me about yourself. Walk me through your background and why you\'re interested in this role.',
        hints: [
          'Structure: Present → Past → Future',
          'Keep it under 2 minutes',
          'End with why this role specifically',
        ],
        modelAnswer: `Start with your current role and impact: "I'm a software engineer at X, where I lead backend infrastructure for our payments service — we process $2M daily."

Then bridge to key past experience: "Before that I spent 3 years at Y scaling their recommendation engine from 10k to 5M users, which gave me deep experience in distributed systems under real load."

Close with forward intent tied to this role: "I'm looking for a team where I can take on more architectural ownership. From what I read about your platform challenges, this feels like exactly that opportunity."

Key: specific numbers + company names + a tailored closing line. Generic answers like "I'm a passionate engineer who loves challenges" score zero.`,
        scoringCriteria: [
          'Clear present → past → future structure',
          'At least one specific metric or achievement',
          'Connects to the role/company explicitly',
          'Under 2 minutes when spoken aloud',
        ],
      },
      {
        slug: 'biggest-challenge',
        title: 'Biggest technical challenge',
        difficulty: 'easy',
        tags: ['STAR', 'problem-solving'],
        estimatedMins: 8,
        question: 'Tell me about the most technically challenging project you\'ve worked on. What made it hard and how did you overcome it?',
        hints: [
          'Use STAR: Situation → Task → Action → Result',
          'The "Action" part should take 60% of your answer',
          'Quantify the result — before vs after metrics',
        ],
        modelAnswer: `Situation: "At my last company, our search latency spiked to 8 seconds during peak traffic after we crossed 10M products — users were abandoning at a 40% rate."

Task: "I was the only backend engineer available and had 2 weeks before Black Friday."

Action (most important — be specific): "I profiled the query path and found the bottleneck was N+1 queries hitting Postgres. I refactored to batch queries, added Elasticsearch for full-text search, and implemented a Redis cache layer for hot products. The trickiest part was keeping the cache consistent with near-real-time inventory changes — I solved this with write-through caching + a short 30s TTL on price data."

Result: "Search latency dropped from 8s to 180ms p99. Cart conversion improved 22% that Black Friday."

Common mistakes: vague actions ("I optimised the code"), no metrics, saying "we" without explaining your specific contribution.`,
        scoringCriteria: [
          'Clear STAR structure',
          'Specific technical actions (not vague "optimised")',
          'Quantified result with before/after metrics',
          'Your specific contribution made clear',
        ],
      },
      {
        slug: 'conflict-with-colleague',
        title: 'Conflict with a colleague',
        difficulty: 'medium',
        tags: ['STAR', 'leadership', 'conflict'],
        estimatedMins: 8,
        question: 'Tell me about a time you had a significant disagreement with a colleague or manager. How did you handle it and what was the outcome?',
        hints: [
          'Pick a real technical or process disagreement — not a personality clash',
          'Show you listened to their view first before asserting yours',
          'The outcome should show growth, not just "I was right"',
        ],
        modelAnswer: `Situation: "My tech lead wanted to ship a feature with a hard-coded API key in environment variables committed to the repo — under pressure to meet a deadline."

Task: "I disagreed strongly on security grounds but needed to handle it without damaging the relationship or missing the deadline."

Action: "I first asked to hear their reasoning — turns out they believed our private repo meant it was safe. I shared two concrete examples of private repos being leaked and proposed a 3-hour solution: AWS Secrets Manager. I wrote the integration, tested it, and we shipped on time."

Result: "Feature shipped on deadline, no security compromise. The tech lead later made Secrets Manager the team standard. We now have a stronger working relationship because I framed it as problem-solving together, not a confrontation."

What makes this answer strong: you show emotional intelligence (listened first), technical credibility (proposed a concrete solution), and a collaborative outcome.`,
        scoringCriteria: [
          'Chose a substantive disagreement (not trivial)',
          'Showed empathy — listened to other side first',
          'Proposed a concrete resolution, not just escalated',
          'Outcome was positive for team/project, not just "I won"',
        ],
      },
      {
        slug: 'failure-and-learning',
        title: 'Biggest failure',
        difficulty: 'medium',
        tags: ['STAR', 'self-awareness', 'growth'],
        estimatedMins: 8,
        question: 'Tell me about your biggest professional failure. What happened and what did you learn?',
        hints: [
          'Pick something real — interviewers can tell when you dress up a non-failure',
          'The learning should be specific and show behavioural change',
          'Don\'t over-apologise — be matter-of-fact',
        ],
        modelAnswer: `Situation: "In 2022 I shipped a database migration on a Friday afternoon without a rollback plan — standard at my previous company but wrong."

What happened: "The migration ran 3x longer than expected due to table locking, taking down our checkout for 47 minutes. $80k in lost revenue."

What I did immediately: "I escalated to leadership within 5 minutes, kept stakeholders updated every 10 minutes, and we restored service by killing the migration and reverting."

Learning (be specific): "I now follow a migration checklist I wrote after this incident: always run EXPLAIN ANALYZE first, always have a one-command rollback ready, never deploy schema changes on Fridays, and always pair with a second engineer for risky ops."

Behavioural change shown: "This checklist caught two potential issues in the following year before they hit production."

What makes this strong: it's a real failure with real numbers, you show accountability without self-flagellation, and the learning is demonstrated by concrete behaviour change — not just "I learned to be more careful."`,
        scoringCriteria: [
          'Real, substantive failure (not repackaged success)',
          'Clear accountability — no blaming others',
          'Specific, actionable learning',
          'Evidence of behavioural change since',
        ],
      },
      {
        slug: 'influence-without-authority',
        title: 'Influence without authority',
        difficulty: 'hard',
        tags: ['leadership', 'stakeholders', 'STAR'],
        estimatedMins: 10,
        question: 'Tell me about a time you influenced a significant decision without having formal authority to make it.',
        hints: [
          'This tests leadership potential at senior+ levels',
          'Show data-driven persuasion, not politics',
          'The decision should have meaningful business impact',
        ],
        modelAnswer: `Situation: "Our company was about to purchase a $200k/year third-party analytics platform. I was a mid-level engineer with no decision-making authority, but I believed we were overbuying."

Task: "I had 2 weeks before the contract was signed."

Action: "I built a working prototype of an in-house solution using ClickHouse in one weekend, documented the cost ($12k/year infrastructure vs $200k), and mapped feature parity — we'd get 90% of what we needed. I didn't go to my manager with a complaint; I requested 30 minutes with the VP of Engineering to present a data-driven alternative. I anticipated their top objections (maintenance burden, team capacity) and came with solutions: a dedicated 2-sprint build, a maintenance SLA, and a decision framework for when to revisit."

Result: "The vendor contract was cancelled. We shipped the in-house solution in 6 weeks. It's now used by every team. I was promoted to tech lead 3 months later."

Key pattern: you came with a solution, not a problem. You used data, not opinion. You made it easy to say yes by removing their objections upfront.`,
        scoringCriteria: [
          'Meaningful decision with real stakes',
          'Used data/evidence to persuade, not hierarchy or politics',
          'Anticipated and addressed objections proactively',
          'Measurable outcome with career or business impact',
        ],
      },
    ],
  },
  {
    id: 'system-design',
    label: 'System Design',
    icon: '⬡',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.35)',
    description: 'Scale, distributed systems, architecture trade-offs',
    exercises: [
      {
        slug: 'design-url-shortener',
        title: 'Design a URL shortener',
        difficulty: 'easy',
        tags: ['hashing', 'database', 'scale'],
        estimatedMins: 20,
        question: 'Design a URL shortening service like bit.ly. The system should handle 100M URLs, 10K writes/sec, 100K reads/sec.',
        hints: [
          'Start with requirements clarification before jumping to solution',
          'Calculate storage: 100M URLs × ~500 bytes = ~50GB — manageable',
          'Reads vastly outnumber writes — design for read performance',
          'Base62 encoding of a counter gives you short, unique IDs',
        ],
        modelAnswer: `**Requirements clarification (always start here)**
- Functional: create short URL, redirect to original, optionally custom alias
- Non-functional: 100M URLs, 10K writes/sec, 100K reads/sec, <10ms redirect latency, 99.9% uptime

**Capacity estimation**
- 10K writes/sec × 86400s = 864M writes/day → ~100M URLs over time with deletions
- Storage: 100M × 500 bytes = 50GB → single PostgreSQL node handles this fine
- Read QPS: 100K/sec → need caching

**Core design**
- API: POST /shorten → returns {short_url}, GET /{code} → 301 redirect
- ID generation: Auto-increment counter encoded in Base62 (a-zA-Z0-9). Counter = 1M → "4c92" (7 chars gives 62^7 = 3.5T URLs)
- Storage: PostgreSQL table (id, original_url, short_code, created_at, user_id). Index on short_code.
- Cache: Redis with LRU eviction. Cache top 20% of hot URLs → handles ~80% of read traffic. TTL: 24h. Cache-aside pattern.

**Redirect flow**
Client → CDN edge (if cached) → App server → Redis → PostgreSQL → 301 to original URL

**Scaling reads**
- CDN at edge for popular URLs
- Redis cluster with read replicas
- Horizontal app servers behind load balancer

**Trade-offs discussed**
- 301 (permanent) vs 302 (temporary): 301 caches at browser → fewer hits, less analytics. 302 → every redirect hits server → better analytics. Use 302 if analytics matter.
- Custom aliases: prefix with user_id to namespace, check collision on write.
- Deletion: soft delete (mark inactive) to avoid reusing codes that might be cached.`,
        scoringCriteria: [
          'Started with requirements clarification',
          'Back-of-envelope capacity estimation',
          'Correct ID generation approach (Base62/hash)',
          'Caching strategy for read-heavy load',
          'At least one trade-off discussed explicitly',
        ],
      },
      {
        slug: 'design-rate-limiter',
        title: 'Design a rate limiter',
        difficulty: 'medium',
        tags: ['distributed systems', 'algorithms', 'API'],
        estimatedMins: 20,
        question: 'Design a rate limiter that can throttle API requests at 1000 req/min per user. It must work across a distributed fleet of 50 app servers.',
        hints: [
          'Single-server solution is trivial — the challenge is distributed consistency',
          'Know the 4 main algorithms: fixed window, sliding window log, sliding window counter, token bucket',
          'Redis atomic operations (INCR + EXPIRE, or Lua scripts) are key',
          'Where to place the rate limiter: client, API gateway, or middleware?',
        ],
        modelAnswer: `**Where to enforce**
API Gateway or middleware — not client (clients can bypass). Gateway means single enforcement point.

**Algorithm comparison**
- Fixed window: simple, but burst allowed at window boundary (spike of 2000 req in 2 seconds)
- Sliding window log: accurate, but stores per-request timestamps → memory-heavy
- Sliding window counter: best balance — approximate but memory-efficient
- Token bucket: good for burst allowance (allow 50 req burst, then 1000/min steady)

**Recommended: Sliding window counter with Redis**

For each user + window:
1. key = "rl:{user_id}:{current_minute}"
2. INCR key → count
3. EXPIRE key 120 (2 windows for safety)
4. If count > 1000 → return 429

Sliding approximation: count = prev_window_count × (1 - elapsed/60) + current_window_count

**Distributed consistency**
- Redis as central store → all 50 servers share state
- Redis INCR is atomic — no race conditions
- For ultra-low latency: local in-memory counter + sync to Redis every 1s (accept slight over-counting)

**Redis data structure**
- Simple: String key with INCR
- Better: Redis sorted set for sliding window log (ZADD + ZCOUNT + ZREMRANGEBYSCORE)

**Rate limit headers (return to clients)**
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 743
X-RateLimit-Reset: 1716984060

**Failure modes**
- Redis down: fail open (allow requests) or fail closed (block) — business decision
- Network partition: local counters with eventual sync → slight over-limit acceptable

**Scaling Redis**
- Redis cluster with consistent hashing on user_id
- Read replicas for status checks, writes always to primary`,
        scoringCriteria: [
          'Compared at least 2 algorithms with trade-offs',
          'Correctly identified distributed consistency as the key challenge',
          'Redis atomic operations as the solution',
          'Discussed failure modes (Redis down)',
          'Mentioned rate limit headers in response',
        ],
      },
      {
        slug: 'design-newsfeed',
        title: 'Design a social newsfeed',
        difficulty: 'hard',
        tags: ['fanout', 'ranking', 'social graph', 'scale'],
        estimatedMins: 30,
        question: 'Design a social media newsfeed like Twitter/X or Facebook Feed. Support 500M users, celebrities with 10M followers, reads at 500K QPS.',
        hints: [
          'Key challenge: celebrity posts — fan-out-on-write creates 10M writes per post',
          'Fan-out-on-write vs fan-out-on-read — hybrid is the answer',
          'Ranking: chronological vs ML-ranked — at scale, ML ranking happens offline',
          'Pre-compute feeds for active users only',
        ],
        modelAnswer: `**Requirements**
- Functional: post content, follow users, read personalised feed, ~100 posts per feed load
- Non-functional: 500M users, 500K QPS reads, 5K QPS writes, feed latency <100ms

**Core components**
1. Post service: write posts to DB, publish event to message queue
2. Feed service: assemble and serve personalised feed
3. Follow graph: stored in graph DB (Neo4j) or Redis sorted set

**The fan-out problem**
- 10M followers × 1 post = 10M writes. At 5K posts/sec from celebrities: 50B writes/sec → impossible with fan-out-on-write alone
- Fan-out-on-read: on load, fetch follows → query all their recent posts → merge → rank. Too slow at 500K QPS.

**Hybrid approach (used by Twitter, Facebook)**
- Regular users (<10K followers): fan-out-on-write → push post_id to each follower's feed cache (Redis sorted set, score=timestamp)
- Celebrities (>10K followers): fan-out-on-read — at feed load time, fetch celebrity posts separately and merge

**Feed cache per user (Redis)**
key: feed:{user_id}
value: sorted set of post_ids, score = timestamp
Max 1000 entries per feed. ZRANGE to read, ZADD on new post.

**Feed load flow**
1. Read user's feed cache (Redis) → get post_ids
2. For each followed celebrity: fetch their latest posts (separate celebrity post cache)
3. Merge + rank (client-side or feed service)
4. Fetch post content + user metadata in batch (Redis or Cassandra)

**Ranking**
- Chronological: simple, use sorted set score
- ML-ranked: offline job scores posts → store ranked feed. Stale by ~5min but acceptable.

**Storage**
- Posts: Cassandra (wide column, write-heavy, time-series)
- User metadata: PostgreSQL
- Feed cache: Redis cluster partitioned by user_id
- Media: S3 + CDN

**Numbers**
- 500M users × 1KB feed metadata = 500GB Redis → cluster of 10 × 64GB Redis nodes
- Cassandra: 5K writes/sec × 1KB = 5MB/sec — trivial`,
        scoringCriteria: [
          'Identified fan-out as the core challenge',
          'Proposed hybrid fan-out (write for regular, read for celebrities)',
          'Redis sorted set as the feed cache',
          'Discussed ranking strategy',
          'Storage choice justified (Cassandra for posts)',
        ],
      },
    ],
  },
  {
    id: 'swe',
    label: 'Software Engineer',
    icon: '{ }',
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.35)',
    description: 'DSA concepts, architecture, debugging, code quality',
    exercises: [
      {
        slug: 'explain-hash-map',
        title: 'Hash map internals',
        difficulty: 'easy',
        tags: ['data structures', 'hashing'],
        estimatedMins: 8,
        question: 'Explain how a hash map works internally. What happens during a collision? What is the time complexity of get/set operations and why?',
        hints: [
          'Array of buckets + hash function → index',
          'Two collision strategies: chaining (linked list per bucket) vs open addressing (linear probe)',
          'Load factor triggers resize — explain why and when',
        ],
        modelAnswer: `**Core structure**
A hash map is an array of buckets. To store key-value pair:
1. hash(key) → large integer
2. index = hash % array_size → bucket index
3. Store (key, value) in that bucket

**Collision handling**
Two keys can hash to the same index (collision). Two strategies:

*Chaining*: Each bucket holds a linked list. On collision, append to the list. Java HashMap uses this.

*Open addressing*: On collision, probe to next empty slot (linear probing: index+1, index+2...). Python dict uses a variant of this.

**Time complexity**
- Average case: O(1) get/set — one array lookup + short chain traversal
- Worst case: O(n) — if all keys hash to same bucket (degenerate case)

**Load factor and resize**
Load factor = n_elements / array_size. When load factor > 0.75 (Java default):
- Allocate new array 2× size
- Rehash all entries into new array
- O(n) resize, but amortised O(1) per insert over many inserts

**Why amortised O(1)?**
Each element is rehashed at most O(log n) times over its lifetime. Total cost spread across all operations = O(1) per operation.

**Good hash function properties**
- Deterministic (same input → same output always)
- Uniform distribution (minimises collisions)
- Fast to compute
Python's hash() for strings uses SipHash; Java uses polynomial rolling hash.`,
        scoringCriteria: [
          'Correctly described array + hash function structure',
          'Explained at least one collision strategy',
          'Gave correct O(1) average, O(n) worst case with reasoning',
          'Mentioned load factor and resize',
        ],
      },
      {
        slug: 'concurrency-race-condition',
        title: 'Race conditions and fixes',
        difficulty: 'medium',
        tags: ['concurrency', 'threading', 'debugging'],
        estimatedMins: 10,
        question: 'What is a race condition? Give a concrete code example and explain three different ways to fix it.',
        hints: [
          'Show a simple counter increment as the example',
          'Three fixes: mutex/lock, atomic operations, queue-based serialisation',
          'Explain why the naive fix (check-then-act) doesn\'t work',
        ],
        modelAnswer: `**Definition**
A race condition occurs when the correctness of a program depends on the relative timing of events in concurrent threads — specifically when multiple threads read-modify-write shared state without synchronisation.

**Concrete example: counter increment**
\`\`\`python
counter = 0  # shared

def increment():
    global counter
    # Thread 1: reads counter = 5
    # Thread 2: reads counter = 5  (before Thread 1 writes!)
    # Thread 1: writes counter = 6
    # Thread 2: writes counter = 6  (should be 7!)
    counter += 1  # NOT atomic — this is read + add + write
\`\`\`

**Fix 1: Mutex/Lock**
\`\`\`python
import threading
lock = threading.Lock()

def increment():
    global counter
    with lock:
        counter += 1  # only one thread enters at a time
\`\`\`
Downside: contention bottleneck if many threads fight for the lock.

**Fix 2: Atomic operations**
\`\`\`python
import ctypes  # or use concurrent.futures + multiprocessing.Value
from multiprocessing import Value
counter = Value('i', 0)

def increment():
    with counter.get_lock():
        counter.value += 1
\`\`\`
Modern CPUs provide atomic instructions (LOCK XADD on x86) — no OS-level lock needed. Faster than mutex for simple operations.

**Fix 3: Queue-based serialisation (actor model)**
\`\`\`python
from queue import Queue
import threading

queue = Queue()
counter = 0

def worker():
    global counter
    while True:
        queue.get()  # blocks until message arrives
        counter += 1

# All increments go through one thread — no shared state
threading.Thread(target=worker, daemon=True).start()
queue.put('increment')  # from any thread
\`\`\`
Avoids shared state entirely — one thread owns the counter. Scales to complex logic.

**Why "check-then-act" naive fixes fail**
\`\`\`python
if counter < MAX:  # Thread 1 checks → True
    # Thread 2 also checks → True (both pass!)
    counter += 1   # Both increment → exceeds MAX
\`\`\`
Check and act must be atomic together, not separately.`,
        scoringCriteria: [
          'Correct definition with timing dependency explained',
          'Concrete code example showing the non-atomic read-modify-write',
          'At least 2 distinct fix strategies with code',
          'Discussed why check-then-act naive fix fails',
        ],
      },
      {
        slug: 'solid-principles',
        title: 'SOLID principles with examples',
        difficulty: 'medium',
        tags: ['OOP', 'design patterns', 'architecture'],
        estimatedMins: 12,
        question: 'Explain the SOLID principles. For each, give a one-line rule and a concrete real-world code example that violates it and how to fix it.',
        hints: [
          'S: one reason to change. O: open for extension, closed for modification. L: subtypes must be substitutable. I: don\'t force unused interfaces. D: depend on abstractions.',
          'Pick violations from real systems — payment processors, loggers, notification services work well',
        ],
        modelAnswer: `**S — Single Responsibility**
Rule: A class should have only one reason to change.

Violation: \`UserService\` that handles auth, sends emails, AND writes to DB.
Fix: Split into \`AuthService\`, \`EmailService\`, \`UserRepository\`.

**O — Open/Closed**
Rule: Open for extension, closed for modification.

Violation:
\`\`\`python
def calculate_discount(user_type):
    if user_type == 'premium': return 0.2
    if user_type == 'student': return 0.1
    # Adding 'senior' requires editing this function
\`\`\`
Fix: Strategy pattern — each discount type is a class implementing \`get_discount()\`. Adding 'senior' = new class, zero modification.

**L — Liskov Substitution**
Rule: Subclasses must be substitutable for their parent class.

Violation: \`Square extends Rectangle\`. Setting width on a Square also sets height — breaks Rectangle contract.
Fix: Don't inherit — use composition or separate abstractions (\`Shape\` interface).

**I — Interface Segregation**
Rule: Don't force classes to implement methods they don't use.

Violation: \`IWorker\` with \`work()\` and \`eat()\`. \`Robot\` implements \`IWorker\` but has to stub \`eat()\`.
Fix: Split into \`IWorkable\` and \`IFeedable\`. Robot only implements \`IWorkable\`.

**D — Dependency Inversion**
Rule: High-level modules should depend on abstractions, not concrete implementations.

Violation:
\`\`\`python
class OrderService:
    def __init__(self):
        self.emailer = SendGridEmailer()  # concrete dependency
\`\`\`
Fix:
\`\`\`python
class OrderService:
    def __init__(self, emailer: IEmailer):  # depends on interface
        self.emailer = emailer
# Inject SendGridEmailer or MockEmailer at runtime
\`\`\`
This makes testing trivial (inject mock) and switching providers zero-risk.`,
        scoringCriteria: [
          'All 5 principles named and defined correctly',
          'At least 3 concrete violations shown (not just abstract descriptions)',
          'Dependency Inversion — distinguished from Dependency Injection',
          'LSP — explained the Square/Rectangle problem',
        ],
      },
    ],
  },
  {
    id: 'pm',
    label: 'Product Manager',
    icon: '◈',
    color: '#0ea5e9',
    glow: 'rgba(14,165,233,0.35)',
    description: 'Strategy, metrics, prioritisation, user research',
    exercises: [
      {
        slug: 'define-success-metrics',
        title: 'Define success metrics for a feature',
        difficulty: 'easy',
        tags: ['metrics', 'analytics', 'frameworks'],
        estimatedMins: 8,
        question: 'You\'ve just shipped a new onboarding flow for a B2C mobile app. How do you define success? Walk me through your metrics framework.',
        hints: [
          'Use the HEART framework (Happiness, Engagement, Adoption, Retention, Task Success) or North Star + guardrails',
          'Separate leading indicators from lagging indicators',
          'Always include guardrail metrics — things that should NOT degrade',
        ],
        modelAnswer: `**Framework: North Star + Signal metrics + Guardrails**

**North Star**: 7-day retention rate of users who completed onboarding (the ultimate measure of onboarding quality — did we set users up to succeed?)

**Signal metrics (leading indicators — visible within days)**
- Onboarding completion rate: % who reach final step (target: >60%)
- Drop-off by step: funnel chart — where are users leaving?
- Time to first value: how long until users perform the core action (e.g., first post, first purchase)?
- Aha moment reach rate: % who hit your known "aha moment" action within Day 1

**Guardrail metrics (should NOT degrade)**
- Day 1 retention (must not drop vs. old flow)
- Support ticket volume tagged "onboarding" (increase = confusing flow)
- App store ratings (sudden drop signals friction)

**Measurement plan**
- Run A/B test: new vs old onboarding for 2 weeks
- Segment by acquisition channel (organic vs paid have different intent)
- Cohort analysis: D1/D7/D30 retention by onboarding variant

**What a bad answer looks like**: "I'd track signups and DAU." These are too upstream from the onboarding specifically and don't tell you if the new flow is better than the old one.`,
        scoringCriteria: [
          'Clear north star metric tied to business outcome',
          'Separate leading vs lagging indicators',
          'Guardrail metrics included',
          'Measurement plan (A/B test, cohorts)',
        ],
      },
      {
        slug: 'prioritise-feature-backlog',
        title: 'Prioritise a feature backlog',
        difficulty: 'medium',
        tags: ['prioritisation', 'frameworks', 'stakeholders'],
        estimatedMins: 10,
        question: 'Your engineering team has capacity for 3 features next quarter. You have 12 features requested by sales, customer success, and the CEO. Walk me through how you decide which 3 to build.',
        hints: [
          'Show a framework first (RICE, ICE, Impact/Effort matrix), then apply it',
          'Acknowledge that frameworks are tools — political and strategic context matters too',
          'The answer should show you can defend your decisions to different stakeholders',
        ],
        modelAnswer: `**Step 1: Gather inputs (don't prioritise in a vacuum)**
- Quantify each request: how many customers affected? What revenue at risk? What's the alternative (workaround cost)?
- Tag by theme: revenue protection, retention, acquisition, technical debt

**Step 2: Apply RICE scoring**
RICE = (Reach × Impact × Confidence) / Effort

Example:
| Feature | Reach | Impact | Confidence | Effort | RICE |
|---------|-------|--------|------------|--------|------|
| SSO login (sales ask) | 200 enterprise deals | 3 | 80% | 2 sprints | 240 |
| CSV export (CS ask) | 1000 current users | 2 | 90% | 0.5 sprints | 3600 |
| Dashboard redesign (CEO) | All users | 1 | 50% | 6 sprints | 83 |

→ CSV export wins despite being a "small" ask — low effort, high reach, high confidence

**Step 3: Sanity-check with strategic lens**
- Does this move our north star metric?
- Are any of these table-stakes for an upcoming launch or enterprise deal?
- Is there technical debt that blocks multiple features?

**Step 4: Communicate decisions**
- Don't say "your feature lost the prioritisation game"
- Say: "Feature X will have 5× more impact per engineering day. Here's the data. Feature Y is queued for Q3 and here's why."

**What makes this answer senior**: you show a framework, apply it with real numbers, acknowledge frameworks have limits, and demonstrate stakeholder communication skills.`,
        scoringCriteria: [
          'Named and correctly applied a scoring framework (RICE/ICE/MoSCoW)',
          'Showed how to gather data before scoring',
          'Applied strategic lens beyond just the formula',
          'Addressed stakeholder communication',
        ],
      },
    ],
  },
]

export function getTrack(id: string): Track | undefined {
  return TRACKS.find(t => t.id === id)
}

export function getExercise(trackId: string, slug: string): Exercise | undefined {
  return getTrack(trackId)?.exercises.find(e => e.slug === slug)
}

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard']
export const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
}
