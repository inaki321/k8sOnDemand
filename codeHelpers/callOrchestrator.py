import requests
import json

## remember to always use env for python practices
#python3 -m venv ~/my_venv
#source ~/my_venv/bin/activate
## remember to always use env for python practices

url = "http://orchestrator.local/assign-pod"
payload = json.dumps({
  "group": "engineers"
})
headers = {
  'Content-Type': 'application/json'
}
response = requests.request("POST", url, headers=headers, data=payload)
print(response.text)
