import subprocess
import requests

# code = """
# def q1(a, b):
#     if a > b:
#         return a
#     else:
#         return b
# """

# code = """
# a = int(input())
# b = int(input())
# if a > b:
#     print(a)
# else:
#     print(b)
# """

# raw_test_cases = """{
#     "__inputs": tuple(()),
#     "__outputs": tuple((q1(5, 6) == 6, q1(-1, -3) == -1)),
# }"""

# raw_test_cases = """{
#     "__inputs": tuple(((5, 6), (-1, -3))),
#     "__outputs": tuple((6, -1)),
# }"""

new_version = """{
        "__inputs": ((5, 6),),
        "__validate": "(q1(5, 6) == 6, q1(-1, -3) == -1)",
    }"""


code = """
def q1(a, b):
    if a > b:
        return a
    else:
        return b
"""

res = requests.post(
    "http://127.0.0.1:5000/execute", json={"c": code, "tc": new_version}
).json()
print(res)
