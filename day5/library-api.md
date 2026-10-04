# Library API Design

This document outlines the REST API design for the library's **books** resource.

## Endpoints

### 1. List all books
* **Method:** `GET`
* **Path:** `/api/books`
* **Description:** Retrieves a complete list of all books in the library.
* **Success Status Code:** `200 OK`

### 2. List books by an author
* **Method:** `GET`
* **Path:** `/api/books?author={author_name}`
* **Description:** Retrieves a list of books filtered by the specified author using a query parameter.
* **Success Status Code:** `200 OK`

### 3. Get one book
* **Method:** `GET`
* **Path:** `/api/books/{id}`
* **Description:** Retrieves the detailed information of a specific book by its ID.
* **Success Status Code:** `200 OK`

### 4. Create a new book
* **Method:** `POST`
* **Path:** `/api/books`
* **Description:** Adds a new book to the library's catalog.
* **Example Request Body:**
  ```json
  {
    "title": "The Hobbit",
    "author": "J.R.R. Tolkien",
    "isbn": "978-0547928227",
    "publishedYear": 1937
  }
  ```
* **Success Status Code:** `201 Created`

### 5. Update a book
* **Method:** `PUT` (or `PATCH`)
* **Path:** `/api/books/{id}`
* **Description:** Updates the information of an existing book identified by its ID.
* **Example Request Body:**
  ```json
  {
    "title": "The Hobbit: Illustrated Edition",
    "publishedYear": 1997
  }
  ```
* **Success Status Code:** `200 OK`

### 6. Delete a book
* **Method:** `DELETE`
* **Path:** `/api/books/{id}`
* **Description:** Removes a specific book from the library's catalog by its ID.
* **Success Status Code:** `204 No Content`

---

## Error Codes

### 400 Bad Request
* **Example:** Happens when creating a new book (`POST /api/books`), but the request body is missing a required field (e.g., the `title` field is omitted or the JSON is malformed).

### 404 Not Found
* **Example:** Happens when trying to retrieve, update, or delete a book using an ID that does not exist in the database (e.g., `GET /api/books/9999` where no book with ID 9999 exists).
