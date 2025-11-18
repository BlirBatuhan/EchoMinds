require 'net/http'
require 'json'

class DIdService
  BASE_URL = 'https://api.d-id.com'
  
  def initialize(api_key:, eleven_labs_api_key: nil)
    @api_key = api_key
    @eleven_labs_api_key = eleven_labs_api_key
  end
  
  # Create a talk (avatar video) with text
  def create_talk(text:, voice_id: 'NDTYOmYEjbDIVCKB35i3')
    uri = URI("#{BASE_URL}/talks")
    
    request_body = {
      source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg',
      script: {
        type: 'text',
        provider: {
          type: 'elevenlabs',
          voice_id: voice_id,
          model_id: 'eleven_flash_v2_5'
        },
        input: text
      }
    }
    
    headers = {
      'Authorization' => "Basic #{@api_key}",
      'Content-Type' => 'application/json'
    }
    
    headers['x-api-key-external'] = { elevenlabs: @eleven_labs_api_key }.to_json if @eleven_labs_api_key
    
    response = make_request(uri, :post, request_body, headers)
    JSON.parse(response.body)
  end
  
  # Get talk status
  def get_talk_status(talk_id:)
    uri = URI("#{BASE_URL}/talks/#{talk_id}")
    
    headers = {
      'Authorization' => "Basic #{@api_key}",
      'Content-Type' => 'application/json'
    }
    
    response = make_request(uri, :get, nil, headers)
    JSON.parse(response.body)
  end
  
  # Wait for talk completion (polling)
  def wait_for_completion(talk_id:, max_wait: 60, poll_interval: 2)
    start_time = Time.now
    
    loop do
      talk = get_talk_status(talk_id: talk_id)
      
      return talk['result_url'] if talk['status'] == 'done' && talk['result_url']
      raise "Talk creation failed: #{talk['error']}" if talk['status'] == 'error'
      raise "Talk creation timeout" if Time.now - start_time > max_wait
      
      sleep poll_interval
    end
  end
  
  # All-in-one method: create and wait
  def text_to_speech(text:, voice_id: nil)
    talk = create_talk(text: text, voice_id: voice_id || 'NDTYOmYEjbDIVCKB35i3')
    wait_for_completion(talk_id: talk['id'])
  end
  
  private
  
  def make_request(uri, method, body, headers)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    
    request = case method
              when :post
                Net::HTTP::Post.new(uri.path)
              when :get
                Net::HTTP::Get.new(uri.path)
              end
    
    headers.each { |key, value| request[key] = value }
    request.body = body.to_json if body
    
    response = http.request(request)
    
    unless response.is_a?(Net::HTTPSuccess)
      raise "D-ID API Error: #{response.code} - #{response.body}"
    end
    
    response
  end
end

