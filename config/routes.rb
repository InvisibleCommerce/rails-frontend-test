Rails.application.routes.draw do
  resources :storefronts
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  root "storefronts#edit", id: 1

  put '/reasons/update_visibility/:id', to: 'storefronts#update_visibility'

  put '/reasons/update_order', to: 'storefronts#update_order'
end
