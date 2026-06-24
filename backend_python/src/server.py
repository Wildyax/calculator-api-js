from flask import Flask, request, jsonify, make_response
from calculator import Calculator

app = Flask(__name__)
calculator = Calculator()
PORT = 3000


@app.after_request
def add_cors_headers(response):
    """Ajoute les headers CORS à toutes les réponses."""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    # S'assurer que le Content-Type est toujours correct
    if response.content_type:
        response.headers['Content-Type'] = response.content_type + '; charset=utf-8'
    return response


@app.route('/calculate', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def calculate():
    """Gère les requêtes sur /calculate."""
    # Méthode OPTIONS
    if request.method == 'OPTIONS':
        return make_response('', 204)

    # Méthode GET
    if request.method != 'GET':
        resp = make_response(
            jsonify({"error": "Méthode non autorisée. Utiliser GET."}),
            405
        )
        resp.headers['Allow'] = 'GET, OPTIONS'
        return resp

    # Vérifier les paramètres requis
    operation = request.args.get('operation')
    a = request.args.get('a')
    b = request.args.get('b')

    if operation is None or a is None or b is None:
        return make_response(
            jsonify({"error": "Paramètres attendus : operation, a, b"}),
            400
        )

    # Convertir a et b en float
    try:
        num_a = float(a)
        num_b = float(b)
    except (ValueError, TypeError):
        return make_response(
            jsonify({"error": "Les paramètres a et b doivent être des nombres."}),
            400
        )

    # Exécuter l'opération
    try:
        op = str(operation)

        if op == 'add':
            result = calculator.add(num_a, num_b)
        elif op == 'subtract':
            result = calculator.subtract(num_a, num_b)
        elif op == 'multiply':
            result = calculator.multiply(num_a, num_b)
        elif op == 'divide':
            result = calculator.divide(num_a, num_b)
        else:
            return make_response(
                jsonify({"error": "Opération inconnue. Utiliser : add, subtract, multiply, divide"}),
                400
            )

        return jsonify({
            "operation": op,
            "a": num_a,
            "b": num_b,
            "result": result
        })

    except ValueError as e:
        return make_response(
            jsonify({"error": str(e)}),
            400
        )
    except Exception as e:
        return make_response(
            jsonify({"error": str(e)}),
            400
        )


# Route pour toutes les autres URL (404)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    """Retourne 404 pour toutes les autres routes."""
    return make_response(
        jsonify({"error": "Route introuvable."}),
        404
    )


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=True)
