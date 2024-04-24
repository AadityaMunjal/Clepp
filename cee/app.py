from flask import Flask, request, jsonify
from timeit import default_timer as timer

from flask_cors import cross_origin

import sys
import io


def exec_python(c):
    original_stdout = sys.stdout
    sys.stdout = output_capture = io.StringIO()

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


# replacing built in input function with custom input feeder to give in inputs from testcases
def answer_inputs(_=""):
    global input_idx
    tc_inputs = testcases["__inputs"]

    input_idx += 1

    return tc_inputs[input_idx]


input = answer_inputs

"""


@app.route("/execute", methods=["POST"])
@cross_origin()
def handle_execute():
    try:
        data = request.get_json()
        code = data.get("c")
        test_cases_dict = data.get("tc")
        exec_count = test_cases_dict["exec_count"]
        testing = test_cases_dict["__validate"]
        valid_output = test_cases_dict["__outputs"]

        c = (
            "testcases = "
            + str(test_cases_dict)
            + inp_handler
            + (code * exec_count)
            + testing
        )

        print("CODE-------------------")
        print(c)

        start = timer()
        result = exec_python(c)
        end = timer()
        print("RESULT-------------------")
        print(result)
        print("VALID-OUTPUT-------------------")
        result_li = list(filter(lambda x: x != "", result.split("\n")))
        print([str(valid_o) == result_li[i] for i, valid_o in enumerate(valid_output)])

        print(jsonify({"result": result}))
        return jsonify({"checks": result, "exec_time": end - start})

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)
