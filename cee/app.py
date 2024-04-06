# import docker
# import uuid
from flask import Flask, logging, request, jsonify
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

func_validation = """
funcs = ([f for f in locals().values() if type(f) == type(lambda x: None) and f.__name__[0] in "Qq"])

using_funcs = len(funcs) != 0
# print("using functions", using_funcs)
"""


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

# static
testing = """
print(testcases["__outputs"])
"""


@app.route("/execute", methods=["POST"])
@cross_origin()
def handle_execute():
    try:
        data = request.get_json()
        code = data.get("c")
        raw_test_cases = "{" + data.get("tc") + "}"
        code_count = 1 if "def " in code else 1  # make this dynamic later

        if "def " not in code:
            c = (
                "testcases = "
                + raw_test_cases
                + inp_handler
                + (code + "\n") * code_count
            )
            print(c)

            start = timer()
            result = exec_python(c)
            print(result)
            end = timer()
        else:
            c = (
                inp_handler
                + (code + "\n") * code_count
                + "testcases = "
                + raw_test_cases
                + testing
            )
            print(c)

            start = timer()
            result = exec_python(c)
            end = timer()

        if "def " not in code:
            checks = []
            for i in range(len(eval(raw_test_cases)["__outputs"])):
                o = result.split("\n")[i]
                if str(o) != str(eval(raw_test_cases)["__outputs"][i]):
                    checks.append(False)
                else:
                    checks.append(True)
        else:
            checks = eval(result)

        print(jsonify({"result": result}))
        return jsonify({"checks": checks, "exec_time": end - start})
    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)
