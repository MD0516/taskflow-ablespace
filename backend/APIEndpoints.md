# AbleSpace — API Endpoint Reference

## Visibility rules (core logic)

**Guests** (role: guest, no `userId` in JWT):
- See ONLY unassigned tasks (`projectId: null`)
- Zero project visibility — not even public ones
- Full read access on tasks they CAN see (comments, subtasks included)
- Blocked from all POST/PATCH/DELETE

**Logged-in users** (role: user):
- See a project if: `isPrivate === false` OR `project.createdBy === userId` OR
  they have an assigned task inside that project (no explicit `members` array —
  membership is derived from `Task.assignees` containing their userId)
- See tasks: unassigned tasks + tasks belonging to any project visible to them
  (per the rule above)
- Full CRUD on everything they can see, via RolesGuard

**Reusable logic to implement once, use in 3 places:**
`ProjectsService.isProjectVisibleToUser(projectId, userId)` — used by
`GET /projects`, `GET /projects/:id`, and `GET /tasks/:id` (task's project
visibility re-checked, not just trusted from list-view filtering).

Query pattern for "projects visible to user":
```typescript
const memberProjectIds = await taskModel.distinct('projectId', { assignees: userId });
const projects = await projectModel.find({
  $or: [
    { isPrivate: false },
    { createdBy: userId },
    { _id: { $in: memberProjectIds } },
  ],
});
```

---

## Endpoints

### `/auth`
| Method | Route | Guard |
|---|---|---|
| GET | `/auth/google` | public |
| GET | `/auth/google/callback` | public |
| POST | `/auth/guest` | public |

### `/users`
| Method | Route | Guard |
|---|---|---|
| GET | `/users` | JwtAuthGuard |
| GET | `/users/me` | JwtAuthGuard |
| PATCH | `/users/me` | JwtAuthGuard, RolesGuard |

### `/projects`
| Method | Route | Guard | Notes |
|---|---|---|---|
| GET | `/projects` | JwtAuthGuard, RolesGuard | guests blocked entirely |
| GET | `/projects/:id` | JwtAuthGuard, RolesGuard | + visibility check |
| POST | `/projects` | JwtAuthGuard, RolesGuard | |
| PATCH | `/projects/:id` | JwtAuthGuard, RolesGuard | |
| DELETE | `/projects/:id` | JwtAuthGuard, RolesGuard | |

### `/tasks`
| Method | Route | Guard | Notes |
|---|---|---|---|
| GET | `/tasks` | JwtAuthGuard | guests: projectId=null only; users: unassigned + visible-project tasks |
| GET | `/tasks/:id` | JwtAuthGuard | + visibility check (reject if project not visible to requester) |
| POST | `/tasks` | JwtAuthGuard, RolesGuard | |
| PATCH | `/tasks/:id` | JwtAuthGuard, RolesGuard | |
| DELETE | `/tasks/:id` | JwtAuthGuard, RolesGuard | |

### `/tasks/:taskId/subtasks`
| Method | Route | Guard | Notes |
|---|---|---|---|
| POST | `/tasks/:taskId/subtasks` | JwtAuthGuard, RolesGuard | |
| PATCH | `/subtasks/:id` | JwtAuthGuard, RolesGuard | top-level, no parent id needed in URL |
| DELETE | `/subtasks/:id` | JwtAuthGuard, RolesGuard | |

No `GET` list endpoint for subtasks — only ever fetched via virtual-populate
on the parent Task (`GET /tasks/:id`).

### `/tasks/:taskId/comments`
| Method | Route | Guard | Notes |
|---|---|---|---|
| POST | `/tasks/:taskId/comments` | JwtAuthGuard, RolesGuard | |
| DELETE | `/comments/:id` | JwtAuthGuard, RolesGuard | |

No `GET` list endpoint for comments — same reasoning, fetched via
virtual-populate on the parent Task.

---

## Query params (for `GET /tasks`)
- `?projectId=<id>` — filter to a specific project
- `?status=<TaskStatus>` — filter by status
- `?priority=<Priority>` — filter by priority