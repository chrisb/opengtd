require 'sinatra'

module OpenGTD
  class Site < Sinatra::Base
    helpers do
      def current_user
        @current_user ||= User.find_by_id(session[:user_id])
      end
    
      def current_user=(user)
        session[:user_id] = user.id
        @current_user = user
      end
      
      def logged_in?
        !!current_user
      end
    end
    
    get '/client' do
      redirect '/auth' unless logged_in?
      erb :client
    end
    
    get '/auth' do
      erb :login
    end
    
    get '/supported-clients' do
      erb :clients
    end
    
    get '/api' do
      erb :api
    end
    
    get '/' do
      redirect '/client' if logged_in?
      erb :home
    end
  
    get '/auth/failure' do
      "You suck."
    end
  
    get '/auth/:provider/callback' do
      auth = request.env['rack.auth']
      
      unless @auth = Authorization.find_from_hash(auth)
        # Create a new user or add an auth to existing user, depending on
        # whether there is already a user signed in.
        @auth = Authorization.create_from_hash(auth, current_user)
      end

      # Log the authorizing user in.
      self.current_user = @auth.user

      redirect '/'
    end
    
    get '/logout' do
      session.delete(:user_id)
      @current_user = nil
      redirect '/'
    end
    
  end
end