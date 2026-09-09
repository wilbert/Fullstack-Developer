require "rails_helper"

# Every Inertia page in the app currently sits behind `require_authentication`,
# so the signed-out branch of `auth.user` has no reachable route to exercise it.
# This anonymous controller renders Inertia without authentication to pin it.
RSpec.describe ApplicationController, type: :controller do
  controller(ApplicationController) do
    allow_unauthenticated_access

    def index = render(inertia: "home/index")
  end

  before { routes.draw { get "index" => "anonymous#index" } }

  it "shares a nil user rather than dropping the key when nobody is signed in" do
    get :index

    expect(inertia.props.deep_symbolize_keys[:auth]).to eq(user: nil)
  end

  it "still shares the flash keys when nobody is signed in" do
    get :index

    expect(inertia.props.deep_symbolize_keys[:flash]).to eq(notice: nil, alert: nil)
  end
end
