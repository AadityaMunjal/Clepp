import subprocess
import requests

code = """
a = int(input('enter int '))
b = int(input('enter int ')) 
if a > b:
    print('a is greater')
else:
    print('b is greater')
"""


# get code (single qs at once only), testcases with correct outputs, replace inputs with test data, compare outputs with testcases, return passed test cases (one by one) and errors

raw_test_cases = """[
    {
        "command": "",
        "__inputs": ("5", "6"),
        "__outputs": ("b is greater"),
    },
    {
        "command": "",
        "__inputs": ("-1", "-3"),
        "__outputs": ("a is greater"),
    }
]
"""

inp_handler = """
input_idx = 0
test_case_idx = 0


# replacing built in input function with custom input feeder to give in inputs from testcases
def answer_inputs(_):
    global input_idx, test_case_idx, testcases
    tc_inputs = testcases[test_case_idx]["__inputs"]
    curr_input = tc_inputs[input_idx]

    if input_idx == len(testcases[test_case_idx]["__inputs"]) - 1:
        input_idx = 0
        test_case_idx += 1
    else:
        input_idx += 1

    return curr_input


input = answer_inputs

"""
c = "testcases = " + raw_test_cases + inp_handler + (code * 2)
print(c)


def execute_test_cases():
    res = requests.get("http://127.0.0.1:5000/execute", json={"c": c}).json()
    print(res)


execute_test_cases()
