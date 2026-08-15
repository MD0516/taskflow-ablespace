# AbleSpace — MongoDB Schema Design

## users
```
{
  _id,
  name,
  email,
  googleId,
  avatarUrl,
  createdAt
}
```
- No `role` field — role (`guest` | `user`) lives only inside the JWT payload, never stored in DB.
- Only real Google-authenticated users get a document. Guests never do.

## projects
```
{
  _id,
  title,
  description,
  priority,      // urgent | high | medium | low | none
  dueDate,
  isPrivate,
  createdBy: userId,
  createdAt
}
```

## tasks
```
{
  _id,
  title,
  description,
  labels: [String],
  resources: [{ label, link }],
  dueDate,
  status,        // todo | doing | completed | onhold
  priority,      // urgent | high | medium | low | none
  assignees: [userId],   // embedded array, not a junction collection
  createdBy: userId,
  projectId,     // null = general/unassigned task
  createdAt,
  updatedAt
}
```

## subTasks
```
{
  _id,
  taskId,
  title,
  description,
  status,
  priority,
  assignees: [userId],
  createdBy: userId,
  createdAt,
  updatedAt
}
```

## taskComments
```
{
  _id,
  taskId,
  userId,
  comment,
  createdAt
}
```

---

### Design notes
- **assignees** on tasks/subtasks are embedded arrays of `userId` refs (not separate junction
  collections like `taskMembers`/`subTaskMembers`) — idiomatic for MongoDB since the list is
  small and bounded. Fetch full user data via `.populate('assignees')`.
- **taskComments** kept as a separate collection since comments can grow unbounded per task —
  keeps the Task document itself lightweight.
- **resources** kept minimal: just `{ label, link }`, no added-by/added-at metadata.
- **Guest vs Member auth**: guests never get a `users` document. Guest JWT payload is
  `{ role: 'guest' }`; member JWT payload is `{ userId, role: 'user' }`. A NestJS Guard checks
  the JWT role on every request — GET always allowed, POST/PATCH/DELETE blocked for guests.
