"""
Python Calculator Pro - Vercel Serverless Function (Flask)
Exposes the safe Python AST calculation engine as a REST API.
"""

from flask import Flask, request, jsonify
try:
    # When deployed inside the api package or as root
    from api.calculator_engine import evaluate_expression
except ImportError:
    from calculator_engine import evaluate_expression

app = Flask(__name__)


@app.route('/api/calculate', methods=['POST', 'OPTIONS'])
def calculate():
    if request.method == 'OPTIONS':
        return '', 204

    data = request.get_json(silent=True) or {}
    expression = data.get('expression', '')
    angle_mode = data.get('angle_mode', 'deg')

    if not expression or not str(expression).strip():
        return jsonify({
            'status': 'error',
            'error': 'Expression is required',
            'expression': ''
        }), 400

    result = evaluate_expression(str(expression), angle_mode=angle_mode)

    status_code = 200 if result.get('status') == 'success' else 400
    return jsonify(result), status_code


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'Python Calculator Pro API',
        'engine': 'Python 3 AST Safe Math Evaluator',
        'environment': 'Vercel Serverless'
    })


@app.route('/api/info', methods=['GET'])
def info():
    return jsonify({
        'name': 'Python Calculator Pro API',
        'version': '1.0.0',
        'capabilities': [
            'Basic arithmetic (+, -, *, /, %, ^)',
            'Scientific functions (sin, cos, tan, asin, acos, atan, sinh, cosh, tanh)',
            'Logarithmic functions (log, ln, log2)',
            'Roots and powers (sqrt, cbrt, x^y)',
            'Combinatorics (factorial / !)',
            'Constants (pi, e, tau)',
            'Angle modes (DEG, RAD)',
            'Implicit multiplication and percentage handling'
        ],
        'security': 'Strict AST node visitor with zero eval/exec risk'
    })


# Fallback root route for direct verification
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    if path.startswith('api/calculate'):
        return calculate()
    return jsonify({'service': 'Python Calculator Pro API', 'endpoint': '/api/calculate'}), 200


if __name__ == '__main__':
    # For local standalone Flask development
    app.run(host='0.0.0.0', port=5000, debug=True)
