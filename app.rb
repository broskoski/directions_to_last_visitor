require 'sinatra'
require 'datamapper'
require 'rack-flash'
require 'geokit'

# enable :sessions
# use Rack::Flash

DataMapper.setup(:default, ENV['DATABASE_URL'] || "sqlite://#{Dir.pwd}/my.db")

class Visitor
  include DataMapper::Resource  

  property :id,           Serial
  property :ip_address,   String
  property :longitude,    String
  property :latitude,     String
  property :city,         String
  property :country,      String
  property :created_at,   DateTime

end

get '/' do
  @currentlocation = Geokit::Geocoders::GeoPluginGeocoder.geocode(env['REMOTE_ADDR'])

  @currentvisitor = Visitor.new(
    :ip_address => env['HTTP_X_REAL_IP'] ||= env['REMOTE_ADDR'], 
    :longitude => @currentlocation.lng,
    :latitude => @currentlocation.lat,
    :city => @currentlocation.city,
    :country => @currentlocation.country
  )
  
  @previousvisitor = Visitor.last(:ip_address.not => env['REMOTE_ADDR'])
  
  if @previous_visitor != nil
    @currentvisitor.save
  end
    
  @lng = "24.402085"
  @lat = "-86.17328"
  
  haml :index
end

DataMapper.auto_upgrade!