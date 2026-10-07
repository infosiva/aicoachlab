import type { Role } from './types'

export const ML_MLOPS_ENGINEER: Role = {
  slug: 'ml-mlops-engineer',
  title: 'ML / MLOps Engineer',
  blurb: 'Takes a model from a notebook to a monitored production service that can be retrained and rolled back safely.',
  asOf: '2026-10',
  demand: [
    {
      claim: 'AI/ML engineer is one of the 10 technology roles in highest demand, with above-average sequential growth and consistent demand over the past 12 months.',
      source: 'Robert Half, 2026',
      url: 'https://www.roberthalf.com/us/en/insights/research/data-reveals-which-technology-roles-are-in-highest-demand',
    },
  ],
  scenario: {
    title: 'Putting a customer-churn model into production',
    story:
      'A data scientist has a churn model that works in a notebook. The retention team wants a score for every customer each morning, and they want to know when the model stops being right.',
  },
  steps: [
    { stackId: 'features', label: 'Features', happens: 'Training and serving use the same feature definitions, built from versioned data.' },
    { stackId: 'tracking', label: 'Track runs', happens: 'Every training run logs its code version, data version, parameters and metrics.' },
    { stackId: 'registry', label: 'Register model', happens: 'The best run is packaged and stored with a version, its metrics and its owner.' },
    { stackId: 'serving', label: 'Serve', happens: 'A batch job scores all customers nightly; a small API handles single lookups.' },
    { stackId: 'cicd', label: 'Ship safely', happens: 'A pipeline tests the model, deploys to a small share first and can roll back.' },
    { stackId: 'monitor', label: 'Monitor', happens: 'Dashboards watch input drift, score distribution and, when labels arrive, real accuracy.' },
  ],
  stack: [
    {
      id: 'features', name: 'Feature pipelines and data versioning',
      what: 'Code that builds model inputs from raw data, with the data snapshot recorded so a result can be reproduced.',
      why: 'Most production model bugs come from training features that differ from serving features.',
      mustKnow: ['Share one feature definition between training and serving', 'Avoid leakage: never use information from after the prediction time', 'Version the dataset, not just the code'],
      mistake: 'Computing a feature one way in the notebook and re-implementing it differently in the service.',
    },
    {
      id: 'tracking', name: 'Experiment tracking (MLflow, Weights & Biases)',
      what: 'A system that records parameters, metrics and artifacts for each training run.',
      why: 'Without it nobody can say which run produced the model in production.',
      mustKnow: ['Log code commit, data version, parameters and metrics', 'Compare runs on the same fixed validation set', 'Keep random seeds so results can be repeated'],
      mistake: 'Keeping results in notebook cells and file names like model_final_v2.',
    },
    {
      id: 'registry', name: 'Model registry and packaging',
      what: 'A store of versioned models with their metrics, stage (staging or production) and the container or format used to run them.',
      why: 'It gives a single answer to which model is live and a one-step path to the previous one.',
      mustKnow: ['Promote by stage with an approval step', 'Package the model with its exact dependencies', 'Record the owner and the training data version'],
      mistake: 'Copying a pickle file onto a server by hand with no version or history.',
    },
    {
      id: 'serving', name: 'Model serving (batch and online)',
      what: 'Running the model either on a schedule over many rows, or behind an API for single requests, for example with FastAPI, BentoML or KServe.',
      why: 'The retention team needs a daily list, so batch scoring is simpler, cheaper and more reliable than a live endpoint.',
      mustKnow: ['Pick batch unless latency really matters', 'Set timeouts, health checks and a safe default when the model fails', 'Load the model once, not per request'],
      mistake: 'Building a low-latency API when the business only reads a spreadsheet each morning.',
    },
    {
      id: 'cicd', name: 'CI/CD and safe rollout for models',
      what: 'An automated pipeline that tests code and the model, then releases it gradually.',
      why: 'A model can pass unit tests and still be worse than the old one, so the pipeline must check quality too.',
      mustKnow: ['Gate release on metrics versus the current model', 'Canary or shadow-run before full traffic', 'Keep a one-command rollback'],
      mistake: 'Replacing the live model all at once with no way back.',
    },
    {
      id: 'monitor', name: 'Monitoring and drift detection',
      what: 'Tracking input data, predictions and, once true outcomes arrive, accuracy, for example with Evidently or custom dashboards.',
      why: 'Customer behaviour changes, so a model that was good in March can be wrong by September without any code change.',
      mustKnow: ['Watch input distribution and score distribution', 'Measure real accuracy when labels arrive, which may be weeks later', 'Define a retrain trigger and an alert owner'],
      mistake: 'Watching only server uptime and never noticing the predictions got worse.',
    },
  ],
}
