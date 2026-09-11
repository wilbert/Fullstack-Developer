# Umanni Users

### AI Usage Disclosure

This project was built with the help of AI assistants:

- **GitHub Copilot**: inline code completion.
- **Claude Opus 5** (Anthropic): planning, understanding the requirements and choosing the stack (Inertia.js + React instead of Hotwire), learning Inertia.js/Vite, bug fixing, Pull Request reviews and descriptions, writing documentation, and a requirements-compliance pass (client-side form validation, parallel test setup, configuration cleanup).

Details: [AI_DISCLOSURE.md](AI_DISCLOSURE.md).

---

A responsive user-management app built on Rails 8 and Ruby 4. Admins manage users, toggle roles, import spreadsheets in the background, and watch live counters and import progress. Members manage their own profile, and visitors can sign up.

The original challenge statement is kept in [CHALLENGE.md](CHALLENGE.md).

## Contents

- [Stack](#stack)
- [Features](#features)
- [Quick start with Docker Compose](#quick-start-with-docker-compose)
- [Running on your machine without Docker](#running-on-your-machine-without-docker)
- [Seeding](#seeding)
- [Tests](#tests)
- [Architecture notes](#architecture-notes)
- [Configuration and credentials](#configuration-and-credentials)
- [Deployment](#deployment)
- [More documentation](#more-documentation)

## Stack

| Layer | Choice |
|---|---|
| Language / framework | Ruby 4.0.6, Rails 8.1 |
| Database | PostgreSQL 17 (primary, plus separate queue, cache and cable databases) |
| Frontend | **Option B:** React 19 through Inertia.js, TypeScript, bundled by **Vite Rails** |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`, forms and typography plugins) |
| Real-time | Action Cable on **Solid Cable** |
| Background jobs | Active Job on **Solid Queue** |
| Authentication | Rails 8 built-in authentication generator, extended with roles and policies (no Devise) |
| File uploads | Active Storage (local disk in development, S3 in production) |
| Serving | Puma behind **Thruster** (compression, asset caching) |
| Deploy | Multi-stage Dockerfile, **Kamal 2** configuration |
| Tests | RSpec, Capybara + Playwright, SimpleCov, run in parallel with `parallel_tests` |

No Redis is needed: cache, queue, and cable all run on PostgreSQL.

## Features

**Visitor**
- Registers as a regular member (the role is always forced to `member` on the server).

**Member**
- Lands on their profile after signing in.
- Can view, edit, and delete only their own profile. Other users' records return not-found.

**Admin**
- Lands on the admin dashboard after signing in.
- Dashboard shows total users and users per role, updated live over Solid Cable when users are created, deleted, or change role.
- Lists users with search, role filter, sorting, and pagination. Creates, edits, and deletes users, and toggles roles. The last admin can't be deleted or demoted, and admins can't toggle their own role.
- Imports `.csv` / `.xlsx` spreadsheets (up to 10 MB). The import runs as a Solid Queue job, and the import page shows live progress, created/skipped/failed counts, and the rejected rows with their errors.

**User fields:** `full_name`, `email_address` (encrypted), `avatar_image` (Active Storage upload) or `avatar_url` (remote https link), `role` (`admin` / `member`).

## Quick start with Docker Compose

Requirements: Docker with Compose v2, and the Rails master key.

1. **Create `.env`** in the project root:

   ```dotenv
   RAILS_MASTER_KEY=<contents of config/master.key>
   SECRET_KEY_BASE=<output of: openssl rand -hex 64>
   RAILS_ENV=development
   RACK_ENV=development
   ```

2. **Build and start:**

   ```bash
   docker compose build
   docker compose up
   ```

   On boot the `web` container creates and migrates all databases (`db:prepare`), then starts Thruster on port 80, published as **http://localhost:3000**. The Solid Queue worker runs inside Puma (`SOLID_QUEUE_IN_PUMA=true`), so imports are processed without any extra step.

3. **Seed** (in another terminal):

   ```bash
   docker compose exec web ./bin/rails db:seed
   ```

4. Open http://localhost:3000 and sign in as `admin@umanni.test` / `password123`.

The code is copied into the image, not mounted: after changing code, run `docker compose up -d --build web`. The full guide, including troubleshooting, is in [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md).

## Running on your machine without Docker

Requirements: Ruby 4.0.6, Node 22+, PostgreSQL 17, and `config/master.key`.

```bash
# config/database.yml defaults to user "umanni" with no password on localhost
export POSTGRES_USER=<your postgres user> POSTGRES_PASSWORD=<password, if any>
export APP_ORIGIN=http://localhost:3000

bin/setup        # bundle install, npm install, db:prepare, then starts bin/dev
```

`bin/dev` runs [Procfile.dev](Procfile.dev): the Rails server, the Vite dev server (hot reload), and a Solid Queue worker (`bin/jobs`). Seed with `bin/rails db:seed`.

## Seeding

```bash
bin/rails db:seed                                   # or: docker compose exec web ./bin/rails db:seed
SEED_ADMIN_PASSWORD=something-secret bin/rails db:seed
```

[db/seeds.rb](db/seeds.rb) creates:
- the admin `admin@umanni.test` with password `password123` (or `SEED_ADMIN_PASSWORD`), created only once;
- 25 members with Faker names, pravatar avatars, and password `password123`. Every run adds 25 more.

To try the importer, upload a CSV such as [spec/fixtures/files/users.csv](spec/fixtures/files/users.csv) from **Users → Import users**. The accepted columns are listed on that page.

## Tests

The suite uses RSpec: model, policy, query, job, channel, request, and serializer specs, plus Capybara system specs driven by Playwright. It runs in parallel across CPU cores with [`parallel_tests`](https://github.com/grosser/parallel_tests). SimpleCov merges the workers' results and **fails the run below 90% line / 80% branch coverage**. The last local run measured 99.45% line and 98.38% branch.

```bash
# once: one test database per worker, and the browser used by system specs
RAILS_ENV=test bin/rails parallel:create parallel:load_schema
npx playwright install chromium

# each run
RAILS_ENV=test bin/vite build          # build the test bundle once, so workers don't race to build it
bundle exec parallel_rspec             # whole suite, in parallel

bundle exec rspec spec/requests        # a single process, for a subset
bundle exec parallel_rspec -o "--tag '~js'"   # skip the browser specs
```

Set `POSTGRES_USER` / `POSTGRES_PASSWORD` if your local PostgreSQL user isn't `umanni`.

**Cross-browser:** system specs run in Chromium by default. To run the same specs in Firefox or WebKit (Safari's engine), install the engine and set `PLAYWRIGHT_BROWSER`:

```bash
npx playwright install firefox webkit
PLAYWRIGHT_BROWSER=webkit bundle exec parallel_rspec spec/system
```

**All CI checks locally:** `bin/ci` ([config/ci.rb](config/ci.rb)) runs RuboCop, Prettier, bundler-audit, Brakeman, the TypeScript check, and the parallel suite. GitHub Actions runs the same checks ([.github/workflows/ci.yml](.github/workflows/ci.yml)).

## Architecture notes

**Authentication and authorization.** The Rails 8 authentication generator provides sessions, password reset, and the `Authentication` concern ([app/controllers/concerns/authentication.rb](app/controllers/concerns/authentication.rb)). On top of it:
- `default_landing_url` sends admins to the dashboard and members to their profile.
- Policy objects ([app/policies/user_policy.rb](app/policies/user_policy.rb)) decide actions, record scopes, and permitted attributes. Only an admin editing *someone else* may set `role`.
- Sign-in and registration are rate limited.

**Real-time.** Model callbacks call `Dashboard::Broadcaster`, which throttles bursts and broadcasts on `DashboardChannel`. `ProcessImportJob` broadcasts progress on `ImportChannel`. Both channels only accept admins. The React pages listen with `@rails/actioncable` and re-request only the changed props through an Inertia partial reload.

**Background imports.** `ProcessImportJob` runs on the `imports` queue. It uses `ActiveJob::Continuable` steps (count rows, import rows in batches of 100, finalize), so an interrupted import resumes from its last batch. Rows are parsed by `Imports::CsvRowSet` / `Imports::SpreadsheetRowSet` and validated by `Imports::UserRow`. Formula-like cell prefixes are stripped, and existing emails are skipped.

**Validation, on both sides.**
- *Backend (authority):* strong parameters via `params.expect` with policy-defined attributes, model validations (presence, length, email format, uniqueness, https-only avatar URL, avatar content type and size, import file type and size), `has_secure_password` limits, and database constraints (unique email index, `NOT NULL` columns).
- *Frontend (interactive feedback):* [app/javascript/lib/validation.ts](app/javascript/lib/validation.ts) mirrors those rules with the same messages. [useLiveValidation](app/javascript/hooks/useLiveValidation.ts) checks a field when it loses focus, re-checks it as the user types, blocks submitting an invalid form, and focuses the first problem. Server errors appear in the same place.

**Cross-browser support.**
- `allow_browser` in [ApplicationController](app/controllers/application_controller.rb) sets an explicit floor (Safari 16.4, Chrome 111, Firefox 128), chosen from what Tailwind v4's CSS needs (`@property`, `color-mix()`, `oklch()`) rather than Rails' stricter `:modern` preset, so iOS 16.4–17.1 still gets in. Request specs pin that floor with real user agents.
- Forms use `noValidate` with custom inline messages, so every engine shows the same feedback instead of its own bubbles.
- Inputs use 16px text on phones to prevent iOS zoom, and safe-area padding keeps content clear of the notch.
- System specs can run in Chromium, Firefox, or WebKit.

**Security.**
- `email_address` is encrypted with Active Record Encryption (deterministic, so it can be looked up).
- React escapes output. CSRF protection is on, and Inertia sends the token.
- Brakeman and bundler-audit run in CI.

## Configuration and credentials

- `config/credentials.yml.enc` holds `secret_key_base` and the Active Record Encryption keys. `config/master.key` is gitignored and never copied into the image. Provide it as `RAILS_MASTER_KEY` in Docker and Kamal.
- Environment variables cover deploy-specific settings: `DB_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `APP_ORIGIN` (allowed Action Cable origin), `SOLID_QUEUE_IN_PUMA`, and `ACTIVE_STORAGE_SERVICE` / `AWS_*` for S3 in production. In production, Kamal injects secrets from [.kamal/secrets](.kamal/secrets), which only references environment variables.
- The test environment uses fixed, clearly-labelled encryption keys, so CI and fresh clones don't need the master key.
- [.gitignore](.gitignore) and [.dockerignore](.dockerignore) keep keys, `.env*`, logs, uploads, build output, coverage, and test artifacts out of git and out of the image.

## Deployment

The [Dockerfile](Dockerfile) is multi-stage: gems and npm packages build in one stage, the final image carries no Node and no build tools, runs as a non-root user, and serves through Thruster on port 80. [config/deploy.yml](config/deploy.yml) defines a Kamal 2 deployment with `web` and `job` roles, kamal-proxy with SSL, and a PostgreSQL accessory. It hasn't been run against a real server yet: see [KAMAL_DISCLOUSURE.md](KAMAL_DISCLOUSURE.md) for status and the remaining steps.

## More documentation

- [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md): Docker Compose development guide
- [AI_DISCLOSURE.md](AI_DISCLOSURE.md): how AI assistants were used
- [KAMAL_DISCLOUSURE.md](KAMAL_DISCLOUSURE.md): deployment status
- [CHALLENGE.md](CHALLENGE.md): original challenge statement
