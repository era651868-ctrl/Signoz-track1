# Agent Ops Command Center

A polished SigNoz hackathon submission for Track 01: AI & Agent Observability.

## What it does

This project turns an AI agent fleet into a trustworthy, enterprise-grade observability experience. It exposes:

- A live command center dashboard for agent health, latency, success rate, spend, and incidents
- A decision-trace view that explains how an agent moved through a workflow
- Signal panels for metrics and logs that feel closer to a real SRE console than a toy demo
- A polished product story centered on trust, clarity, and operational control for AI systems

## Why this stands out

This is designed to feel like a real product that an enterprise could adopt, not a generic template. The experience focuses on:

- Trust: every critical signal is visible and easy to reason about
- Innovation: agent workflows are treated as operational systems, not black boxes
- Real-world value: teams can debug failures, budget overruns, and latency issues quickly
- SigNoz alignment: the experience uses traces, metrics, logs, and an operational narrative in a way that feels native to observability

## Tech stack

- Node.js + Express
- OpenTelemetry tracing
- Responsive vanilla frontend
- SigNoz-ready telemetry structure

## Run locally

```bash
npm install
npm start
```

Then open http://localhost:3000.

## Project structure

- server.js: API server, telemetry hooks, and data models
- public/: dashboard frontend assets
- package.json: dependencies and scripts
- casting.yaml and casting.yaml.lock: reproducible deployment files
- blog-draft.md: submission-ready narrative

## Submission angle

This project is positioned as an Agent Ops Command Center for modern companies running autonomous workflows, copilots, and AI agents in production. It demonstrates how observability can move from an afterthought to a core operating layer for enterprise AI systems.