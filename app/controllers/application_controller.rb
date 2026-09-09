class ApplicationController < ActionController::Base
  include Authentication
  include Authorization

  allow_browser versions: :modern

  inertia_share do
    {
      auth:  { user: Current.user && UserSerializer.new(Current.user).as_json },
      flash: { notice: flash.notice, alert: flash.alert }
    }
  end
end
