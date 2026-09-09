require "rails_helper"

RSpec.describe "The admin dashboard", type: :system, js: true do
  let(:admin) { create(:user, :admin, full_name: "Ada Lovelace", email_address: "ada@example.com") }

  def sign_in_through_the_form(user)
    visit new_session_path
    fill_in "email_address", with: user.email_address
    fill_in "password", with: "password"
    click_on "Sign in"
    expect(page).to have_no_current_path(new_session_path, wait: 5)
  end

  it "shows the counts an admin lands on after signing in" do
    create_list(:user, 2)
    sign_in_through_the_form(admin)

    expect(page).to have_current_path(admin_dashboard_path)
    expect(page).to have_css("h1", text: "Admin dashboard")
    expect(page).to have_css("dt", text: "Total users")
    expect(page).to have_css("dd", text: "3")
    expect(page).to have_css("dt", text: "Admins")
    expect(page).to have_css("dt", text: "Members")
  end

  it "links through to the users table" do
    sign_in_through_the_form(admin)

    click_on "Manage users"

    expect(page).to have_current_path(admin_users_path)
  end
end
