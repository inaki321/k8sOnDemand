import requests
import json
import sys

#run --> python loginmainserver.py inaki

# users 
#engineers: rafa, inaki
#lawyers: juan, pepe
#chefs: bori, ximi
#default: anyone

user = sys.argv[1]
url = "http://main-server.local/login/user/"+user
print('calling '+url)
response = requests.request("GET", url)

print('Response from main server: ')
print(response.text)
