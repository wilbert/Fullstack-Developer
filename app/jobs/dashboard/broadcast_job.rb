# app/jobs/dashboard/broadcast_job.rb
module Dashboard
  class BroadcastJob < ApplicationJob
    def perform = Broadcaster.broadcast
  end
end
