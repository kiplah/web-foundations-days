# Course Reflection

The most difficult concept in the course for me was asynchronous JavaScript, specifically understanding the flow of Promises and `async/await`. Initially, it was challenging to grasp how code could execute out of sequential order without blocking the main browser thread. It felt unpredictable compared to standard synchronous code. I overcame this by building multiple small, focused projects—like the API client in the capstone—and heavily using `console.log` to trace the exact order of execution until the mental model finally clicked.

Based on the feedback I received during my capstone presentation for QuickNotes, the main area for improvement is frontend resilience. While the system design documents detailed a robust, scalable backend, the frontend API client was relatively fragile when facing network issues. If I were to improve it, I would implement robust error recovery, including request timeouts and automatic retries using an exponential backoff strategy, to ensure a smoother user experience even on unstable connections.

Looking ahead, my next learning goal is to dive deeper into backend implementation. I plan to learn Node.js and Express so that I can actually build the APIs I designed in these system design exercises. Transitioning from theoretical design to practical backend coding will help me understand the full stack from end to end.
