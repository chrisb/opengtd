require 'pp'

module OpenGTD
  class API < Grape::API
    
    get do
      erb :home
    end
    
    version 'v1'

    helpers do

      def session
        env['rack.session']
      end
      
      def current_user
        @current_user ||= User.find_by_id(session[:user_id])
      end
          
      def logged_in?
        !!current_user
      end
      
      def authenticate!
        error!('401 Unauthorized', 401) unless current_user
      end
      
      def find_task(id)
        t = Task.where(:id=>id).where(:user_id=>current_user.id).first
        t ? t : error!('404 Task Not Found',404)
      end
    end
    
    resource :tasks do
      
      get do
        { :tasks => current_user.tasks.map { |t| t.attributes } }
      end
      
      get 'tagged/:tag' do
        # TODO implement searching by tag
      end
          
      put ':id' do
        task_attributes = params[:task]
        [ :created_at, :updated_at, :user_id, :id ].each { |k| task_attributes.delete(k.to_s) }
        result = find_task(params[:id]).update_attributes task_attributes
        puts "---------------------------"
        pp task_attributes
        puts result.inspect
        puts "---------------------------"
        
      end
      
      get ':id' do
        find_task params[:id]
      end

      post ':id/complete' do
        find_task(params[:id]).update_attribute :completed, true
      end
      
      post ':id/reset' do 
        find_task(params[:id]).update_attribute :completed, false
      end

      post 'create' do
        task = Task.new(params[:task].merge(:user_id=>current_user.id))
        task.valid? && task.save ? task : task.errors
      end
    
    end
    
  end
end