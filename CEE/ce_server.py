import subprocess
import requests

code = """
def q1(a, b):
    if a > b:
        return a
    else:
        return b
"""

code = """
a = int(input())
b = int(input())
if a > b:
    print(a)
else:
    print(b)
"""

raw_test_cases = """{
    "__inputs": tuple(()),
    "__outputs": tuple((q1(5, 6) == 6, q1(-1, -3) == -1)),
}"""

raw_test_cases = """{
    "__inputs": tuple(((5, 6), (-1, -3))),
    "__outputs": tuple((6, -1)),
}"""


res = requests.get(
    "http://127.0.0.1:5000/execute", json={"c": code, "tc": raw_test_cases}
).json()
print(res)
