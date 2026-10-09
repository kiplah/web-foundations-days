# TicketHub System Design

## 1. Requirements

### Functional Requirements
* **Browse Events:** Users can view a list of upcoming concerts and events.
* **View Seats:** Users can see the seating map and real-time availability for a specific event.
* **Hold Seats:** Users can temporarily lock/hold a seat while they complete the checkout process.
* **Pay & Purchase:** Users can submit payment to finalize their ticket purchase.
* **View Tickets:** Users can access their purchased tickets.

### Non-Functional Requirements
* **Speed (Low Latency):** The system must load quickly to prevent user frustration, especially during high-stress ticket drops.
* **Correctness (Strong Consistency):** The system must **never** double-book a seat. A ticket can only be sold to one person.
* **Fairness:** The holding system should operate on a first-come, first-served basis.

## 2. Traffic Estimates

* **Normal Traffic:**
  * **Reads:** 50,000 visitors * 10 pages = 500,000 page views per day (Average ~5.8 reads/sec).
  * **Writes:** 5,000 tickets sold per day (Average ~0.06 writes/sec).
* **"Big Sale" Peak (10 minutes):**
  * **Users:** 200,000 people.
  * **Reads:** Assuming 5 requests per user in 10 minutes = 1,000,000 requests (Average ~1,666 reads/sec).
  * **Writes:** 20,000 seats available, but 200,000 people trying to hold/buy. 200,000 purchase attempts / 600 seconds = ~333 writes/sec.
* **Comparison:** During a big sale, read traffic spikes to roughly 300x the normal load, and write traffic (purchase attempts) spikes to over 5000x the normal load. The architecture must handle sudden, massive bursts.

## 3. API Design

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events` | Retrieves a list of upcoming events. |
| `GET` | `/api/events/{id}/seats` | Retrieves the seating map and current availability for an event. |
| `POST` | `/api/seats/{id}/hold` | Temporarily reserves a seat for the user (e.g., for 5 minutes). |
| `POST` | `/api/orders` | Processes payment and finalizes the ticket purchase for held seats. |
| `GET` | `/api/users/{id}/tickets` | Retrieves a list of the user's purchased tickets. |

## 4. Data Model

### Tables and Relationships
* **users:** `id` (PK), `name`, `email`
* **events:** `id` (PK), `name`, `date`, `venue`
* **seats:** `id` (PK), `event_id` (FK), `seat_number`, `status` (AVAILABLE, HELD, SOLD), `hold_expires_at` (TIMESTAMP), `held_by_user_id` (FK)
* **orders:** `id` (PK), `user_id` (FK), `total_price`, `status`, `created_at`

### Preventing Double-Booking
To prevent two people from buying the same seat, we use **database transactions** and **constraints** in a relational database (SQL):
1. **Row-Level Locking:** When a user attempts to hold a seat, the system uses a `SELECT ... FOR UPDATE` query inside a transaction. This locks the specific seat row.
2. **Atomic Updates:** The system checks if the seat `status` is 'AVAILABLE' (or if the `hold_expires_at` is in the past). If so, it updates the status to 'HELD' and commits the transaction. If another user concurrently tries to hold the same seat, they are forced to wait for the first transaction to finish, at which point they will see the status is no longer 'AVAILABLE'.
3. **Unique Constraints:** A unique constraint on `(event_id, seat_number)` ensures duplicate seats cannot exist in the database.

## 5. Architecture

```text
       +-------------+
       |   Clients   |
       +------+------+
              |
              v
       +-------------+
       |     CDN     |----------------+ (Caches UI, images, event lists)
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
  v   v               v          | Waiting Room   |
+-------+       +-----------+    | Queue (Redis)  |
| Cache |       | Database  |    +----------------+
+-------+       | (Master)  |
  (Redis)       +-----+-----+
                      |
                      v
                +-----------+
                | Database  |
                | (Replica) |
                +-----------+
```

### Surviving the Big Sale
* **CDN:** Absorbs the massive read traffic for event details and static assets before the sale starts.
* **Cache (Redis):** Stores the seat availability map. Instead of 200,000 users querying the database every second to see what seats are left, they read from the ultra-fast memory cache.
* **Waiting Room Queue:** Throttles incoming purchase requests. Rather than letting 200,000 people hit the database simultaneously, users are placed in a virtual queue, and the App Servers only process a safe number of users per second.
* **Database (Master/Replica):** The Master handles the critical transactions (holding and buying), while Replicas handle read queries from users viewing their tickets.

## 6. Trade-offs
1. **Caching Seat Availability vs. Real-Time Accuracy:** To survive the 200,000-user spike, we must cache the seat map. The trade-off is that the cache might be slightly stale. A user might click a seat that appears "AVAILABLE" on their screen, but when they try to hold it, the server rejects it because it was just taken. We trade perfect UX for system survival.
2. **Relational Database (SQL) vs. NoSQL Scalability:** We chose a Relational Database to guarantee ACID properties (strict consistency) to prevent double-booking. The trade-off is that SQL databases are harder to scale horizontally for massive write volumes compared to NoSQL. We mitigate this by using a Redis-based waiting room to control the write velocity.
