import requests
import json

def fetch_puzzle_for_user(username):
    url = "http://localhost:3000/api/fetch-puzzle-for-user"
    headers = {'Content-Type': 'application/json'}
    payload = {'username': username}

    response = requests.post(url, headers=headers, data=json.dumps(payload))

    if response.status_code == 200:
        return response.json()
    else:
        return f"Error: {response.status_code}"
    
def generate_puzzles(count):
    url = "http://localhost:3000/api/generate-puzzles"
    headers = {'Content-Type': 'application/json'}
    payload = {'count': 10}

    response = requests.post(url, headers=headers, data=json.dumps(payload))

    if response.status_code == 200:
        return response.json()
    else:
        return f"Error: {response.status_code}"

# Example usage
#print(fetch_puzzle_for_user("ansel"))
print(generate_puzzles(10))