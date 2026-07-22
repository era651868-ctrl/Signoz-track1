const state = {
  overview: null,
  incidents: [],
  trace: [],
  metrics: [],
  logs: [],
  reliability: null,
  recommendations: []
};

async function loadOverview() {
  const response = await fetch('/api/overview');
  const data = await response.json();
  const traceResponse = await fetch('/api/trace');
  const traceData = await traceResponse.json();
  const metricsResponse = await fetch('/api/metrics');
  const metricsData = await metricsResponse.json();
  const logsResponse = await fetch('/api/logs');
  const logsData = await logsResponse.json();

  state.overview = data.overview;
  state.incidents = data.incidents;
  state.trace = traceData.trace || [];
  state.metrics = metricsData.metrics || [];
  state.logs = logsData.logs || [];
  state.reliability = data.overview.reliability || null;
  state.recommendations = data.overview.recommendations || [];
  render();
}

function render() {
  if (!state.overview) return;
  document.getElementById('throughput').textContent = state.overview.throughput.toLocaleString();
  document.getElementById('latency').textContent = `${state.overview.p95LatencyMs} ms`;
  document.getElementById('success').textContent = `${state.overview.successRate.toFixed(1)}%`;
  document.getElementById('spend').textContent = `$${state.overview.dailySpend.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  document.getElementById('trustScore').textContent = `${state.overview.trustScore.toFixed(1)}%`;

  const agentList = document.getElementById('agentList');
  agentList.innerHTML = '';
  (state.overview.agents || []).forEach((agent) => {
    const element = document.createElement('div');
    element.className = 'agent-item';
    element.innerHTML = `
      <div class="agent-meta">
        <strong>${agent.name}</strong>
        <span class="badge ${agent.health}">${agent.health}</span>
      </div>
      <p class="small">Latency ${agent.latency}ms • Success ${agent.success}% • Cost $${agent.cost}/run</p>
    `;
    agentList.appendChild(element);
  });

  const incidentList = document.getElementById('incidentList');
  incidentList.innerHTML = '';
  state.incidents.forEach((incident) => {
    const element = document.createElement('div');
    element.className = 'incident-item';
    element.innerHTML = `
      <div class="agent-meta">
        <strong>${incident.title}</strong>
        <span class="badge ${incident.severity === 'critical' ? 'critical' : 'warning'}">${incident.severity}</span>
      </div>
      <p class="small">${incident.detail}</p>
      <p class="small">Owner ${incident.owner} • Status ${incident.status}</p>
      <div class="incident-actions">
        ${incident.status === 'resolved' ? '<span class="badge healthy">resolved</span>' : '<button class="resolve-btn" data-id="' + incident.id + '">Resolve incident</button>'}
      </div>
    `;
    incidentList.appendChild(element);
  });

  const traceList = document.getElementById('traceList');
  traceList.innerHTML = '';
  state.trace.forEach((item) => {
    const element = document.createElement('div');
    element.className = 'trace-item';
    element.innerHTML = `
      <div class="agent-meta">
        <strong>${item.step}</strong>
        <span class="small">${item.time}</span>
      </div>
      <p class="small">${item.detail}</p>
    `;
    traceList.appendChild(element);
  });

  const metricsList = document.getElementById('metricsList');
  metricsList.innerHTML = '';
  state.metrics.forEach((metric) => {
    const element = document.createElement('div');
    element.className = 'metric-item';
    element.innerHTML = `
      <div class="agent-meta">
        <strong>${metric.name}</strong>
        <span class="badge healthy">${metric.trend}</span>
      </div>
      <p class="small">${metric.value}</p>
    `;
    metricsList.appendChild(element);
  });

  const logsList = document.getElementById('logsList');
  logsList.innerHTML = '';
  state.logs.forEach((log) => {
    const element = document.createElement('div');
    element.className = 'metric-item';
    element.innerHTML = `
      <div class="agent-meta">
        <strong>${log.level}</strong>
        <span class="small">${log.time}</span>
      </div>
      <p class="small">${log.message}</p>
    `;
    logsList.appendChild(element);
  });

  const reliabilityList = document.getElementById('reliabilityList');
  reliabilityList.innerHTML = '';
  if (state.reliability) {
    const items = [
      { label: 'SLO compliance', value: `${state.reliability.slo}%` },
      { label: 'Error budget', value: state.reliability.errorBudget },
      { label: 'MTTD', value: state.reliability.mttd },
      { label: 'MTTR', value: state.reliability.mttr }
    ];
    items.forEach((item) => {
      const element = document.createElement('div');
      element.className = 'metric-item';
      element.innerHTML = `<div class="agent-meta"><strong>${item.label}</strong><span class="badge healthy">${item.value}</span></div>`;
      reliabilityList.appendChild(element);
    });
  }

  const recommendationList = document.getElementById('recommendationList');
  recommendationList.innerHTML = '';
  state.recommendations.forEach((item) => {
    const element = document.createElement('div');
    element.className = 'metric-item';
    element.innerHTML = `<p class="small">• ${item}</p>`;
    recommendationList.appendChild(element);
  });

  incidentList.querySelectorAll('.resolve-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-id');
      await fetch(`/api/incidents/${id}/resolve`, { method: 'POST' });
      await loadOverview();
    });
  });
}

document.getElementById('runSimulation').addEventListener('click', async () => {
  const response = await fetch('/api/agent-run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentName: 'Claims Copilot', taskType: 'policy-audit' })
  });
  const payload = await response.json();
  const button = document.getElementById('runSimulation');
  button.textContent = `Run logged • ${payload.run.id}`;
  setTimeout(() => { button.textContent = 'Simulate agent run'; }, 1800);
  loadOverview();
});

document.getElementById('exportReport').addEventListener('click', () => {
  const report = `Agent Ops Command Center briefing\n\nTrust score: ${state.overview?.trustScore ?? 'n/a'}%\nSLO compliance: ${state.reliability?.slo ?? 'n/a'}%\nActive incidents: ${state.incidents.filter((i) => i.status !== 'resolved').length}\n\nRecommended actions:\n- ${state.recommendations.join('\n- ')}`;
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'agent-ops-briefing.txt';
  link.click();
  URL.revokeObjectURL(link.href);
});

loadOverview();
