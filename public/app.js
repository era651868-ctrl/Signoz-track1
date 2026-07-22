const state = {
  overview: null,
  incidents: [],
  trace: [],
  metrics: [],
  logs: []
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

loadOverview();
