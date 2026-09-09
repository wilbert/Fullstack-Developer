# app/channels/dashboard/stats_channel.rb
module Dashboard
  class StatsChannel < ApplicationCable::Channel
    def subscribed
      return reject unless current_user.admin?

      stream_from Broadcaster::STREAM
    end
  end
end
