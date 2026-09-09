require "rails_helper"

# The layout only renders inside an Inertia page, so these run through the real
# browser. `home/index` is the one Inertia page that currently has a component
# to resolve, so it stands in for every screen that will inherit the layout.
RSpec.describe "The application layout", type: :system, js: true do
  let(:member) { create(:user, full_name: "Grace Hopper", email_address: "grace@example.com") }
  let(:admin)  { create(:user, :admin, full_name: "Ada Lovelace", email_address: "ada@example.com") }

  # Polls a server-side condition the DOM gives no signal for.
  def wait_until(timeout: 5)
    deadline = Time.current + timeout
    sleep(0.05) until yield || Time.current > deadline
    yield
  end

  def sign_in_through_the_form(user)
    visit new_session_path
    fill_in "email_address", with: user.email_address
    fill_in "password", with: "password"
    click_on "Sign in"
    # `click_on` returns before the redirect lands, so wait it out rather than
    # asserting against the sign-in page we are still standing on.
    expect(page).to have_no_current_path(new_session_path, wait: 5)
  end

  it "gives a member their own name and no admin links" do
    sign_in_through_the_form(member)
    visit root_path

    expect(page).to have_link("Grace Hopper", href: "/profile")
    expect(page).to have_no_link("Dashboard")
    expect(page).to have_no_link("Users")
  end

  it "gives an admin the dashboard and users links" do
    sign_in_through_the_form(admin)
    visit root_path

    expect(page).to have_link("Dashboard", href: "/admin")
    expect(page).to have_link("Users", href: "/admin/users")
    expect(page).to have_link("Ada Lovelace", href: "/profile")
  end

  # NOTE: `sessions#destroy` redirects to /session/new, which is an ERB page and
  # carries no X-Inertia header. The nav's Link issues an Inertia XHR, and
  # Inertia cannot swap in a non-Inertia response, so the request lands -- the
  # session really is destroyed -- but the page never changes. To the user the
  # button appears to do nothing, and the nav keeps showing them as signed in
  # until they navigate. Pinned as it actually is; see the summary.
  it "destroys the session when Sign out is clicked" do
    sign_in_through_the_form(member)
    visit root_path

    click_on "Sign out"

    expect(wait_until { member.sessions.reload.none? }).to be(true)
  end

  it "leaves the nav showing the signed-in state until the next navigation" do
    sign_in_through_the_form(member)
    visit root_path

    click_on "Sign out"
    wait_until { member.sessions.reload.none? }

    expect(page).to have_current_path(root_path)
    expect(page).to have_link("Grace Hopper")

    visit root_path # only now does the browser learn it is signed out

    expect(page).to have_current_path(new_session_path)
  end

  it "renders a flash alert in the banner" do
    sign_in_through_the_form(member)
    visit admin_users_path # denied, and bounced back to the home page

    expect(page).to have_current_path(root_path)
    expect(page).to have_css("[role=status]", text: "You are not authorized to do that.")
  end

  it "keeps the banner styled for an alert rather than a notice" do
    sign_in_through_the_form(member)
    visit admin_users_path

    expect(page).to have_css("[role=status].bg-red-50")
    expect(page).to have_no_css("[role=status].bg-emerald-50")
  end

  it "shows no banner on a plain page load" do
    sign_in_through_the_form(member)
    visit root_path

    expect(page).to have_css("h1", text: "Home")
    expect(page).to have_no_css("[role=status]")
  end
end
