require 'net/http'
require 'json'

class AssemblyAIService
  BASE_URL = 'https://api.assemblyai.com/v2'
  
  def initialize(api_key:)
    @api_key = api_key
  end
  
  # Upload audio file and get transcription
  def transcribe_audio(audio_url:, language: 'en')
    # Step 1: Submit transcription request
    transcript = submit_transcription(audio_url: audio_url, language: language)
    transcript_id = transcript['id']
    
    # Step 2: Poll for completion
    wait_for_transcription(transcript_id: transcript_id)
  end
  
  # Submit transcription job
  def submit_transcription(audio_url:, language: 'en')
    uri = URI("#{BASE_URL}/transcript")
    
    request_body = {
      audio_url: audio_url,
      language_code: language
    }
    
    headers = {
      'authorization' => @api_key,
      'content-type' => 'application/json'
    }
    
    response = make_request(uri, :post, request_body, headers)
    JSON.parse(response.body)
  end
  
  # Get transcription status
  def get_transcription_status(transcript_id:)
    uri = URI("#{BASE_URL}/transcript/#{transcript_id}")
    
    headers = {
      'authorization' => @api_key
    }
    
    response = make_request(uri, :get, nil, headers)
    JSON.parse(response.body)
  end
  
  # Wait for transcription completion (polling)
  def wait_for_transcription(transcript_id:, max_wait: 300, poll_interval: 1)
    start_time = Time.now
    
    loop do
      transcript = get_transcription_status(transcript_id: transcript_id)
      
      if transcript['status'] == 'completed'
        return transcript['text'] || ''
      elsif transcript['status'] == 'error'
        raise "Transcription failed: #{transcript['error']}"
      elsif Time.now - start_time > max_wait
        raise "Transcription timeout"
      end
      
      sleep poll_interval
    end
  end
  
  # Upload local file to AssemblyAI (if needed)
  def upload_file(file_path:)
    uri = URI("#{BASE_URL}/upload")
    
    headers = {
      'authorization' => @api_key
    }
    
    # Read file and upload
    File.open(file_path, 'rb') do |file|
      request = Net::HTTP::Post.new(uri.path)
      headers.each { |key, value| request[key] = value }
      request.body = file.read
      
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      response = http.request(request)
      
      unless response.is_a?(Net::HTTPSuccess)
        raise "AssemblyAI Upload Error: #{response.code} - #{response.body}"
      end
      
      result = JSON.parse(response.body)
      return result['upload_url']
    end
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
      raise "AssemblyAI API Error: #{response.code} - #{response.body}"
    end
    
    response
  end
end

