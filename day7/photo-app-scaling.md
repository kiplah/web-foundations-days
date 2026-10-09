# SnapShare Scaling Plan (Day 7 Assignment)

## 1. Assumptions and Daily Active Users
* **Total Registered Users:** 10 million
* **Active User Percentage:** 10% each day
* **Daily Active Users (DAU):** 10 million * 10% = **1,000,000 DAU**
* Each active user uploads 1 photo per day.
* Each active user views 50 feed pages per day.
* Average photo size is 2 MB.
* Thumbnail size is 50 KB.

## 2. Capacity Calculations
* **Uploads per second:**
  * 1,000,000 photos / day
  * 1,000,000 / (24 * 60 * 60) = **~11.57 uploads / second**
* **Feed views per second:**
  * 1,000,000 DAU * 50 views = 50,000,000 views / day
  * Average: 50,000,000 / 86400 = **~578.7 views / second**
  * Peak (5x): 578.7 * 5 = **~2893.5 views / second**
* **Photo storage per year:**
  * Storage per photo = 2 MB + 50 KB = 2.05 MB
  * Daily storage = 1,000,000 * 2.05 MB = 2,050,000 MB = 2.05 TB
  * Yearly storage = 2.05 TB * 365 = **748.25 TB / year**

## 3. Read-Heavy vs. Write-Heavy
* The system is heavily **read-heavy**.
* The ratio of writes (uploads) to reads (feed views) is roughly 1:50 (11.57 vs 578.7).
* **Design Implications:** Because it's read-heavy, the architecture must prioritize fast read access. This means utilizing caching for feed data, Read Replicas for the database to offload read queries from the master, and a CDN to serve the massive volume of static images globally with low latency.

## 4. Photo Storage Location
* Photos should **not** be stored directly inside the relational database as BLOBs. Databases are expensive to scale for massive binary files, and storing them there would bloat the database, significantly slowing down backups and making regular metadata queries slower and more memory-intensive.
* Instead, photos should go into an **Object Storage** service (like Amazon S3), while the database only stores the URL/path to the file.

## 5. Architecture Diagram

```text
       +-------------+
       |   Clients   |
       +------+------+
              |
              v
       +-------------+
       |     CDN     |----------------+ (Serves Photos & Thumbnails)
       +------+------+                |
              |                       |
              v                       |
       +-------------+                |
       |Load Balancer|                |
       +------+------+                |
              |                       |
      +-------+-------+               |
      v               v               |
+-----------+   +-----------+         |
|App Server |   |App Server |         |
+-----------+   +-----------+         |
  |   |   |       |   |   |           |
  |   |   +-------+   |   |           |
  |   |               |   |           v
  |   +---------------+---|----> +----------------+
  |   |               |   +----> | Object Storage |
  v   v               v          +----------------+
+-------+       +-----------+
| Cache |       |   Queue   |----> +----------------+
+-------+       +-----------+      | Worker Node(s) |
                      |            | (Thumbnails)   |
                      v            +----------------+
                +-----------+
                | Database  |
                | (Master)  |
                +-----+-----+
                      |
                      v
                +-----------+
                | Database  |
                | (Replica) |
                +-----------+
```

## 6. Component Explanations
* **CDN (Content Delivery Network):** Reduces latency and server load by caching and serving static media (photos and thumbnails) from geographical edge locations closer to the users.
* **Load Balancer:** Distributes incoming user traffic evenly across multiple application servers to prevent any single server from becoming a bottleneck or single point of failure.
* **App Servers:** Handle the core business logic, such as authenticating users, processing feed requests, and coordinating photo uploads.
* **Cache:** Stores frequently accessed data (like feed metadata and user profiles) in fast memory (RAM) to drastically reduce the load on the database and speed up read response times.
* **Database with a Read Replica:** The Master database handles all write operations (new posts, likes), while the Read Replica(s) handles the high volume of read queries, effectively splitting the database workload.
* **Object Storage:** Provides scalable, cost-effective storage for large binary files (photos and thumbnails) outside of the main relational database.
* **Queue with a worker:** Decouples the slow thumbnail generation process from the main upload flow, allowing the app server to respond to the user immediately while the worker processes the image in the background.

## 7. Step-by-step Upload Flow
1. **User Request:** The user's device sends the photo file and metadata to the App Server.
2. **Store Original:** The App Server saves the original photo directly to Object Storage.
3. **Database Write:** The App Server saves the photo metadata (author ID, timestamp, and Object Storage URL for the original photo) into the Master Database.
4. **Queue Job:** The App Server puts a "create thumbnail" job (containing the photo URL or ID) into the Message Queue.
5. **Acknowledge:** The App Server responds to the user's device, indicating the upload was successful.
6. **Background Processing:** A Worker node picks up the job from the Message Queue, fetches the original photo from Object Storage, generates the 50 KB thumbnail, saves the thumbnail to Object Storage, and updates the Database with the new thumbnail URL.

## 8. Trade-offs
1. **Asynchronous Thumbnail Generation vs. Synchronous:** By using a message queue for thumbnails, we trade immediate completeness for speed. The user gets a much faster upload response, but there is a brief period where the thumbnail might not be ready if a follower requests the feed immediately (eventual consistency in the UI).
2. **Database Read Replicas vs. Single Master:** Using read replicas improves read scalability and performance, but it introduces replication lag. A user might make a post (write to Master) and immediately refresh their feed (read from Replica) and briefly not see their new post until the replica catches up.
