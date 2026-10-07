import type { Role } from './types'

export const DATA_ANALYST: Role = {
  slug: 'data-analyst',
  title: 'Data Analyst',
  blurb: 'Answers business questions with clean queries and clear dashboards that people trust enough to act on.',
  asOf: '2026-10',
  demand: [],
  scenario: {
    title: 'Weekly sales dashboard for an online shop',
    story:
      'The owner of an online shop sees three different revenue numbers in three spreadsheets and cannot tell why sales dipped last month. You build one dashboard on the order data that explains what changed by product, channel and region.',
  },
  steps: [
    { stackId: 'question', label: 'Clarify the question', happens: 'Ask what decision the dashboard supports and agree on definitions such as "revenue" and "active customer".' },
    { stackId: 'sql', label: 'Query the data', happens: 'Write SQL against the orders, customers and products tables, with refunds and test orders excluded.' },
    { stackId: 'clean', label: 'Clean and check', happens: 'Reconcile totals with finance, remove duplicates and fix mismatched date or currency formats.' },
    { stackId: 'analyse', label: 'Find the cause', happens: 'Break the dip down by channel, product and region and compare against the same weeks last year.' },
    { stackId: 'bi', label: 'Build the dashboard', happens: 'Put the key numbers, a trend line and the main breakdowns in a BI tool with filters for date and region.' },
    { stackId: 'story', label: 'Share the story', happens: 'Present three findings and one recommendation, and note what the data cannot tell yet.' },
  ],
  stack: [
    {
      id: 'question', name: 'Question framing and metric definitions',
      what: 'Turning a request like "why are sales down" into specific questions and written metric definitions.',
      why: 'Three revenue numbers usually mean three unwritten definitions, and the dashboard fails until they are agreed.',
      mustKnow: ['Ask what decision the answer will change', 'Write each metric definition down once', 'Confirm the time period, filters and exclusions'],
      mistake: 'Building a dashboard first and discovering later that nobody agrees on what revenue means.',
    },
    {
      id: 'sql', name: 'SQL',
      what: 'The language for reading, joining and aggregating data held in databases and warehouses.',
      why: 'Almost all business data sits in tables, and SQL is the one skill every analyst team shares.',
      mustKnow: ['Joins and how a bad join multiplies rows', 'GROUP BY, window functions and CTEs', 'Filter early and avoid select-star on large tables'],
      mistake: 'Joining orders to line items and summing order totals, which counts each order several times.',
    },
    {
      id: 'clean', name: 'Spreadsheets and data cleaning',
      what: 'Checking and fixing data in Excel or Google Sheets and in query results, including quick one-off analysis.',
      why: 'Stakeholders live in spreadsheets, and reconciling against their numbers builds trust.',
      mustKnow: ['Pivot tables, lookups and basic formulas', 'Reconcile your total against a known source', 'Document every filter or fix you applied'],
      mistake: 'Hand-editing numbers in an exported file so nobody can repeat the result.',
    },
    {
      id: 'analyse', name: 'Descriptive statistics and Python or R basics',
      what: 'Summaries, comparisons and trends, with pandas or R when a query alone is not enough.',
      why: 'Finding why sales dipped needs comparisons over time and across groups, not just totals.',
      mustKnow: ['Mean versus median and when outliers matter', 'Compare like with like, such as the same weeks last year', 'Correlation does not show cause'],
      mistake: 'Calling a one-week change a trend without checking normal weekly variation.',
    },
    {
      id: 'bi', name: 'BI tools (Power BI, Tableau, Looker Studio)',
      what: 'Tools that connect to data and turn queries into interactive charts and dashboards.',
      why: 'The owner needs a link to open every Monday, not a spreadsheet that arrives by email.',
      mustKnow: ['Connect to a governed table instead of copying data', 'Choose the chart that fits the question, not the fanciest one', 'Keep each dashboard to one audience and one purpose'],
      mistake: 'Putting 25 charts on one page so the actual answer is buried.',
    },
    {
      id: 'story', name: 'Data storytelling and communication',
      what: 'Presenting findings as a short narrative with a clear recommendation and honest limits.',
      why: 'An accurate analysis that nobody understands changes nothing.',
      mustKnow: ['Lead with the answer, then the evidence', 'Label axes and annotate the key change on the chart', 'State what the data cannot show'],
      mistake: 'Walking through every query step instead of stating the finding and what to do next.',
    },
  ],
}
