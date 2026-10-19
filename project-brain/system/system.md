# System Specification — Global Engineering Workflow

## Purpose
Defines the global engineering workflow and execution constraints for AI agents interacting with the TransRoute project.

## Responsibilities
- Receive and process user prompts through deterministic pipelines.
- Enforce strict execution order (Classify -> Graph -> Context -> Plan -> Execute -> Validate -> Review -> Sync).
- Never store raw architecture in memory files.
- Never store implementation details directly in system files.
- Remain stable throughout the lifetime of the project.
