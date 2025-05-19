# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running the Application

1.  **Install Dependencies**:
    If you haven't already, open your terminal and run:
    ```bash
    npm install
    ```

2.  **Run the Development Server**:
    To start the Next.js development server, run:
    ```bash
    npm run dev
    ```
    This will typically start the application on `http://localhost:9002`.

3.  **Run the Genkit Development Server (Optional)**:
    If your application utilizes Genkit for AI functionalities, you'll need to run the Genkit development server as well. Open a separate terminal window and run:
    ```bash
    npm run genkit:dev
    ```
    Alternatively, if you want Genkit to automatically restart when its files change, use:
    ```bash
    npm run genkit:watch
    ```

Make sure both the Next.js development server and the Genkit development server (if used) are running simultaneously for full application functionality.
