# Everything UMass

Everything UMass is a verified-student campus marketplace for UMass Amherst.

## Live Site

- Production: [everything-umass.tech](https://everything-umass.tech)

## Product Demo

![Everything UMass Demo](umass_marketplace.gif)

## Why This Exists

Everything UMass replaces scattered campus resale channels with one trusted place where:

- only verified UMass users can list and message
- listing discovery is searchable and structured
- chat works directly in the listing workflow
- sellers manage inventory from one dashboard

## Current Feature Set

- UMass-only auth via Google OAuth
- listing CRUD, filters, images, and seller pages
- buyer/seller chat with shared listing cards
- dashboard for listing management
- public listing links and share flows

## Architecture

- `web/`: React + TypeScript + Vite
- `api/`: Spring Boot + Java + JPA
- `deploy/`: Docker Compose + EC2 deployment scripts
- `api/src/main/resources/db/migration/`: Flyway migrations

## Contributing

We are now live and actively accepting contributions.

Start here:

1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Pick an issue from [GitHub Issues](https://github.com/shivraj-S-bhatti/umass-marketplace/issues)
3. Create a branch from `main`
4. Open a PR with a clear before/after summary

High-impact areas:

- marketplace UX polish and mobile responsiveness
- chat reliability and message/thread UX
- performance and observability improvements
- campus expansion modules (clubs, events, sports, common room)

## Local Development

Prereqs:

- Node.js 18+
- Java 21+
- Maven 3.8+
- Docker + Docker Compose

Run locally:

```bash
git clone https://github.com/shivraj-S-bhatti/umass-marketplace.git
cd umass-marketplace
cp deploy/env.example deploy/.env

# terminal 1
mvn spring-boot:run -f api

# terminal 2
npm install -C web
npm run dev -C web
```

Local URLs:

- Web: http://localhost:5173
- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui

## Support

- Issues: [GitHub Issues](https://github.com/shivraj-S-bhatti/umass-marketplace/issues)
- Discussions: [GitHub Discussions](https://github.com/shivraj-S-bhatti/umass-marketplace/discussions)

## License

MIT
