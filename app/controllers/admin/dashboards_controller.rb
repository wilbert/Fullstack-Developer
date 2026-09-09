class Admin::DashboardsController < ApplicationController
  include Authorization

  before_action -> { authorize!(User, "index?") }

  def show
    @users = UserPolicy.new(Current.user, User).scope
  end
end
