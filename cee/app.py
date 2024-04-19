from flask import Flask, request, jsonify
from timeit import default_timer as timer

from flask_cors import cross_origin

import sys
import io


def exec_python(c):
    original_stdout = sys.stdout
    sys.stdout = output_capture = io.StringIO()
    # print(c)
    try:
        exec(c)
        output = output_capture.getvalue()
        return output
    except Exception as e:
        return str(e)
    finally:
        sys.stdout = original_stdout


app = Flask(__name__)


# static
inp_handler = """
input_idx = 0
test_case_idx = 0


# replacing built in input function with custom input feeder to give in inputs from testcases
def answer_inputs(_=""):
    global input_idx, test_case_idx, testcases
    tc_inputs = testcases["__inputs"][test_case_idx]
    curr_input = tc_inputs[input_idx]

    if input_idx == len(testcases["__inputs"][test_case_idx]) - 1:
        input_idx = 0
        test_case_idx += 1
    else:
        input_idx += 1

    return curr_input


input = answer_inputs

"""

testing = """
print(__name__)
print(eval(testcases["__validate"]))
"""


@app.route("/execute", methods=["POST"])
@cross_origin()
def handle_execute():
    try:
        data = request.get_json()
        code = data.get("c")
        raw_test_cases = data.get("tc")

        c = "testcases = " + raw_test_cases + inp_handler + code + testing

        print(c)

        start = timer()
        result = exec_python(c)
        print(result)
        end = timer()

        validation = eval(result.split("__main__")[1].strip().split("\n")[0].strip())
        print((validation))

        print(jsonify({"result": result}))
        return jsonify({"checks": validation, "exec_time": end - start})

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)
