import requests
import json
url = "http://orchestrator.local/assign-pod"
payload = json.dumps({
  "group": "engineers"
})
headers = {
  'Content-Type': 'application/json'
}
response = requests.request("POST", url, headers=headers, data=payload)
print(response.text)
