# Python Calculator Pro

A modern, high-precision scientific calculator web application powered by a secure **Python Abstract Syntax Tree (AST)** mathematical engine with native **Vercel Serverless Function** deployment.

Built with a React 19 frontend and a Python 3 / Flask backend in a unified, production-ready repository.

---

## Highlights & Architecture

- **100% Python Calculation Backend**: All mathematical evaluations, operator precedence resolution, and function invocations are computed strictly via Python 3—never Node.js or browser `eval()`.
- **Zero `eval()` Security Model**: Uses Python's native `ast` module (`ast.NodeVisitor`) with an explicit whitelist of permissible AST nodes (Binary, Unary, Function Call, Constants). Any dangerous operations (attribute lookup, indexing, imports, exec, loops) are immediately rejected before evaluation.
- **Vercel Serverless Ready**: Designed for one-click deployment on Vercel with Python runtime (`api/index.py`, `api/calculate.py`, `requirements.txt`, and `vercel.json`).
- **High-Precision & Edge Case Resilient**:
  - Division by zero protection.
  - Exponent overflow and recursion DoS protection.
  - Floating point stabilization (e.g., `0.1 + 0.2 = 0.3`).
  - Trigonometric degree (`DEG`) and radian (`RAD`) modes with asymptotic handling (e.g., `tan(90°)`).
  - Implicit multiplication support (`2pi`, `3(4+5)`, `5sqrt(9)`).
  - Postfix factorials (`5!`), percentages (`50%`), and logarithmic operations (`log10`, `ln`, `log2`).
- **SaaS-Grade UI/UX**:
  - Dark mode by default (deep charcoal/navy with electric blue and purple accents) with full light mode toggle.
  - Interactive Calculation History drawer with local browser persistence (`localStorage`), item re-insertion, and one-click copy.
  - Real-time **Python AST & Telemetry Inspector** showing the parsed syntax tree, execution latency in milliseconds, and security status.
  - Full keyboard accessibility and shortcuts modal.
  - Quick memory operations (`MC`, `MR`, `M+`, `M-`, `MS`).

---

## Directory Structure

```text
├── api/
│   ├── calculator_engine.py   # Pure Python AST safe evaluator & CLI bridge
│   ├── index.py               # Flask WSGI Serverless Function for Vercel
│   └── calculate.py           # Direct /api/calculate Vercel handler
├── src/
│   ├── components/
│   │   ├── Calculator.tsx     # Main interactive keypad and display
│   │   ├── HistoryDrawer.tsx  # Persistent calculation history manager
│   │   ├── AstInspector.tsx   # Live AST parse tree and telemetry visualizer
│   │   ├── Header.tsx         # Brand bar, theme toggle, and mode switches
│   │   ├── AboutModal.tsx     # Architecture and security documentation modal
│   │   └── ShortcutsModal.tsx # Keyboard navigation reference
│   ├── types/
│   │   └── index.ts           # Shared TypeScript interfaces
│   ├── App.tsx                # Application root with state orchestration
│   ├── main.tsx               # DOM entry point
│   └── index.css              # Tailwind CSS v4 styling & dark mode setup
├── index.html                 # HTML5 template with JetBrains Mono & Plus Jakarta Sans
├── package.json               # Frontend dependencies & npm scripts
├── requirements.txt           # Python dependencies for Vercel (Flask)
├── server.ts                  # Local Express development bridge & Vite middleware
├── tsconfig.json              # TypeScript compiler configuration
├── vercel.json                # Vercel deployment & API rewrite configuration
└── README.md                  # Complete documentation
```

---

## Safe AST Evaluation Engine

The Python engine operates through `api/calculator_engine.py`:

```
User Input ("sin(90) + sqrt(16) * 2^3")
       │
       ▼
1. Preprocessor (normalizes symbols, inserts implicit *, resolves postfix !)
       │
       ▼
2. ast.parse(expression, mode='eval')
       │
       ▼
3. SafeMathEvaluator(ast.NodeVisitor)
   ├── Whitelist check (Constant, BinOp, UnaryOp, Call, Name)
   ├── Bound check (max exponent = 1000, max factorial = 1000)
   ├── Angle conversion (DEG <-> RAD)
   └── Zero division & domain validation
       │
       ▼
4. Output JSON { status: "success", result: 33, ast_summary: "...", time_ms: 1.2 }
```

### Supported Operations & Functions

| Category | Operators / Functions | Examples |
| :--- | :--- | :--- |
| **Arithmetic** | `+`, `-`, `*`, `/`, `%` (mod), `^` or `**` (power) | `2^10 = 1024`, `10 % 3 = 1` |
| **Trigonometry** | `sin`, `cos`, `tan`, `asin`, `acos`, `atan` | `sin(90) = 1` (in DEG mode) |
| **Hyperbolic** | `sinh`, `cosh`, `tanh` | `cosh(0) = 1` |
| **Logarithms** | `log` (log10), `ln` (natural log), `log2` | `ln(e^3) = 3`, `log(1000) = 3` |
| **Roots & Factorial**| `sqrt`, `cbrt`, `!` or `factorial()` | `sqrt(144) = 12`, `5! = 120` |
| **Constants** | `pi` (`π`), `e`, `tau` (`τ`) | `2 * pi * 5` |
| **Special** | `abs`, `ceil`, `floor`, `round` | `abs(-42) = 42` |

---

## REST API Specification

### `POST /api/calculate`

Evaluates a mathematical expression using Python AST.

#### Request

```http
POST /api/calculate HTTP/1.1
Content-Type: application/json

{
  "expression": "sin(45)^2 + cos(45)^2",
  "angle_mode": "deg"
}
```

#### Successful Response (`200 OK`)

```json
{
  "status": "success",
  "result": 1,
  "formatted": "1",
  "expression": "sin(45)^2 + cos(45)^2",
  "normalized_expression": "sin(45)**2 + cos(45)**2",
  "angle_mode": "deg",
  "ast_summary": "Add(Pow(sin(45), 2), Pow(cos(45), 2))",
  "type": "integer",
  "execution_time_ms": 1.45,
  "operations_count": 6
}
```

#### Error Response (`400 Bad Request`)

```json
{
  "status": "error",
  "error": "Division by zero",
  "expression": "100 / (5 - 5)",
  "angle_mode": "deg",
  "execution_time_ms": 0.8
}
```

---

## Local Development

1. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

2. **Start the local server**:
   ```bash
   npm run dev
   ```
   The local server launches on `http://localhost:3000`. Express proxies requests to the Python AST engine directly via `python3 api/calculator_engine.py`.

3. **Verify Python Engine directly via CLI**:
   ```bash
   python3 api/calculator_engine.py '{"expression": "sqrt(64) + 2^4"}'
   ```

---

## Deploy to Vercel

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Python Calculator Pro"
   git branch -M main
   git remote add origin https://github.com/<your-username>/python-calculator-pro.git
   git push -u origin main
   ```

2. Connect the repository in the **Vercel Dashboard**.
3. Vercel automatically detects the Vite frontend and Python serverless functions in `api/`.
4. Click **Deploy**. Both the React UI and the Python Flask backend are deployed with zero configuration required.

---

## License

Apache-2.0 License.
