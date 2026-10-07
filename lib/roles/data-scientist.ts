import type { Role } from './types'

export const DATA_SCIENTIST: Role = {
  slug: 'data-scientist',
  title: 'Data Scientist',
  blurb: 'Turns business questions into models and experiments, and proves with evidence whether they actually work.',
  asOf: '2026-10',
  demand: [],
  scenario: {
    title: 'Churn prediction for a subscription app',
    story:
      'A subscription app loses customers every month and the retention team contacts users at random. You build a model that ranks users by churn risk, test it against a simple baseline, and hand the team a list they can act on.',
  },
  steps: [
    { stackId: 'framing', label: 'Frame the problem', happens: 'Agree with retention what "churned" means, what action follows a prediction and how success will be measured.' },
    { stackId: 'explore', label: 'Explore the data', happens: 'Pull usage and billing history with SQL and Python, then check gaps, duplicates and leakage from after the churn date.' },
    { stackId: 'features', label: 'Build features', happens: 'Turn raw events into per-user features such as sessions in the last 30 days and failed payments.' },
    { stackId: 'model', label: 'Train and compare', happens: 'Fit a logistic regression baseline and a gradient-boosted model, split by time rather than at random.' },
    { stackId: 'experiment', label: 'Test in the real world', happens: 'Retention contacts the top-risk users and a held-out group gets no contact, so the lift is measured.' },
    { stackId: 'handoff', label: 'Hand off and monitor', happens: 'Scores are written to a table the team reads daily, with a check that the model still works as users change.' },
  ],
  stack: [
    {
      id: 'framing', name: 'Problem framing and metrics',
      what: 'Turning a vague business worry into a question a model can answer, with a metric that matches the decision.',
      why: 'A model that predicts churn well but triggers no useful action is wasted work.',
      mustKnow: ['Define the target and the prediction date precisely', 'Pick a metric tied to the action, such as precision for the top 1,000 users', 'Always compare against a simple baseline'],
      mistake: 'Starting to train models before agreeing what decision the prediction will change.',
    },
    {
      id: 'explore', name: 'SQL, Python and pandas',
      what: 'Querying the warehouse with SQL and analysing the result in Python with pandas, in a notebook.',
      why: 'Most of the work is reading and cleaning data, and these are the tools every team already uses.',
      mustKnow: ['Joins, window functions and aggregations in SQL', 'Spot missing values, duplicates and outliers before modelling', 'Check each column for information that would not exist at prediction time'],
      mistake: 'Using a column recorded after the user cancelled, so the model looks great and fails in production.',
    },
    {
      id: 'features', name: 'Feature engineering',
      what: 'Turning raw rows into per-entity numbers a model can use, such as counts, recency and trends.',
      why: 'Good features usually improve results more than switching to a fancier algorithm.',
      mustKnow: ['Compute features only from data available before the prediction date', 'Encode categories and handle missing values deliberately', 'Keep feature code in a script, not scattered across notebook cells'],
      mistake: 'Computing a feature with the full dataset, including future rows, and leaking the answer.',
    },
    {
      id: 'model', name: 'scikit-learn and gradient boosting',
      what: 'Training and comparing models with scikit-learn, and boosted trees such as XGBoost or LightGBM.',
      why: 'On tabular data like this, boosted trees are a strong default and a linear baseline shows whether they earn their complexity.',
      mustKnow: ['Split by time when the future must be predicted', 'Use cross-validation and keep a final untouched test set', 'Read precision, recall and calibration, not only accuracy'],
      mistake: 'Reporting 95 percent accuracy on data where 95 percent of users never churn.',
    },
    {
      id: 'experiment', name: 'Experiment design and A/B testing',
      what: 'Running a controlled test to measure whether acting on the model changes the outcome.',
      why: 'Offline scores say the model ranks well; only a test shows the retention offer actually works.',
      mustKnow: ['Randomise a control group that gets no treatment', 'Decide sample size and run time before looking at results', 'Read confidence intervals instead of declaring a winner early'],
      mistake: 'Stopping the test the first day the numbers look good.',
    },
    {
      id: 'handoff', name: 'Delivery, versioning and monitoring',
      what: 'Getting scores to the team in a table or dashboard, with tracked model versions and drift checks.',
      why: 'A model nobody can read or trust each day stops being used within weeks.',
      mustKnow: ['Track model version, data snapshot and parameters with a tool such as MLflow', 'Write scores to a table the business already uses', 'Watch input distributions and outcome rates for drift'],
      mistake: 'Emailing a notebook once and never checking whether the model still works after a pricing change.',
    },
  ],
}
