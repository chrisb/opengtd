require 'rubygems'
require 'grape'
require 'site'
require 'sinatra'
require 'api'
require 'rack'
require 'omniauth'
require 'omniauth/oauth'
require 'lib/opengtd/environment'

OpenGTD::Environment.boot!