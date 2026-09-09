class UserPolicy < ApplicationPolicy
  BASE_ATTRIBUTES  = %i[full_name email_address password password_confirmation
                        avatar_url avatar_image].freeze
  ADMIN_ATTRIBUTES = (BASE_ATTRIBUTES + %i[role]).freeze

  def index?   = user.admin?
  def show?    = user.admin? || owner?
  def create?  = user.admin?
  def update?  = user.admin? || owner?
  def destroy? = user.admin? || owner?

  # An admin must not be able to demote or delete themselves out of access.
  def toggle_role? = user.admin? && !owner?

  def permitted_attributes
    user.admin? ? ADMIN_ATTRIBUTES : BASE_ATTRIBUTES
  end

  def scope
    user.admin? ? User.all : User.where(id: user.id)
  end
end
