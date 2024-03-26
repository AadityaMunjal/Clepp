from threading import Thread
import requests

url = "http://127.0.0.1:5000/execute"


def send_req(code):
    data = {"c": code}

    # Headers for the request, typically including the content type for JSON data
    headers = {"Content-Type": "application/json"}

    # Send the POST request
    # response = requests.get(url, json=data, headers=headers)
    response = requests.get("http://127.0.0.1:5000/execute", json={"c": code})
    # print(response.json())

    # Check the response
    if response.status_code == 200:
        # Request was successful
        print(response.json())
    else:
        # Request failed
        print("Error:", response.status_code)


code = """
for i in range(1, 6):
    print("*"*i)
"""
send_req(code)
