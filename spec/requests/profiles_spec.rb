require "rails_helper"

RSpec.describe "Profiles", type: :request do
  let!(:user) { create(:user, full_name: "Ada Lovelace", email_address: "ada@example.com", password: "password") }

  it "requires authentication" do
    get profile_path

    expect(response).to redirect_to(new_session_url)
  end

  it "shows the signed-in user their own details" do
    sign_in_as(user)

    get profile_path

    expect(response).to have_http_status(:ok)
    expect(response.body).to include("Ada Lovelace")
    expect(response.body).to include("ada@example.com")
  end

  it "is where a member lands straight after signing in" do
    sign_in_as(user)

    expect(response).to redirect_to(profile_path)
  end

  it "shows the viewer's own record rather than anyone else's" do
    create(:user, full_name: "Someone Else")
    sign_in_as(user)

    get profile_path

    expect(response.body).not_to include("Someone Else")
  end
end
