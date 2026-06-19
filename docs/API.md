# IECR API Documentation

All routes expect JSON payloads. Authenticated routes require a `Bearer <token>` header, where the token is obtained from Clerk.

---

## Movies

### `GET /api/movies`
Auth: Not required
Response: `Array<Movie>`

### `POST /api/movies`
Auth: Required (Admin only)
Body: `{ title, backdrop_path, release_year, runtime, rating, votes }`
Response: `Movie`

### `PUT /api/movies/:id`
Auth: Required (Admin only)
Body: `{ backdrop_path, rating, votes }` (all optional)
Response: `{ message, movie: Movie }`

### `DELETE /api/movies/:id`
Auth: Required (Admin only)
Response: `{ message }`

---

## Webseries

### `GET /api/webseries`
Auth: Not required
Response: `Array<Webseries>`

### `POST /api/webseries`
Auth: Required (Admin only)
Body: `{ title, backdrop_path, release_year, seasons, rating, votes }`
Response: `Webseries`

### `PUT /api/webseries/:id`
Auth: Required (Admin only)
Body: `{ backdrop_path, seasons, rating, votes }` (all optional)
Response: `{ message, webseries: Webseries }`

### `DELETE /api/webseries/:id`
Auth: Required (Admin only)
Response: `{ message }`

---

## Watchlist

### `POST /api/watchlist/add`
Auth: Required
Body: `{ movieId }` or `{ webseriesId }`
Response: `{ message }`

### `GET /api/watchlist/me`
Auth: Required
Response: `{ movies: Array<Movie>, webseries: Array<Webseries> }`

### `GET /api/watchlist/ids`
Auth: Required
Response: `Array<String>` (list of IDs)

### `DELETE /api/watchlist/remove`
Auth: Required
Body: `{ movieId }` or `{ webseriesId }`
Response: `{ message }`

---

## Ratings

### `POST /api/ratings`
Auth: Required
Body: `{ contentId, contentType, rating }`
Response: `Rating`

### `GET /api/ratings/me`
Auth: Required
Response: `{ movies: Array<Movie>, webseries: Array<Webseries> }`

### `GET /api/ratings/map`
Auth: Required
Response: `Map<contentId, rating>`

---

## Friends

### `GET /api/friends`
Auth: Required
Response: `Array<Friendship>`

### `POST /api/friends/request`
Auth: Required
Body: `{ toUserId }`
Response: `{ message }`

### `GET /api/users/search?q=...`
Auth: Required
Response: `Array<User>`

---

## Notifications

### `GET /api/notifications`
Auth: Required
Response: `Array<Notification>`

### `PATCH /api/notifications/:id/read`
Auth: Required
Response: `{ message }`

### `PATCH /api/notifications/read-all`
Auth: Required
Response: `{ message }`
