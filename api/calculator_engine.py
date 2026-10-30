#!/usr/bin/env python3
"""
Python Calculator Pro - Core Mathematical Engine
Safe AST-based mathematical expression parser and evaluator.

Security guarantees:
- Pure AST traversal: No unrestricted eval() or exec().
- Strict node whitelist: Only mathematical binary/unary operations, allowed functions, and constants.
- No attribute access, no item indexing, no imports, no reflection, no loops.
- DoS protections: Exponent bounds checking, factorial range checking, recursion limits.
"""

import ast
import json
import math
import re
import sys
import time
from typing import Any, Dict, Tuple, Union

# Constant definitions
ALLOWED_CONSTANTS = {
    'pi': math.pi,
    'π': math.pi,
    'e': math.e,
    'tau': math.tau,
    'τ': math.tau,
}

# Supported mathematical functions
ALLOWED_FUNCTIONS = {
    'sin': math.sin,
    'cos': math.cos,
    'tan': math.tan,
    'asin': math.asin,
    'acos': math.acos,
    'atan': math.atan,
    'sinh': math.sinh,
    'cosh': math.cosh,
    'tanh': math.tanh,
    'sqrt': math.sqrt,
    'cbrt': lambda x: math.pow(x, 1/3) if x >= 0 else -math.pow(-x, 1/3),
    'log': math.log10,       # standard calculator convention: log is log10
    'log10': math.log10,
    'ln': math.log,          # natural logarithm
    'log2': math.log2,
    'exp': math.exp,
    'abs': abs,
    'fabs': math.fabs,
    'ceil': math.ceil,
    'floor': math.floor,
    'round': round,
    'deg': math.degrees,
    'rad': math.radians,
    'factorial': math.factorial,
    'fact': math.factorial,
}

# Max safety bounds
MAX_EXPONENT = 1000
MAX_FACTORIAL_INPUT = 1000
MAX_EXPRESSION_LENGTH = 500


class SafeEvaluationError(Exception):
    """Custom exception for calculation errors."""
    pass


class SafeMathEvaluator(ast.NodeVisitor):
    def __init__(self, angle_mode: str = 'deg'):
        self.angle_mode = angle_mode.lower()
        self.operations_count = 0
        self.max_operations = 2000

    def visit(self, node: ast.AST) -> Any:
        self.operations_count += 1
        if self.operations_count > self.max_operations:
            raise SafeEvaluationError("Expression complexity exceeded maximum threshold.")
        return super().visit(node)

    def visit_Expression(self, node: ast.Expression) -> Any:
        return self.visit(node.body)

    def visit_Constant(self, node: ast.Constant) -> Union[int, float]:
        if isinstance(node.value, (int, float)):
            return node.value
        raise SafeEvaluationError(f"Unsupported constant type: {type(node.value).__name__}")

    # For Python < 3.8 compatibility if ast.Num appears
    def visit_Num(self, node: Any) -> Union[int, float]:
        return node.n

    def visit_UnaryOp(self, node: ast.UnaryOp) -> Union[int, float]:
        operand = self.visit(node.operand)
        if isinstance(node.op, ast.UAdd):
            return +operand
        elif isinstance(node.op, ast.USub):
            return -operand
        raise SafeEvaluationError(f"Unsupported unary operator: {type(node.op).__name__}")

    def visit_BinOp(self, node: ast.BinOp) -> Union[int, float]:
        left = self.visit(node.left)
        right = self.visit(node.right)

        if isinstance(node.op, ast.Add):
            return left + right
        elif isinstance(node.op, ast.Sub):
            return left - right
        elif isinstance(node.op, ast.Mult):
            return left * right
        elif isinstance(node.op, ast.Div):
            if right == 0:
                raise SafeEvaluationError("Division by zero")
            return left / right
        elif isinstance(node.op, ast.FloorDiv):
            if right == 0:
                raise SafeEvaluationError("Division by zero")
            return left // right
        elif isinstance(node.op, ast.Mod):
            if right == 0:
                raise SafeEvaluationError("Modulo by zero")
            return left % right
        elif isinstance(node.op, ast.Pow):
            # Guard against massive computation DOS (e.g. 9999999 ** 9999999)
            if isinstance(right, (int, float)) and abs(right) > MAX_EXPONENT:
                raise SafeEvaluationError(f"Exponent exceeds safe limit ({MAX_EXPONENT})")
            if isinstance(left, (int, float)) and abs(left) > 1000 and isinstance(right, (int, float)) and abs(right) > 100:
                raise SafeEvaluationError("Exponentiation calculation too large to compute safely")
            
            try:
                result = left ** right
                # Check for complex results
                if isinstance(result, complex):
                    raise SafeEvaluationError("Complex number result not supported")
                return result
            except OverflowError:
                raise SafeEvaluationError("Numerical overflow: result is too large to represent")
        else:
            raise SafeEvaluationError(f"Unsupported binary operator: {type(node.op).__name__}")

    def visit_Call(self, node: ast.Call) -> Union[int, float]:
        # Function name must be a simple identifier
        if not isinstance(node.func, ast.Name):
            raise SafeEvaluationError("Dynamic function dispatch is prohibited")

        func_name = node.func.id.lower()
        if func_name not in ALLOWED_FUNCTIONS:
            raise SafeEvaluationError(f"Function '{func_name}' is not permitted")

        func = ALLOWED_FUNCTIONS[func_name]
        args = [self.visit(arg) for arg in node.args]

        # Handle trigonometric degree/radian conversion
        if func_name in ('sin', 'cos', 'tan') and self.angle_mode == 'deg':
            if len(args) != 1:
                raise SafeEvaluationError(f"{func_name}() takes exactly 1 argument")
            # For tan(90) or tan(270), handle asymptotic undefined values
            if func_name == 'tan':
                mod_deg = args[0] % 180
                if abs(mod_deg - 90) < 1e-10:
                    raise SafeEvaluationError(f"tan({args[0]}°) is undefined (vertical asymptote)")
            rad_arg = math.radians(args[0])
            val = func(rad_arg)
            # Clean floating point near-zero values e.g. sin(180) = ~1.22e-16 -> 0
            if abs(val) < 1e-15:
                val = 0.0
            elif abs(val - 1.0) < 1e-15:
                val = 1.0
            elif abs(val + 1.0) < 1e-15:
                val = -1.0
            return val

        if func_name in ('asin', 'acos', 'atan') and self.angle_mode == 'deg':
            if len(args) != 1:
                raise SafeEvaluationError(f"{func_name}() takes exactly 1 argument")
            try:
                rad_val = func(args[0])
                return math.degrees(rad_val)
            except ValueError as e:
                raise SafeEvaluationError(f"Invalid domain for {func_name}: {e}")

        # Factorial validations
        if func_name in ('factorial', 'fact'):
            if len(args) != 1:
                raise SafeEvaluationError("factorial() takes exactly 1 argument")
            n = args[0]
            if not isinstance(n, int) and not (isinstance(n, float) and n.is_integer()):
                raise SafeEvaluationError("factorial() only accepts non-negative integers")
            n = int(n)
            if n < 0:
                raise SafeEvaluationError("factorial() cannot be calculated for negative numbers")
            if n > MAX_FACTORIAL_INPUT:
                raise SafeEvaluationError(f"Factorial input exceeds safe maximum of {MAX_FACTORIAL_INPUT}")
            return math.factorial(n)

        # Domain checks for logarithms and sqrt
        if func_name in ('log', 'log10', 'ln', 'log2'):
            if len(args) != 1:
                raise SafeEvaluationError(f"{func_name}() takes exactly 1 argument")
            if args[0] <= 0:
                raise SafeEvaluationError(f"Cannot calculate {func_name}() of non-positive number ({args[0]})")

        if func_name == 'sqrt':
            if len(args) != 1:
                raise SafeEvaluationError("sqrt() takes exactly 1 argument")
            if args[0] < 0:
                raise SafeEvaluationError(f"Cannot calculate square root of negative number ({args[0]})")

        try:
            return func(*args)
        except (ValueError, ZeroDivisionError, OverflowError) as e:
            raise SafeEvaluationError(f"Math domain error in {func_name}(): {str(e)}")

    def visit_Name(self, node: ast.Name) -> Union[int, float]:
        name = node.id.lower()
        if name in ALLOWED_CONSTANTS:
            return ALLOWED_CONSTANTS[name]
        raise SafeEvaluationError(f"Undefined variable or symbol: '{node.id}'")

    def generic_visit(self, node: ast.AST) -> Any:
        # Explicit rejection of any unhandled AST nodes
        raise SafeEvaluationError(f"Operation or syntax '{type(node).__name__}' is strictly disallowed")


def summarize_ast(node: ast.AST) -> str:
    """Returns a safe, concise structural summary of the parsed AST."""
    if isinstance(node, ast.Expression):
        return summarize_ast(node.body)
    elif isinstance(node, ast.Constant):
        return str(node.value)
    elif isinstance(node, ast.BinOp):
        op_name = type(node.op).__name__
        return f"{op_name}({summarize_ast(node.left)}, {summarize_ast(node.right)})"
    elif isinstance(node, ast.UnaryOp):
        op_name = type(node.op).__name__
        return f"{op_name}({summarize_ast(node.operand)})"
    elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
        args_str = ", ".join(summarize_ast(a) for a in node.args)
        return f"{node.func.id}({args_str})"
    elif isinstance(node, ast.Name):
        return node.id
    return type(node).__name__


def preprocess_expression(expr: str) -> str:
    """
    Cleans and standardizes mathematical expression string before AST parsing:
    - Normalizes operators (× -> *, ÷ -> /, ^ -> **, − -> -)
    - Replaces unicode symbols (π -> pi, √ -> sqrt)
    - Inserts implicit multiplication (e.g. 2pi -> 2*pi, 3(4+5) -> 3*(4+5))
    - Postfix factorial conversion (5! -> factorial(5))
    - Percentage handling
    """
    if not expr or not expr.strip():
        raise SafeEvaluationError("Empty expression provided")

    s = expr.strip()
    if len(s) > MAX_EXPRESSION_LENGTH:
        raise SafeEvaluationError(f"Expression exceeds maximum length of {MAX_EXPRESSION_LENGTH} characters")

    # Replace typographical characters
    s = s.replace('×', '*').replace('✕', '*').replace('x', '*').replace('X', '*')
    s = s.replace('÷', '/').replace('∕', '/')
    s = s.replace('−', '-').replace('–', '-').replace('—', '-')
    s = s.replace('^', '**')
    s = s.replace('π', 'pi')
    s = s.replace('mod', '%').replace('MOD', '%')

    # Handle square root symbol: √(x) or √x
    # √(\d+(\.\d+)?) -> sqrt(\1)
    s = re.sub(r'√\s*\(([^)]+)\)', r'sqrt(\1)', s)
    s = re.sub(r'√\s*([0-9]+(\.[0-9]+)?)', r'sqrt(\1)', s)
    s = s.replace('√', 'sqrt')

    # Handle factorial postfix: e.g. 5! -> factorial(5) or (3+2)! -> factorial(3+2)
    # Loop to handle chained factorials if any
    while '!' in s:
        # Match parenthesized expression followed by !
        match_paren = re.search(r'\(([^()]+)\)!', s)
        if match_paren:
            s = s[:match_paren.start()] + f"factorial({match_paren.group(1)})" + s[match_paren.end():]
            continue
        # Match number or variable name followed by !
        match_num = re.search(r'([a-zA-Z0-9_\.]+)!', s)
        if match_num:
            s = s[:match_num.start()] + f"factorial({match_num.group(1)})" + s[match_num.end():]
            continue
        break

    # Handle implicit percentage e.g. "50%" -> "(50/100)"
    # But preserve modulo "%" between numbers: e.g. "10 % 3"
    # A % following a number/paren without another operand or followed by +, -, *, /, ), or end is percentage
    s = re.sub(r'(\d+(?:\.\d+)?)\s*%(?!\s*[0-9a-zA-Z_(\[])', r'(\1/100)', s)
    s = re.sub(r'\)\s*%(?!\s*[0-9a-zA-Z_(\[])', r')/100', s)

    # Implicit multiplication:
    # 1. Number immediately followed by parenthesis: 2(3+4) -> 2*(3+4)
    s = re.sub(r'(\d+)\s*\(', r'\1*(', s)
    # 2. Closing parenthesis immediately followed by number or opening parenthesis: )( -> )*(, )2 -> )*2
    s = re.sub(r'\)\s*\(', r')*(', s)
    s = re.sub(r'\)\s*(\d+)', r')*\1', s)
    # 3. Number immediately followed by known constant or function name: 2pi -> 2*pi, 2sqrt -> 2*sqrt
    keywords = 'pi|e|tau|sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|sqrt|cbrt|log|ln|log10|log2|exp|abs|factorial'
    s = re.sub(rf'(\d+)\s*({keywords})\b', r'\1*\2', s)
    # 4. Closing parenthesis followed by constant or function name
    s = re.sub(rf'\)\s*({keywords})\b', r')*\1', s)

    return s


def format_result(val: Union[int, float]) -> Tuple[Union[int, float], str, str]:
    """Formats the numerical result cleanly without unnecessary float artifacts."""
    if isinstance(val, (int, float)):
        if math.isinf(val):
            return val, "Infinity", "infinity"
        if math.isnan(val):
            return val, "NaN", "nan"

        # Check if float is essentially an integer
        if isinstance(val, float) and val.is_integer() and abs(val) < 1e15:
            int_val = int(val)
            return int_val, f"{int_val:,}", "integer"

        if isinstance(val, int):
            return val, f"{val:,}", "integer"

        # Float formatting: round small discrepancies like 0.1 + 0.2 = 0.30000000000000004
        rounded = round(val, 12)
        if rounded.is_integer() and abs(rounded) < 1e15:
            int_val = int(rounded)
            return int_val, f"{int_val:,}", "integer"

        # Scientific notation for extremely large or tiny numbers
        if abs(rounded) >= 1e12 or (0 < abs(rounded) < 1e-6):
            formatted = f"{rounded:.8e}".replace('e+0', 'e+').replace('e-0', 'e-')
            return rounded, formatted, "scientific"

        # Normal clean float display
        formatted = f"{rounded:g}"
        return rounded, formatted, "float"

    return val, str(val), "unknown"


def evaluate_expression(expression: str, angle_mode: str = 'deg') -> Dict[str, Any]:
    """
    Main evaluation pipeline:
    1. Preprocesses the expression
    2. Parses into Python AST
    3. Traverses via SafeMathEvaluator
    4. Formats result and measures execution time
    """
    start_time = time.perf_counter()
    try:
        processed_expr = preprocess_expression(expression)
        
        # Parse into AST in 'eval' mode
        try:
            tree = ast.parse(processed_expr, mode='eval')
        except SyntaxError as e:
            raise SafeEvaluationError(f"Syntax error: {e.msg} at position {e.offset or 0}")

        # Evaluate safely
        evaluator = SafeMathEvaluator(angle_mode=angle_mode)
        raw_result = evaluator.visit(tree)

        # Check result
        if not isinstance(raw_result, (int, float)):
            raise SafeEvaluationError("Evaluation did not produce a real numeric value")

        val, formatted, num_type = format_result(raw_result)
        ast_summary = summarize_ast(tree)
        execution_time_ms = round((time.perf_counter() - start_time) * 1000, 3)

        return {
            "status": "success",
            "result": val,
            "formatted": formatted,
            "expression": expression,
            "normalized_expression": processed_expr,
            "angle_mode": angle_mode,
            "ast_summary": ast_summary,
            "type": num_type,
            "execution_time_ms": execution_time_ms,
            "operations_count": evaluator.operations_count
        }

    except SafeEvaluationError as e:
        execution_time_ms = round((time.perf_counter() - start_time) * 1000, 3)
        return {
            "status": "error",
            "error": str(e),
            "expression": expression,
            "angle_mode": angle_mode,
            "execution_time_ms": execution_time_ms
        }
    except Exception as e:
        execution_time_ms = round((time.perf_counter() - start_time) * 1000, 3)
        return {
            "status": "error",
            "error": f"Evaluation error: {str(e)}",
            "expression": expression,
            "angle_mode": angle_mode,
            "execution_time_ms": execution_time_ms
        }


if __name__ == '__main__':
    # Can be called with JSON argument or from stdin
    input_data = {}
    if len(sys.argv) > 1:
        try:
            input_data = json.loads(sys.argv[1])
        except Exception:
            input_data = {"expression": sys.argv[1]}
    else:
        try:
            raw_input = sys.stdin.read().strip()
            if raw_input:
                input_data = json.loads(raw_input)
        except Exception:
            input_data = {"expression": "0"}

    expr = input_data.get('expression', '0')
    angle_mode = input_data.get('angle_mode', 'deg')
    output = evaluate_expression(expr, angle_mode=angle_mode)
    print(json.dumps(output))
