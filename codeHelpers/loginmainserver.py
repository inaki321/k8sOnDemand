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

clusterIPUrl ="http://10.152.183.100:5000/login/user/" #url for main server using static cluster IP

response = requests.request("GET", url)

print('Response from main server: ')
print(response.text)

