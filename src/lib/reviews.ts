// Real customer reviews only. Paste vouches from your Discord here.
// While this list is empty, the reviews section is hidden on the live site
// and shows clearly-labeled example data only when running locally (npm run dev).

export type Review = {
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  sourceUrl?: string; // optional link to the original Discord message or Trustpilot review
};

export const reviews: Review[] = [
  // { name: "username", rating: 5, quote: "Fast delivery, 10/10.", sourceUrl: "https://discord.com/channels/..." },
];

// Optional: link to your Trustpilot page once you have one.
export const trustpilotUrl: string | null = null;

// Layout preview data. Never shown in production.
export const exampleReviews: Review[] = [
  { name: "Example User", rating: 5, quote: "Sample review — replace with a real vouch from your Discord." },
  { name: "Example User 2", rating: 5, quote: "Sample review — this is placeholder text for the layout preview." },
  { name: "Example User 3", rating: 4, quote: "Sample review — add real reviews in src/lib/reviews.ts." },
  { name: "Example User 4", rating: 5, quote: "Sample review — the section stays hidden on the live site until you do." },
  { name: "Example User 5", rating: 5, quote: "Sample review — placeholder." },
  { name: "Example User 6", rating: 5, quote: "Sample review — placeholder." },
];
