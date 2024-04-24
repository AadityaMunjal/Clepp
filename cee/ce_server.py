import requests

# validate must be a code block that gets executed and its print output be the bool testing value
# with inputs but not returning
new_version = {
    "exec_count": 2,
    "__inputs": tuple(((5, 6), (-3, -1))),
    "__validate": """
q1()
q1()
""",
    "__outputs": tuple((6, -1)),
}

code = """
def q1():
    a = int(input())
    b = int(input())
    if a > b:
        print(a)
        # return a
    else:
        print(b)
        # return b
"""

# with args but not returning
new_version = {
    "exec_count": 2,
    "__inputs": tuple(),
    "__validate": """
q1(5, 6)
q1(-3, -1)
""",
    "__outputs": tuple((6, -1)),
}

code = """
def q1(a, b):
    if a > b:
        print(a)
        # return a
    else:
        print(b)
        # return b
"""

# with args and returning
new_version = {
    "exec_count": 2,
    "__inputs": tuple(),
    "__validate": """
print(q1(5, 6))
print(q1(-3, -1))
""",
    "__outputs": tuple((6, -1)),
}

code = """
def q1(a, b):
    if a > b:
        return a
    else:
        return b
"""

# without args and returning
new_version = {
    "exec_count": 2,
    "__inputs": tuple(((5, 6), (-3, -1))),
    "__validate": """
print(q1())
print(q1())
""",
    "__outputs": tuple((6, -1)),
}

code = """
def q1():
    a = int(input())
    b = int(input())
    if a > b:
        return a
    else:
        return b
"""


res = requests.post(
    "http://127.0.0.1:5000/execute", json={"c": code, "tc": new_version}
).json()
print(res)
