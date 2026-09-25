# Quiz Generator: Agent Guide

## Project Purpose

This is a React nursing quiz application. Its front page contains Provimi and Infermieri. Infermieri contains 17 topics, each mapped to an initially empty JSON question bank in src/questions/infermieri. Visible content is primarily Albanian.

The working quiz engine is the baseline to preserve. Extend it carefully; do not rewrite or refactor it incidentally.

## Verified Current Architecture

- **Framework/build system:** React 19 with React DOM, built and served by Vite 8. The project uses JavaScript/JSX, ESM (`"type": "module"`), and the official Vite React plugin.
- **Package manager:** npm, evidenced by `package-lock.json` and npm scripts in `package.json`.
- **Application entry:** `index.html` loads `src/main.jsx`. `main.jsx` renders `App` and `CookieConsent` into `#root` under `React.StrictMode`. `App.jsx` renders `pages/Home.jsx`.
- **Routing:** there is no router dependency or route configuration. Navigation is in-memory hierarchical navigation inside `Home`.
- **State management:** React `useState` only. `Home` owns the selected content node, navigation history, animation direction, active generated quiz, and quiz message. `Quiz` owns question position, answers keyed by question index, completion state, and exit-modal state.
- **Major components:**
  - `src/pages/Home.jsx`: coordinates content navigation and quiz start/exit.
  - `src/components/Navigation.jsx`: renders the current hierarchy's children and Back control; uses Framer Motion for slide transitions.
  - `src/components/InfoPanel.jsx`: displays the selected node and its applicable quiz-start controls.
  - `src/components/Quiz.jsx`: renders questions, evaluates selected answers, calculates the score, and handles exit confirmation.
  - `src/components/CookieConsent.jsx`: stores the analytics-consent choice and conditionally enables analytics.
- **Utilities:** `src/utils/generateQuiz.js` discovers bundled question JSON through eager `import.meta.glob`; `src/utils/analytics.js` conditionally loads Google Analytics and emits quiz events.
- **Styling/assets:** global styles are in `src/index.css`; component/page styles are in `src/styles/`; static question images are under `public/question-images/` and are referenced by JSON paths.

## Project Structure

```text
src/
  main.jsx                 React mount point
  App.jsx                  renders Home
  pages/Home.jsx           application coordinator
  components/              navigation, content panel, quiz, consent UI
  utils/                   quiz generation and analytics
  data/structure.json      subject/topic hierarchy and question-file mapping
  questions/               topic JSON question banks
  styles/                  CSS by page/component
public/question-images/    optional question illustrations
```

`src/data/structure.json` is a tree of nodes with `id`, `title`, `type`, `description`, optional `children`, and (for lesson nodes) `questionFile`. Its current node types are `root`, `exam`, `folder`, and `lesson`.

## Existing Quiz Behaviour

1. On the root node, the user selects an exam or a subject. Subject folders contain topic (`lesson`) nodes. The Back button uses `Home`'s in-memory history.
2. A lesson offers **Start Test** and **Shuffle Questions**. A subject folder offers **Random Test**. The `exam` node offers **Start Exam**.
3. `generateQuiz` recursively collects all `questionFile` values below the selected node. It retrieves those JSON arrays from an eager Vite glob import.
4. A lesson quiz uses every question in its one file in source order, unless the user chose Shuffle Questions, in which case the whole list is Fisher-Yates shuffled.
5. A folder's Random Test shuffles the aggregated questions below that folder and takes the first 50. An exam uses the root node as its source, so it shuffles questions from all current topic files and takes the first 50.
6. Empty selections return `null` and show “This topic has no questions yet.”
7. A quiz displays one question at a time. The first selected answer is stored; buttons are then disabled. The correct option is shown as correct, a wrong selected option as incorrect, and the explanation is revealed. Previous/Next permits reviewing answered questions.
8. Finish is available only on the final question. Score is the count of question indices whose stored answer equals that question's zero-based `correct` index. Unanswered questions count as incorrect.
9. Completion shows `score / quiz.questions.length`. Exit requires confirmation and discards the in-memory quiz. On narrow screens (maximum width 768px), exit also returns the content navigation to the root.
10. Start, finish, and confirmed exit events are sent only when analytics has been enabled by consent.

Preserve this selection, scoring, immediate-feedback, and exit behaviour unless a requested feature explicitly changes it.

## Data Storage

### JSON quiz content

- `src/questions/infermieri/` contains 17 topic JSON files, initially empty arrays awaiting nursing questions.
- When adding questions, use one of these shapes:
  - `{ id, question, answers, correct, explanation }`
  - `{ id, question, answers, correct, explanation, image, imageAlt }`
- `answers` is an array, and `correct` is its zero-based correct-answer index.
- Assign each new question a stable, globally unique ID. Preserve IDs once questions are in use.
- Files are bundled into the client at build time via eager `import.meta.glob`, not fetched from an API at runtime.

### Browser persistence and analytics

- The sole browser storage use is `localStorage["quiz-generator-analytics-consent"]`, whose values are `accepted` or `declined`.
- This is a local-storage consent flag, not an HTTP cookie. There is no use of `sessionStorage`, browser persistence for quiz progress, or persistent score storage.
- If consent is accepted, the app dynamically injects Google Analytics (`G-8M0HY1BXNB`) and uses `gtag` for quiz events.

### Backend and users

This copy is a static quiz application. Account UI, authentication endpoints, database dependencies, and the user-table migration have been removed. No database or authentication environment variables are required.

## Development Philosophy

- Inspect the existing code and JSON hierarchy before editing.
- Prefer small, coherent additions that reuse the current `Home` → `generateQuiz` → `Quiz` flow.
- Do not rename, move, normalise, or bulk-rewrite question files without an explicit content task.
- Preserve question IDs, JSON paths referenced by `structure.json`, question ordering semantics, and image paths.
- Do not make unrelated styling, dependency, build-tool, or architectural changes.

## Planned Features (Not Implemented)

The intended future direction is:

1. User registration and login (not implemented in this copy).
2. Persistent user quiz attempts, scores, and progress.
3. Controlled access to subjects or products.
4. Payment integration.

Quiz content should remain JSON unless a future, explicit design changes that decision. A likely separation is JSON for shared content and Postgres for user-specific data (users, sessions, attempts, scores, progress, purchases, and access grants), but that is planning only—not the current implementation.

## Persistent Score Integration Notes

The best low-disruption boundary is the existing `finishQuiz` function in `src/components/Quiz.jsx`: it already computes a score and has the complete `quiz.questions` list plus stored answers. A future authenticated implementation can submit an attempt from that boundary (or a callback supplied by `Home`) to a server-side API.

Persist question IDs from `quiz.questions`, rather than current question indices, because indices are local to one generated quiz and may be shuffled. Store the quiz context (selected node ID/type/title), timestamps, score, total question count, and per-question selected answer as required by the eventual schema. The existing JSON IDs are stable in the current repository, but their long-term immutability should be treated as a data contract before records are persisted.

## Security Principles for Future Work

- Never store plaintext passwords.
- Use established authentication and password/session-security libraries once a backend design is chosen.
- Keep credentials, database URLs, payment keys, and analytics secrets in environment variables; never commit them.
- Enforce access to protected content and user records server-side, with ownership checks that isolate one user's data from another's.
- Use database migrations for future schema changes; do not modify a production schema ad hoc.
- Verify payment events and grants server-side before changing access rights.
- Treat authentication (identity), authorization (permissions), and payment (the source of an access grant) as distinct concerns.

## Commands

Commands verified from `package.json`:

```bash
npm run dev      # start Vite development server
npm run build    # create a production build
npm run lint     # run ESLint over the project
npm run preview  # preview the Vite production build
```

Netlify builds and deploys the static `dist` directory using `netlify.toml`.

There is no `test`, `typecheck`, database, migration, or deployment script in `package.json`.

### Deployment

This separate copy includes static build settings in `netlify.toml`. A deployment connection for this copy has not been verified.

## Agent Working Rules

- Inspect before editing and report what changed.
- Preserve working quiz behaviour and use existing conventions: functional components, React hooks, JSX, CSS imports local to components/pages, and relative imports without extensions in some component imports.
- Make small, targeted changes; avoid unrelated refactors.
- Do not expose or commit secrets.
- Run the relevant available checks after code changes when doing so is within the requested scope.
- For future database work, introduce and use migrations rather than manually changing shared schemas.

## Open Questions

- No test suite or type-checking setup is currently configured.
- Deployment of this separate copy has not been configured or verified.
- The repository does not state an authentication provider, session model, payment provider, or access-control data model.
