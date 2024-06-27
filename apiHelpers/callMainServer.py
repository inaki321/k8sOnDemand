import requests
import json
url = "http://main-server.local/login/user/engineer"
response = requests.request("GET", url)

print('Response from main server: ')
print(response.text)
