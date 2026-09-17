# Sprint 2 Panel Content API

Base URL: `/api/panel`

All protected content routes follow the same session/auth contract as Sprint 1.

## Required permissions

- Read: `content:view`
- Create/update/delete: `content:manage`

## Standard responses

Single record:

```json
{ "data": { "id": "..." } }
```

Collection:

```json
{
  "data": [],
  "pagination": { "page": 1, "pageSize": 20, "total": 0, "totalPages": 0 }
}
```

Errors use:

```json
{ "error": { "code": "FORBIDDEN", "message": "..." } }
```

## Achievements

Endpoints:

```text
GET    /api/panel/achievements?page=1&pageSize=20&q=hackathon
POST   /api/panel/achievements
GET    /api/panel/achievements/:id
PATCH  /api/panel/achievements/:id
DELETE /api/panel/achievements/:id
```

Create/update body:

```json
{
  "title": "National Programming Award",
  "description": "Awarded for the finals team performance.",
  "date": "2026-02-04T00:00:00.000Z",
  "awardingOrg": "NEUCC",
  "photoUrl": "https://example.com/award.jpg"
}
```

## Contests

Endpoints:

```text
GET    /api/panel/contests?page=1&pageSize=20&q=iupc
POST   /api/panel/contests
GET    /api/panel/contests/:id
PATCH  /api/panel/contests/:id
DELETE /api/panel/contests/:id
```

Create/update body:

```json
{
  "name": "IUPC 2026",
  "date": "2026-02-10T00:00:00.000Z",
  "type": "PROGRAMMING",
  "result": "Champion",
  "registrationLink": "https://example.com/register"
}
```

## Sponsors

Endpoints:

```text
GET    /api/panel/sponsors?page=1&pageSize=20&q=delta
POST   /api/panel/sponsors
GET    /api/panel/sponsors/:id
PATCH  /api/panel/sponsors/:id
DELETE /api/panel/sponsors/:id
```

Create/update body:

```json
{
  "name": "Delta Systems",
  "logoUrl": "https://example.com/logo.png",
  "tier": "GOLD",
  "description": "Technology partner and community supporter."
}
```

## Gallery metadata

Endpoints:

```text
GET    /api/panel/gallery?page=1&pageSize=20&q=event
POST   /api/panel/gallery
GET    /api/panel/gallery/:id
PATCH  /api/panel/gallery/:id
DELETE /api/panel/gallery/:id
```

Create/update body:

```json
{
  "url": "https://example.com/gallery/1.jpg",
  "isVideo": false,
  "eventName": "IUPC 2026",
  "year": 2026
}
```

## Site content

Endpoints:

```text
GET    /api/panel/site-content?page=1&pageSize=20&q=about
POST   /api/panel/site-content
GET    /api/panel/site-content/:key
PATCH  /api/panel/site-content/:key
DELETE /api/panel/site-content/:key
```

Create/update body:

```json
{
  "key": "about.mission",
  "value": { "text": "To build great developers and leaders." }
}
```

## Status codes

- `201`: record created
- `200`: read/update/delete succeeded
- `401`: unauthenticated
- `403`: insufficient permission
- `404`: record or key not found
- `422`: invalid query/body
- `500`: unexpected server error
