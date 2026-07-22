const express = require('express');
const cors = require('cors');
const path = require('path');
const { trace, SpanStatusCode } = require('@opentelemetry/api');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { BasicTracerProvider, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

const app = express();
const port = process.env.PORT || 3000;

const serviceName = process.env.OTEL_SERVICE_NAME || 'agent-ops-command-center';
const exporter = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  ? new OTLPTraceExporter({
      url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT.replace(/\/$/, '')}/v1/traces`
    })
  : undefined;

const provider = new BasicTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    'service.version': '1.0.0'
  })
});

if (exporter) {
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
}
provider.register();

const tracer = trace.getTracer(serviceName);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const generateId = () => Math.random().toString(36).slice(2, 8);
const getAgents = () => [
  { id: 'agent-a', name: 'Policy Router', latency: 182, success: 98, cost: 0.42, health: 'healthy' },
  { id: 'agent-b', name: 'Claims Copilot', latency: 316, success: 94, cost: 0.81, health: 'warning' },
  { id: 'agent-c', name: 'Finance Orchestrator', latency: 128, success: 99, cost: 0.31, health: 'healthy' }
];

const incidents = [
  { id: 'INC-401', title: 'Tool dispatch backlog', severity: 'critical', status: 'open', owner: 'SRE', detail: 'Webhook fan-out spiked after a model retry loop.' },
  { id: 'INC-402', title: 'Token budget anomaly', severity: 'warning', status: 'investigating', owner: 'Finance Ops', detail: 'One agent exceeded the daily budget threshold.' }
];

const traces = [
  { step: 'Intent captured', detail: 'Policy audit request parsed with 87% confidence.', time: '09:41:12' },
  { step: 'Tool dispatch', detail: 'Claims API and retrieval service invoked in parallel.', time: '09:41:17' },
  { step: 'Guardrail assessment', detail: 'Response classified as medium risk and routed through approval chain.', time: '09:41:22' },
  { step: 'Human handoff prepared', detail: 'Follow-up summary packaged for an on-call operator.', time: '09:41:29' }
];

const metrics = [
  { name: 'Token usage', value: '1.84M', trend: '+6.2%' },
  { name: 'Guardrail breaches', value: '3', trend: '-18%' },
  { name: 'Approval queue', value: '14 min', trend: '-9%' },
  { name: 'Trace coverage', value: '99.2%', trend: '+1.1%' }
];

const logs = [
  { level: 'INFO', message: 'Claims Copilot completed policy-audit successfully.', time: '09:41:28' },
  { level: 'WARN', message: 'Latency exceeded threshold for 2 sequential tool calls.', time: '09:41:21' },
  { level: 'INFO', message: 'Approval chain activated after risk score crossed 0.78.', time: '09:41:20' }
];

const alerts = [
  { id: 'ALT-201', title: 'Latency threshold breached', severity: 'high', source: 'Claims Copilot', status: 'active' },
  { id: 'ALT-202', title: 'Error rate climbed above 3%', severity: 'medium', source: 'Policy Router', status: 'active' }
];

const reliability = {
  slo: 99.2,
  errorBudget: '0.8%',
  mttd: '4m',
  mttr: '12m',
  policyConfidence: 92.3,
  trustScore: 98.6
};

const recommendations = [
  'Auto-scale the retrieval path before the next burst window.',
  'Increase guardrail thresholds for the claims workflow to reduce false escalations.',
  'Route high-risk approvals to human review before the budget anomaly repeats.'
];

app.get('/api/health', (req, res) => {
  const span = tracer.startSpan('health.check');
  span.setAttribute('http.route', '/api/health');
  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
  res.json({ status: 'ok', service: serviceName, sigNoz: 'ready' });
});

app.get('/api/overview', (req, res) => {
  const span = tracer.startSpan('overview.fetch');
  span.setAttribute('http.route', '/api/overview');
  span.setAttribute('agent.count', getAgents().length);
  span.end();

  res.json({
    overview: {
      throughput: 18420,
      p95LatencyMs: 294,
      successRate: 97.4,
      activeIncidents: incidents.filter(i => i.status !== 'resolved').length,
      dailySpend: 1284.11,
      traceCoverage: 99.2,
      trustScore: 98.6,
      policyConfidence: 92.3,
      agents: getAgents(),
      alerts,
      metrics,
      logs,
      reliability,
      recommendations
    },
    agents: getAgents(),
    incidents,
    alerts,
    metrics,
    logs,
    reliability,
    recommendations
  });
});

app.get('/api/trace', (req, res) => {
  const span = tracer.startSpan('trace.fetch');
  span.setAttribute('http.route', '/api/trace');
  span.setStatus({ code: SpanStatusCode.OK });
  res.json({ trace: traces });
  span.end();
});

app.get('/api/metrics', (req, res) => {
  const span = tracer.startSpan('metrics.fetch');
  span.setAttribute('http.route', '/api/metrics');
  span.setStatus({ code: SpanStatusCode.OK });
  res.json({ metrics });
  span.end();
});

app.get('/api/logs', (req, res) => {
  const span = tracer.startSpan('logs.fetch');
  span.setAttribute('http.route', '/api/logs');
  span.setStatus({ code: SpanStatusCode.OK });
  res.json({ logs });
  span.end();
});

app.post('/api/agent-run', (req, res) => {
  const span = tracer.startSpan('agent.run');
  span.setAttribute('agent.name', req.body?.agentName || 'Enterprise Agent');
  span.setAttribute('task.type', req.body?.taskType || 'document-review');
  span.setStatus({ code: SpanStatusCode.OK });

  const run = {
    id: generateId(),
    agent: req.body?.agentName || 'Enterprise Agent',
    task: req.body?.taskType || 'document-review',
    latency: 180 + Math.floor(Math.random() * 140),
    cost: (0.2 + Math.random() * 0.9).toFixed(2),
    status: 'completed',
    timestamp: new Date().toISOString()
  };

  span.end();
  res.json({ run });
});

app.post('/api/incidents/:id/resolve', (req, res) => {
  const span = tracer.startSpan('incident.resolve');
  const incident = incidents.find(item => item.id === req.params.id);
  if (incident) {
    incident.status = 'resolved';
    span.setStatus({ code: SpanStatusCode.OK });
    res.json({ ok: true, incident });
  } else {
    span.setStatus({ code: SpanStatusCode.ERROR, message: 'incident not found' });
    res.status(404).json({ ok: false, error: 'incident not found' });
  }
  span.end();
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Agent Ops Command Center running on port ${port}`);
});
