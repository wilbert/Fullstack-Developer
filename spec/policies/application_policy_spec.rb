require "rails_helper"

RSpec.describe ApplicationPolicy do
  subject(:policy) { described_class.new(user, record) }

  let(:user)   { build_stubbed(:user) }
  let(:record) { user }

  describe "readers" do
    it "exposes the user and record it was built with" do
      other = build_stubbed(:user)
      policy = described_class.new(user, other)

      expect(policy.user).to eq(user)
      expect(policy.record).to eq(other)
    end
  end

  describe "defaults" do
    it "denies every action so subclasses must opt in" do
      expect(policy.index?).to be(false)
      expect(policy.show?).to be(false)
      expect(policy.create?).to be(false)
      expect(policy.update?).to be(false)
      expect(policy.destroy?).to be(false)
    end

    it "permits no attributes" do
      expect(policy.permitted_attributes).to eq([])
    end
  end

  describe "#owner?" do
    it "is private, so it cannot be used as an action predicate" do
      expect(described_class.private_method_defined?(:owner?)).to be(true)
      expect(policy).not_to respond_to(:owner?)
    end

    it "is true when the record is the user themselves" do
      expect(policy.send(:owner?)).to be(true)
    end

    it "is false for a different user" do
      expect(described_class.new(user, build_stubbed(:user)).send(:owner?)).to be(false)
    end

    it "is false when there is no user" do
      expect(described_class.new(nil, user).send(:owner?)).to be(false)
    end

    it "is false for a record that merely belongs to the user" do
      session = build_stubbed(:session, user: user)

      expect(described_class.new(user, session).send(:owner?)).to be(false)
    end
  end
end
