# Runtime — Task Classifier

## Responsibilities
- Classifies incoming prompt into type:
  - `FEATURE`: New functional capability.
  - `BUGFIX`: Correcting defects.
  - `REFACTOR`: Structural code improvements without behavioral changes.
  - `PERFORMANCE`: Latency and query optimization.
  - `UI_UX`: Styling, layout, and interaction adjustments.
- Assigns complexity rating: Low, Medium, or High.
