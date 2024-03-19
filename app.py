import docker
import uuid
from flask import Flask, logging, request, jsonify
from timeit import default_timer as timer

from flask_cors import cross_origin


app = Flask(__name__)
client = docker.from_env()


def stream_container_logs(container):
    for line in container.logs(stream=True):
        yield line.decode("utf-8")


def execute_code(code):
    try:
        start = timer()
        container_name = f"code-execution-{uuid.uuid4()}"

        container = client.containers.run(
            "python:3.9-slim",
            command=["python", "-c", code],
            name=container_name,
            detach=True,
            remove=True,
            network_disabled=True,
        )

        container_output = ""

        for log_line in stream_container_logs(container):
            container_output += log_line

        container.stop()

        end = timer()
        print(container_output)
        return container_output, end - start

    except Exception as e:
        return str(e)


@app.route("/execute", methods=["GET"])
@cross_origin()
def handle_execute():
    try:
        data = request.get_json()
        code = data.get("c")
        print(data)

        result, time = execute_code(code)

        print(jsonify({"result": result}))
        return jsonify({"result": result, "exec_time": time})
    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)
