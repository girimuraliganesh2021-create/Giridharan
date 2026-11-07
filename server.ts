import express from 'express';
import http from 'http';
import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json());

// Helper function to execute calculation strictly through Python AST engine
function executePythonCalculation(payload: { expression: string; angle_mode?: string }): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.resolve(__dirname, 'api/calculator_engine.py');
    const pyProcess = spawn('python3', [pythonScript]);

    let stdoutData = '';
    let stderrData = '';

    pyProcess.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    pyProcess.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    pyProcess.on('close', (code) => {
      if (stdoutData.trim()) {
        try {
          const parsed = JSON.parse(stdoutData.trim());
          return resolve(parsed);
        } catch (err) {
          return resolve({
            status: 'error',
            error: 'Failed to parse Python calculation output',
            raw: stdoutData,
          });
        }
      }

      if (stderrData.trim()) {
        return resolve({
          status: 'error',
          error: stderrData.trim(),
        });
      }

      resolve({
        status: 'error',
        error: `Python process exited with code ${code}`,
      });
    });

    pyProcess.on('error', (err) => {
      reject(err);
    });

    // Write input JSON to Python stdin and end stream
    pyProcess.stdin.write(JSON.stringify(payload));
    pyProcess.stdin.end();
  });
}

// REST API for calculations (invokes Python backend)
app.post('/api/calculate', async (req, res) => {
  const { expression, angle_mode } = req.body || {};

  if (!expression || typeof expression !== 'string' || !expression.trim()) {
    res.status(400).json({
      status: 'error',
      error: 'Mathematical expression is required',
      expression: '',
    });
    return;
  }

  try {
    const pyResult = await executePythonCalculation({
      expression,
      angle_mode: angle_mode || 'deg',
    });

    const statusCode = pyResult.status === 'success' ? 200 : 400;
    res.status(statusCode).json(pyResult);
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      error: `Python calculation bridge error: ${error.message}`,
    });
  }
});

// System health and information endpoints
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'Python Calculator Pro API',
    engine: 'Python 3 AST Safe Math Evaluator',
    node_bridge: 'Express reverse proxy (Dev/Test)',
    vercel_ready: true,
  });
});

app.get('/api/info', (_req, res) => {
  res.json({
    name: 'Python Calculator Pro API',
    version: '1.0.0',
    capabilities: [
      'Basic arithmetic (+, -, *, /, %, ^)',
      'Scientific functions (sin, cos, tan, asin, acos, atan, sinh, cosh, tanh)',
      'Logarithmic functions (log, ln, log2)',
      'Roots and powers (sqrt, cbrt, x^y)',
      'Combinatorics (factorial / !)',
      'Constants (pi, e, tau)',
      'Angle modes (DEG, RAD)',
      'Implicit multiplication and percentage handling',
    ],
    security: 'Strict AST node visitor with zero eval/exec risk',
  });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    // Explicitly handle index.html transformations for root and client routes
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // Serve static frontend build in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/\n`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
