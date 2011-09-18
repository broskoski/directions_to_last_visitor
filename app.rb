require 'sinatra'
require 'datamapper'
require 'rack-flash'
require 'geokit'

enable :sessions
# use Rack::Flash

DataMapper.setup(:default, ENV['DATABASE_URL'] || "sqlite://#{Dir.pwd}/my.db")

class Visitor
  include DataMapper::Resource  

  property :id,           Serial
  property :ip_address,   String
  property :created_at,   DateTime
end

get '/' do
  @previousvisitor = Visitor.last
  
  @currentvisitor = Visitor.new(
    :ip_address => env['HTTP_X_REAL_IP'] ||= env['REMOTE_ADDR']
  )
  @currentvisitor.save
  
  @location = Geokit::Geocoders::GeoPluginGeocoder.geocode(@currentvisitor.ip_address)
  
  haml :index
end

DataMapper.auto_upgrade!