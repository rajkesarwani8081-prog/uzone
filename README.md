# UzoneQuiz — React + Vite

UzoneQuiz is a modern, high-performance quiz management and code practice platform rewritten in React 19, TypeScript, and Vite. It serves both teachers and students with rich analytics, LeetCode-style code practice, real-time in-browser judging, and fluid glassmorphic visual design.

## Features

- **Dual-Role Workspace**: Instant seamless switching between **Teacher** and **Student** environments.
- **Teacher Suite**:
  - Live classroom dashboard with 7-day attempt trends, pulse metrics, and quick actions.
  - Quiz builder with multi-step workflows, autosave, AI question generator, preview mode, and scheduling.
  - Assessment management with search, status filters, subject filters, duplicate, and deletion.
  - Learner directory with participation rates, risk flagging, and invitation system.
  - Deep learning intelligence with quiz accuracy distribution, topic breakdown, and hardest questions.
- **Student Experience**:
  - Personalized dashboard with study streaks, weekly momentum charts, and recommendations.
  - Quiz library across multiple batches, semesters, and difficulties with bookmarking.
  - Full-screen distraction-free quiz attempt mode with live countdown timer, autosave, and question navigator.
  - Instant score evaluation, percentiles, ranking recalculation, and question-by-question explanations.
  - Practice later question bookmarking and targeted revision.
  - Live competitive leaderboard with top-3 podium and full rankings.
- **LeetCode-Style Code Practice**:
  - 70 curated interview coding problems across Easy, Medium, and Hard tiers.
  - Dual-language support: JavaScript and Python 3.
  - In-browser execution via sandboxed Web Worker and automated multi-case test runner.
  - Split-pane editor with test case inspector, stdout logs, expected vs actual comparisons, and editorials.
- **Themes & Visuals**:
  - Aurora (custom WebGL2 real-time animated background), Dark, and Light themes.
  - Liquid glass dock mobile navigation and responsive layout.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite 6
- **Icons**: Lucide React
- **Styling**: Tailored CSS design system with glassmorphism & Aurora WebGL2 shaders
- **State & Storage**: Reactive React Context with client-side localStorage persistence

## Development

```bash
# Install dependencies
npm install

# Start the dev server on port 3000
npm run dev

# Build production bundle
npm run build
```
