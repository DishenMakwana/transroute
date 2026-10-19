# Standards — Security

## Rules
- **SQL Injection Prevention**: Always use Drizzle ORM parameterized queries or tagged templates. Never concatenate raw SQL strings.
- **Input Sanitization**: Validate all query parameters and payload strings before database insertion.
- **No Secret Leakage**: Keep database connection strings and environment keys strictly server-side in `.env`.
- **CORS & Headers**: Restrict exposed headers and handle edge requests safely.
