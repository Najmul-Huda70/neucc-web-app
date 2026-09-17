# Sprint 1 Panel API

Base URL: `/api/panel`

All endpoints require the `access_token` HttpOnly cookie issued by the login API.
Mutation endpoints validate JSON bodies with Zod and write an audit log.

## Standard Responses

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

## Events

Required permission:

- Read: `event:view`
- Create/update/delete: `event:manage`

Endpoints:

```text
GET    /api/panel/events?page=1&pageSize=20&status=UPCOMING&category=WORKSHOP&q=contest
POST   /api/panel/events
GET    /api/panel/events/:id
PATCH  /api/panel/events/:id
DELETE /api/panel/events/:id
```

Create/update body:

```json
{
  "title": "Programming Workshop",
  "description": "Workshop details",
  "date": "2026-10-01T10:00:00.000Z",
  "venue": "CSE Lab",
  "guests": "Faculty Moderator",
  "registrationLink": "https://example.com/register",
  "category": "WORKSHOP",
  "status": "UPCOMING"
}
```

## Notices

Read access is scope-aware:

- `GENERAL`: visible to logged-in users and public general notice API
- `INTERNAL`: Executive Committee only
- `ELECTION`: Election Committee only

Publish permissions:

- General: `notice:publish:general`
- Internal: `notice:publish:internal`
- Election: `notice:publish:election`

Endpoints:

```text
GET    /api/panel/notices?page=1&pageSize=20&scope=GENERAL
POST   /api/panel/notices
GET    /api/panel/notices/:id
PATCH  /api/panel/notices/:id
DELETE /api/panel/notices/:id
```

Create/update body:

```json
{
  "subject": "Club Notice",
  "body": "Notice details",
  "scope": "GENERAL",
  "memoNo": "NEUCC-2026-001",
  "date": "2026-10-01T10:00:00.000Z",
  "pdfUrl": null,
  "imageUrl": null,
  "isPinned": false
}
```

## Status Codes

- `201`: created
- `200`: successful read/update/delete
- `401`: missing, invalid or revoked session
- `403`: insufficient role/post permission
- `404`: record does not exist
- `422`: invalid body or query
- `500`: unexpected server error
