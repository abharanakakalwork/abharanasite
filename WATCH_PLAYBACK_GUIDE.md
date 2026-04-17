# Watch Playback Guide

This guide explains every fetcher involved in the course watch page, which Bunny settings must be enabled for this codebase, which ones are not needed, and where to find each setting.

## Goal

When a student opens `/watch/[courseId]`, the app should:

1. Verify the student is logged in.
2. Verify the student purchased the course.
3. Fetch the course curriculum.
4. Generate a signed Bunny Stream playback token.
5. Build the iframe URL.
6. Load the video without a `403`.

If any of those steps fail, the watch page can break.

## Files Involved

- [app/watch/[id]/page.tsx](/d:/thardeye_projects/abharanasite/app/watch/[id]/page.tsx)
- [app/watch/[id\]/page.tsx](/d:/thardeye_projects/abharanasite/app/watch/[id\]/page.tsx)
- [app/api/courses/[id]/watch/route.ts](/d:/thardeye_projects/abharanasite/app/api/courses/[id]/watch/route.ts)
- [lib/bunny-stream.ts](/d:/thardeye_projects/abharanasite/lib/bunny-stream.ts)
- [.env.local](/d:/thardeye_projects/abharanasite/.env.local)

## Watch Flow In Your Code

### 1. Student auth fetcher

The watch page first reads student auth data from:

- `useStudentAuth()`

Purpose:

- Get the current student
- Get the JWT token
- Decide whether the user can continue to the watch page

If this fails:

- The student is redirected back to the course page
- The watch API is never called correctly

Must be working:

- `Yes`

### 2. Watch API fetcher

The main fetcher for the player is:

- `GET /api/courses/[id]/watch`

Defined in:

- [app/api/courses/[id]/watch/route.ts](/d:/thardeye_projects/abharanasite/app/api/courses/[id]/watch/route.ts)

Purpose:

- Validate the student session
- Check course enrollment
- Fetch the course sections and lessons
- Generate signed Bunny playback data for each lesson

Must be working:

- `Yes`

### 3. Lesson progress fetcher

The second fetcher used on the watch page is:

- `GET /api/courses/lessons/complete?courseId=...`

Purpose:

- Show which lessons are completed

Must be working:

- `No` for video playback itself
- `Yes` for progress UI

If this fails:

- The lesson list may not show completion state
- Video can still play if the Bunny flow is correct

### 4. Bunny iframe URL

The frontend finally builds the iframe URL using:

- `libraryId`
- `video_url`
- `token`
- `expires`

Current expected format:

```text
https://iframe.mediadelivery.net/embed/{libraryId}/{videoGuid}?token={token}&expires={expires}&autoplay=true&loop=false&muted=false&preload=true&responsive=true
```

Must be working:

- `Yes`

If this is wrong:

- Bunny returns `403`

## What The Watch API Does

In [app/api/courses/[id]/watch/route.ts](/d:/thardeye_projects/abharanasite/app/api/courses/[id]/watch/route.ts), the server does this:

1. Reads the `Authorization` header.
2. Validates the student token.
3. Checks `course_enrollments` for a paid enrollment.
4. Fetches `courses -> course_sections -> course_lessons`.
5. Filters to published lessons only.
6. Calls `generatePlaybackToken(lesson.video_url)`.
7. Sends `lesson.playback = { token, expires, libraryId }` back to the client.

This means your frontend depends on `lesson.video_url` being the Bunny video GUID.

## What `video_url` Must Contain

In your database, `course_lessons.video_url` must contain:

- The Bunny Stream video GUID

Correct example:

```text
2b7f2c2a-1111-2222-3333-abcdef123456
```

Wrong examples:

```text
https://iframe.mediadelivery.net/embed/638833/2b7f2c2a-1111-2222-3333-abcdef123456
```

```text
https://video.bunnycdn.com/library/638833/videos/2b7f2c2a-1111-2222-3333-abcdef123456
```

```text
abharanakakal.b-cdn.net/some-file.mp4
```

If `video_url` is not the video GUID, token signing will not match the actual Bunny video and playback can return `403`.

## Bunny Settings: Enable Or Not

This section is specific to your current code.

### 1. Bunny Stream library

Needed:

- `Yes`

Why:

- Your code uses `BUNNY_STREAM_LIBRARY_ID`

Where to go:

- Bunny dashboard
- `Stream`
- Open your video library

What to verify:

- The library ID in Bunny matches `BUNNY_STREAM_LIBRARY_ID` in `.env.local`

### 2. Bunny Stream API key

Needed:

- `Yes`

Why:

- Your backend calls Bunny Stream API using `BUNNY_STREAM_API_KEY`

Where to go:

- Bunny dashboard
- `Stream`
- Your library
- `API`

What to verify:

- The API key matches `BUNNY_STREAM_API_KEY`

### 3. Bunny token authentication

Needed:

- `Yes`

Why:

- Your code signs playback URLs using `BUNNY_STREAM_TOKEN_KEY`

Where to go:

- Bunny dashboard
- `Stream`
- Your library
- `Security`

What to verify:

- The token key in Bunny matches `BUNNY_STREAM_TOKEN_KEY`

If this does not match:

- Bunny returns `403`

### 4. Allowed domains / embed restrictions

Needed:

- `Usually yes`

Why:

- If Bunny only allows playback from certain domains, missing localhost or your production domain can cause `403`

Where to go:

- Bunny dashboard
- `Stream`
- Your library
- `Security` or `Embed`

What to add:

- `localhost`
- `localhost:3000`
- your production domain
- `www` version if used

### 5. Video upload and processing

Needed:

- `Yes`

Why:

- The video must exist in Bunny Stream and be ready

Where to go:

- Bunny dashboard
- `Stream`
- Your library
- `Videos`

What to verify:

- The video exists
- The video GUID matches the DB value
- Upload completed
- Processing completed

### 6. Bunny Storage

Needed:

- `No` for this watch iframe problem

Why:

- Your current playback uses Bunny Stream embed URLs, not Bunny Storage pull zone URLs

Related env vars not needed for this issue:

- `BUNNY_STORAGE_ZONE`
- `BUNNY_ACCESS_KEY`
- `BUNNY_PULL_ZONE`

### 7. Custom stream hostname

Needed:

- `No` for the current iframe setup

Why:

- Your current watch page uses `iframe.mediadelivery.net`
- It does not use `BUNNY_STREAM_HOSTNAME` for playback

## Step-By-Step Troubleshooting

Follow these steps in order.

### Step 1. Check the student is authenticated

Where:

- Open the site
- Log in as the student
- Go to `/my-courses` or `/watch/{courseId}`

What should happen:

- No redirect back to the course details page

If broken:

- Fix auth before touching Bunny

### Step 2. Check paid enrollment in Supabase

Where to go:

- Supabase dashboard
- Your project
- `Table Editor`
- `course_enrollments`

What to verify:

- `student_id` matches the logged-in student
- `course_id` matches the watched course
- `status = paid`

If broken:

- `/api/courses/[id]/watch` returns `403`

### Step 3. Check lesson is published

Where to go:

- Supabase dashboard
- `Table Editor`
- `course_lessons`

What to verify:

- `is_published = true`

Why:

- Your watch API filters out unpublished lessons before returning them

### Step 4. Check the lesson `video_url`

Where to go:

- Supabase dashboard
- `Table Editor`
- `course_lessons`

What to verify:

- `video_url` is exactly the Bunny video GUID

If broken:

- Signed token generation can point at the wrong thing
- iframe playback can fail with `403`

### Step 5. Check Bunny library ID

Where to go:

- Bunny dashboard
- `Stream`
- open your library

What to verify:

- Bunny library ID equals `BUNNY_STREAM_LIBRARY_ID`

### Step 6. Check Bunny token key

Where to go:

- Bunny dashboard
- `Stream`
- your library
- `Security`

What to verify:

- Token key equals `BUNNY_STREAM_TOKEN_KEY`

If broken:

- Token hash sent by your backend is invalid
- iframe playback returns `403`

### Step 7. Check Bunny API key

Where to go:

- Bunny dashboard
- `Stream`
- your library
- `API`

What to verify:

- API key equals `BUNNY_STREAM_API_KEY`

Why:

- Useful for uploads and server-side video checks

### Step 8. Check allowed domains

Where to go:

- Bunny dashboard
- `Stream`
- your library
- `Security` or `Embed`

What to verify:

- Your local domain is allowed
- Your production domain is allowed

Recommended entries:

- `localhost`
- `localhost:3000`
- `abharanakakal.com`
- `www.abharanakakal.com`

### Step 9. Check Bunny video exists

Where to go:

- Bunny dashboard
- `Stream`
- your library
- `Videos`

Search for:

- the GUID stored in `course_lessons.video_url`

What to verify:

- The video exists
- It is ready

### Step 10. Check the watch API response in the browser

Where to go:

- Open the watch page in the browser
- Open Developer Tools
- Go to `Network`
- Click the request for `/api/courses/{id}/watch`

What to verify inside the JSON:

- `course_sections`
- `course_lessons`
- `video_url`
- `playback.token`
- `playback.expires`
- `playback.libraryId`

If `playback` is missing:

- The backend token generation is not happening

### Step 11. Check the iframe URL generated by the page

Where:

- [app/watch/[id]/page.tsx](/d:/thardeye_projects/abharanasite/app/watch/[id]/page.tsx)
- [app/watch/[id\]/page.tsx](/d:/thardeye_projects/abharanasite/app/watch/[id\]/page.tsx)

What to verify:

- The final iframe URL includes `token` and `expires`
- The `video_url` segment is the Bunny video GUID

Expected pattern:

```text
https://iframe.mediadelivery.net/embed/638833/{videoGuid}?token={hash}&expires={timestamp}
```

If `token` or `expires` is missing:

- Bunny can return `403`

## Fast Decision Table

Use this if you want the short answer.

| Item | Required for your code? | Notes |
| --- | --- | --- |
| `BUNNY_STREAM_LIBRARY_ID` | Yes | Must match Bunny Stream library |
| `BUNNY_STREAM_API_KEY` | Yes | Needed for Stream API access |
| `BUNNY_STREAM_TOKEN_KEY` | Yes | Needed for signed playback |
| Allowed domains / embed whitelist | Usually yes | Missing domains can cause `403` |
| Bunny video uploaded and processed | Yes | Video must exist and be ready |
| `course_lessons.video_url = Bunny GUID` | Yes | Must be GUID, not full URL |
| `course_lessons.is_published = true` | Yes | Unpublished lessons are filtered out |
| Paid enrollment in `course_enrollments` | Yes | Watch API requires it |
| `BUNNY_STORAGE_ZONE` | No | Not used by iframe playback |
| `BUNNY_ACCESS_KEY` | No | Not used by iframe playback |
| `BUNNY_PULL_ZONE` | No | Not used by iframe playback |
| `BUNNY_STREAM_HOSTNAME` | No | Not used by current watch iframe |

## Most Likely Causes Of `403`

For this codebase, the most likely causes are:

1. `BUNNY_STREAM_TOKEN_KEY` in `.env.local` does not match the Bunny library token key.
2. `course_lessons.video_url` does not contain the correct Bunny video GUID.
3. Allowed embed domains in Bunny do not include your current domain or `localhost:3000`.
4. The Bunny video exists but is not fully ready or processed.

## Security Note

Your `.env.local` contains real secrets. If those secrets were shared, committed, or exposed, rotate them:

- Supabase service role key
- Bunny access key
- Bunny Stream API key
- Bunny Stream token key
- Razorpay secret
- ZeptoMail token
- JWT secret

## Recommended Next Check

If the watch page still shows `403`, check one lesson end-to-end:

1. Find the lesson row in Supabase.
2. Copy its `video_url`.
3. Search that GUID in Bunny Stream.
4. Verify the video exists and is ready.
5. Open `/api/courses/{courseId}/watch` in the browser network tab.
6. Confirm that lesson has a `playback` object with `token`, `expires`, and `libraryId`.

That single check usually reveals the exact failure point.
