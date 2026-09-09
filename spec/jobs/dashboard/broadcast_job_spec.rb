require "rails_helper"

RSpec.describe Dashboard::BroadcastJob do
  it "broadcasts the stats.changed payload when performed" do
    expect { described_class.perform_now }
      .to have_broadcasted_to(Dashboard::Broadcaster::STREAM)
      .with(type: "stats.changed")
  end
end
