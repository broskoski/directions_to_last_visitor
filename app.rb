require 'sinatra'
require 'data_mapper'
require 'geokit'
require 'haml'
require 'time-lord'
require 'active_support'
require 'rack/contrib/jsonp'

use Rack::JSONP
DataMapper.setup(:default, ENV['DATABASE_URL'] || "sqlite://#{Dir.pwd}/my.db")

class Visitor
  include DataMapper::Resource

  property :id,           Serial
  property :ip_address,   String
  property :longitude,    String
  property :latitude,     String
  property :created_at,   DateTime

end

get '/' do

  ip = request.ip

  @currentlocation = Geokit::Geocoders::MultiGeocoder.geocode(ip)
  @currentvisitor = Visitor.new(
    :ip_address => request.ip,
    :longitude => @currentlocation.lng,
    :latitude => @currentlocation.lat
  )

  puts @currentvisitor.latitude
  puts "ip #{ip}"
  puts "@currentvisitor.ip_address: #{puts @currentvisitor.inspect}"
  puts "@currentlocation.lng #{@currentlocation.inspect}"

  @previousvisitor = Visitor.last
  @previoustime = Time.parse(@previousvisitor.created_at.to_s).ago.to_words.capitalize
  @currentvisitor.save

  puts @previoustime

  haml :index
end

get '/observe' do

  @currentvisitor = Visitor.last
  @previousvisitor = Visitor[-2]
  @previoustime = Time.parse(@previousvisitor.created_at.to_s).ago.to_words.capitalize

  haml :observe
end

get '/all' do
  content_type :json
  Visitor.all(:fields => [:id, :ip_address, :longitude, :latitude]).to_json
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