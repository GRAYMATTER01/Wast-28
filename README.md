

We Want Waste - Skip Hire Website

This is a modern, responsive web app for skip hire, built with React, TypeScript, and Tailwind CSS. The design uses a fresh purple and mint color scheme to keep the experience clean, simple, and user-friendly.



## How I Built It

I approached this project like it was a real production app — focusing on writing clean, modular code that’s easy to maintain and performs well. Here’s a rundown of what I did and why:

1. **Started with a React + TypeScript Template**

   * I kicked things off with creating react app using vite with TypeScript so I’d catch type errors early on.
   * Removed extra boilerplate files to keep the project lightweight.

2. **Set Up Tailwind CSS**


   * Added Tailwind’s base styles to `index.css` so I could use its utility classes throughout.

3. **Defined a Clear Data Model**

   * Created a `SkipOption` interface to clearly define the data shape for each skip, including size, pricing, area, availability, and more.
   * This helped keep data consistent and made it easy to mock API responses.

4. **Built Core UI Components**

   * **SkipCard:** Shows skip images and details, highlights if selected, and indicates if a skip is forbidden.
   * **SearchBar:** Lets users filter skips by size or keywords, with input debounced for better performance.
   * **FilterTabs:** Lets users filter skips by size category (small, medium, large). On mobile, it slides up as a bottom sheet.
   * **SortMenu:** Dropdown to sort skips by size or price, ascending or descending.
   * **ConfirmModal:** A reusable modal to confirm skip selection, with a friendly note about images being illustrative.
   * **ProgressTracker:** A simple stepper showing the user’s progress through the booking steps.

5. **Mock API and Fetch Logic**

   * Created a fake `fetchSkips` function that returns hardcoded skip data.
   * On page load, the app fetches this data and shows skeleton loaders while waiting.

6. **Filtering, Sorting, and Selection Logic**

   * Managed states for skips, filtered skips, search term, category filter, sort option, and the selected skip.
   * Used a single effect to update the filtered list whenever any of these states change.
   * Rendered the filtered list as a responsive grid of skip cards.

7. **Selection Confirmation Flow**

   * When a skip is selected, a confirmation modal pops up reminding users the images are just examples.
   * Upon confirmation, the selection is logged and a toast notification appears.

8. **Responsive and Accessible Design**

   * Added proper ARIA labels and keyboard focus styles to interactive elements.
   * The grid adjusts from one column on mobile up to three columns on larger screens.
   * Images have alt text for screen readers.



9. **Final Polish**

    * Added loading skeletons to improve perceived performance.
    * Improved typography with Tailwind’s prose classes for better readability.
    * Tested on Chrome and Safari mobile simulators to ensure it looks great everywhere.

By building it this way, the app is clean, well-typed, and easy to extend with features like real APIs or user authentication down the line.



How to Run the Project

What You’ll Need

* Node.js version 18 or higher
* pnpm installed globally (`npm install -g pnpm`)

Steps

1. Clone the repo:

   ```bash
   git clone <repository-url>
   ```
2. Go into the project folder:

   ```bash
   cd <repo-folder>
   ```
3. Install dependencies:

   ```bash
   pnpm install
   ```
4. Start the app:

   ```bash
   pnpm dev
   ```



