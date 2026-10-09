import { formatNumber, type Experiment } from '../experiments/registry.ts'

const BODY = 'What happened, or what would make this more useful?\n\n\n---\nFeedback here is public on GitHub, so please leave out names and other personal details.'

/** A new GitHub issue for feedback, titled with the experiment when there is one. Labs itself collects nothing. */
export function feedbackUrl(experiment?: Experiment): string {
  const params = new URLSearchParams({ body: BODY })
  if (experiment) params.set('title', `${formatNumber(experiment.number)} ${experiment.title}: `)
  return `https://github.com/EugeneYip/labs/issues/new?${params}`
}
