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
  
  @previousvisitor = Visitor.last
  
  @currentvisitor.save
  
  haml :index
end

post '/update/:id' do
  current = Visitor.get(params[:id])
  current.longitude = params[:lng]
  current.latitude = params[:lat]
  
  if current.save
    status 201
  else
    status 412 
  end
end

DataMapper.auto_upgrade!