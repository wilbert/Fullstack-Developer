FactoryBot.define do
  factory :import do
    user

    after(:build) do |import|
      import.file.attach(
        io: Rails.root.join("spec/fixtures/files/users.csv").open,
        filename: "users.csv",
        content_type: "text/csv"
      )
    end
  end
end
