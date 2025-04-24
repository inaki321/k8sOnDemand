import requests
import json
import sys

## remember to always use env for python practices
#python3 -m venv ~/my_venv
#source ~/my_venv/bin/activate
## remember to always use env for python practices

#run --> python loginmainserver.py inaki

# users 
#engineers: rafa, inaki
#lawyers: juan, pepe
#chefs: bori, ximi
#default: anyone

user = sys.argv[1]
url = "http://192.168.64.18:31230/login/user/"+user
#url ="http://app-container.local/login/user/"+user
 
print('calling main server by nodeport :  '+url)
print(' you can also call it by ingress domain: http://app-container.local') 

response = requests.request("GET", url)

print('Response from main server: ')
print(response.text)

