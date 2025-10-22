## Project task list

This document contains the task list derived from your requirements. I will not add any code to the repository without your permission. As we start each task I will explain the task, provide a recommended implementation approach, and only supply sample code when you ask for it.

---

### Summary

- Chosen API (required): TheDogAPI — returns dog images and breed data (breed name, temperament, life span, weight, etc.). An API key is stored in the project's `.env` as `VITE_APP_ACCESS_KEY` and will be used by the client.
- Display contract: for each result we will display a single image and at least three consistent attributes (for example: breed name, temperament, life span). Attribute values will be clickable to ban/unban.

---

### Tasks

1. Choose API and define data contract

  - Description: Select a public API that returns an image and consistent attributes (the API chosen for this project is TheDogAPI at https://thedogapi.com/). Define the normalized data shape the app will use (for example: { id, imageUrl, attributes: { breed, temperament, life_span } }).
   - Acceptance criteria:
     - API chosen and documented in this file
     - Data contract defined and stable attribute keys chosen
   - Files/notes: this `TASKS.md` (design notes)

2. Add API client module

   - Description: Add an API client module `src/api.js` (or `src/api/index.js`) exposing `fetchRandomItem()` which returns a normalized object matching the data contract. The function should handle network errors and expose retry or timeout behavior to the caller.
   - Acceptance criteria:
     - `fetchRandomItem()` specification documented here
     - No code added without your permission
   - Files to create (upon your approval): `src/api.js`

3. Create Discover UI and result card

   - Description: Update `src/App.jsx` to add a Discover button that triggers `fetchRandomItem()` and displays a single result card. The card shows the image and at least three consistent attributes. Only one result displayed at a time.
   - Acceptance criteria:
     - Discover button triggers an API call
     - Result card shows image and the selected attributes
     - Attributes shown match the image data
   - Files to modify (upon your approval): `src/App.jsx`, styling files (`src/App.css` or `index.css`)

4. Make attributes clickable and manage ban list

   - Description: Make displayed attribute values clickable. Clicking an attribute value adds that value to a ban list (by attribute key). Clicking a value in the ban list removes it. Ban list UI should be visible (grouped by attribute key).
   - Acceptance criteria:
     - At least one attribute is clickable (preferably all shown attributes)
     - Clicking an attribute adds it to the visible ban list
     - Clicking a ban list item removes it
   - Files to modify (upon your approval): `src/App.jsx`

5. Enforce ban list on new API calls

   - Description: Prevent results with banned attribute values from being displayed. On Discover, if the fetched result contains any banned values, the client should refetch up to a retry limit (e.g., 6–10 attempts) and otherwise show a friendly message if no suitable result is found.
   - Acceptance criteria:
     - No displayed result contains banned attribute values
     - Retry behavior documented and implemented only after you approve code changes
   - Files to modify (upon your approval): `src/api.js`, `src/App.jsx`

6. Randomness and repeat frequency considerations

  - Description: Ensure each Discover click requests a fresh random result. Document expected repeat likelihood and that repeats are permitted but should be uncommon with TheDogAPI.
   - Acceptance criteria:
     - Documentation added in `README.md` or `TASKS.md`

7. Persist ban list (optional enhancement)

   - Description: Persist the ban list in `localStorage` so bans survive page reloads. Restore on app start.
   - Acceptance criteria:
     - Ban list persistence documented here
     - Implementation only after your approval

8. Accessibility and UX polish

   - Description: Keyboard accessibility for clickable attributes and ban list, loading indicators, disabling the Discover button while fetching, and small CSS improvements.
   - Acceptance criteria:
     - Basic accessibility considerations documented
     - Visual loading state planned

9. Manual test plan and README updates

   - Description: Add a short test plan and update `README.md` with instructions for running and testing the app, the chosen API, retry limits, and persistence behavior.
   - Acceptance criteria:
     - README updated upon your approval

---

### Data contract (example)

Normalized object returned by the API client (example shape):

```
{
  id: string,            // image id or breed id from TheDogAPI
  imageUrl: string,     // url to the dog image
  attributes: {
    breed: string,       // primary breed name
    temperament: string, // temperament text (comma-separated)
    life_span: string,   // e.g. "10 - 12 years"
    weight: string       // weight display string
    // additional attributes can be added but the displayed attribute keys must remain consistent
  }
}
```

Clickable attributes: the values inside `attributes` will be clickable and their literal values will be added to the ban list.

Ban list model: an object keyed by attribute name, each mapping to an array of forbidden values, e.g.

```
{
  country: ["Canada", "France"],
  name: ["John Doe"]
}
```

When fetching a new result, any match between a result's attribute value and a ban list value will cause the client to reject that result and attempt another fetch (up to the retry limit). Note: TheDogAPI returns breed information in a `breeds` array on the image object; the client should use the first available breed object to populate the `attributes` fields and for ban comparisons.

---

### How we'll work

- I will not add code without explicit permission.
- When you want me to start a task, tell me which task number to start. I will then:
  1. Explain the task in more detail and list files to change.
  2. Provide a recommended implementation approach and edge cases to watch for.
  3. Offer sample code if you ask for it.

---

### Notes / open questions

- Confirm we will use TheDogAPI (done). The project's `.env` already contains an access token stored as `VITE_APP_ACCESS_KEY` which the client should read via `import.meta.env.VITE_APP_ACCESS_KEY`.
- Decide whether we should persist the ban list (I recommend yes).

---

Last updated: 2025-10-21
