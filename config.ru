require 'rubygems'
require 'bundler'
require 'sinatra'
Bundler.require

require './app'
run Sinatra::Application