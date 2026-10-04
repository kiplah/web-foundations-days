# School Database Design

## Tables Explanation
* **students:** This table stores the core information about each student in the school. It holds a unique ID, the student's name, and a unique email address to ensure no two students share the same contact method.
* **courses:** This table contains the catalog of classes offered by the school. It holds a unique ID, the course title, and the number of credits the course is worth.
* **enrolments:** This table acts as a bridge between students and courses. It stores a record every time a student signs up for a course, alongside the grade they received for it.

## Relationships
* **One-to-Many:** 
  * A single student can have *many* enrolments (one-to-many from students to enrolments).
  * A single course can have *many* enrolments (one-to-many from courses to enrolments).
* **Many-to-Many:** Students and Courses have a *many-to-many* relationship. A student can take many courses, and a course can be taken by many students. 
* **Why a join table is needed:** Relational databases cannot directly model many-to-many relationships without duplicating large amounts of data. The `enrolments` join table resolves this by holding foreign keys to both `students` and `courses`. It also provides a logical place to store data that relates to the *connection* itself, such as the student's specific `grade` in that specific course. Furthermore, by making the combination of `student_id` and `course_id` the Primary Key, it strictly prevents a student from enrolling in the exact same course twice.

## Indexing
* **Index to add:** `CREATE INDEX idx_student_name ON students(name);`
* **Reason:** In a school system, administrators will frequently search for students by their name to view their profiles or enrolments. By indexing the `name` column, the database can quickly locate the student without having to scan every single row in the `students` table, drastically speeding up queries like `WHERE s.name = 'Alice Smith'`.

## SQL vs NoSQL
For a school enrolment system, **SQL (Relational Database)** is the vastly superior choice. The data in this domain is highly structured and relational by nature—students take courses, and courses have grades—which fits perfectly into strict tabular schemas. SQL databases enforce ACID (Atomicity, Consistency, Isolation, Durability) compliance, ensuring that operations like enrolling a student or assigning a grade are strictly validated and reliably saved without data corruption. Furthermore, preventing duplicate enrolments and cascading deletes requires the strict foreign key constraints that relational databases natively excel at. A NoSQL document database would likely result in duplicated data, making it difficult to keep student information and course lists perfectly synchronized across documents.
