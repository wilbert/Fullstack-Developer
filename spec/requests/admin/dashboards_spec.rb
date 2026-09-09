require "rails_helper"

RSpec.describe "Admin::Dashboards", type: :request do
  let!(:admin)  { create(:user, :admin, email_address: "boss@example.com", password: "password") }
  let!(:member) { create(:user, full_name: "Regular Member", email_address: "member@example.com", password: "password") }

  it "requires authentication" do
    get admin_dashboard_path

    expect(response).to redirect_to(new_session_url)
  end

  it "lets an admin in" do
    sign_in_as(admin)

    get admin_dashboard_path

    expect(response).to have_http_status(:ok)
  end

  it "lists every user for an admin" do
    sign_in_as(admin)

    get admin_dashboard_path

    expect(response.body).to include("Regular Member")
    expect(response.body).to include("2 users")
  end

  it "turns a member away with the authorization alert" do
    sign_in_as(member)

    get admin_dashboard_path

    expect(response).to redirect_to(root_path)
    expect(flash[:alert]).to eq("You are not authorized to do that.")
  end

  it "sends a member back where they came from" do
    sign_in_as(member)

    get admin_dashboard_path, headers: { "HTTP_REFERER" => profile_path }

    expect(response).to redirect_to(profile_path)
  end

  it "is where an admin lands straight after signing in" do
    sign_in_as(admin)

    expect(response).to redirect_to(admin_dashboard_path)
  end
end
