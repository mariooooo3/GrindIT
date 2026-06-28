// Lightweight, reusable loading copy shared by the landing page and the
// slideshow container. Keep entries short, developer-flavoured and friendly —
// they show while real work (GitHub fetch, analysis, AI narrative) runs.

export const LOADING_MESSAGES = [
  "Fetching your commit history...",
  "Judging your 3am pushes...",
  "Converting coffee into TypeScript...",
  "Running git blame on you...",
  "Consulting the commit oracle...",
  "Parsing your README lies...",
  "Counting semicolons...",
  "Looking for TODOs you'll never fix...",
  "Measuring your caffeine-powered productivity...",
  "Trying not to judge your commit messages...",
  "Rebasing reality...",
  "Untangling your merge conflicts...",
  "Asking the linter to be gentle...",
  "Stashing your excuses...",
  "Counting empty catch blocks...",
  "Auditing your '// temporary fix' comments...",
  "Investigating suspicious force pushes...",
  "Tallying your 'fix: fix fix fix' commits...",
  "Calculating caffeine-to-code ratio...",
  "Blaming git for your own mistakes...",
  "Checking how many times you pushed 'hotfix'...",
  "Excavating code from the before-times...",
  "Asking why it's 80% .env.example...",
  "Counting your midnight deploy regrets...",
  "Reading your commit messages with concern...",
  "Evaluating your 'WIP' branches from 2022...",
  "Noticing that test coverage comment you left...",
  "Decoding what 'misc' actually meant...",
  "Counting lines of copy-pasted Stack Overflow...",
  "Interviewing your git stash...",
] as const;

// Shorter subset shown while the optional Groq narrative is being written.
export const NARRATIVE_MESSAGES = [
  "Writing your developer lore...",
  "Interviewing your commits...",
  "Consulting the AI reviewer...",
  "Generating legendary excuses...",
  "Crafting your origin story...",
  "Distilling your code personality...",
  "Summarising the chaos beautifully...",
] as const;

// Pick one random entry. The arrays above are non-empty constants, so the
// result is always defined.
export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
