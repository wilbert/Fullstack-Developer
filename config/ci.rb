# config/ci.rb
ActiveSupport::ContinuousIntegration.run do
  step "Setup", "bin/setup --skip-server"
  step "Style: Ruby", "bin/rubocop"
  step "Security: Gem audit", "bin/bundler-audit"
  step "Security: Brakeman", "bin/brakeman --quiet --no-pager --exit-on-warn"
  step "Types: TypeScript", "npm run typecheck"
  step "Style: JavaScript", "npm run lint"
  step "Tests", "bin/rails spec"
end