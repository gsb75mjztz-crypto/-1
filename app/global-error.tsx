"use client";

// Root-layout error boundary. Separate from app/error.tsx because a
// failure here means the root layout itself (fonts, Header, Footer)
// might be the thing that broke, so this can't rely on any of that
// still working — it renders its own minimal <html>/<body>, plain inline
// styles only, no design-system components, no next/font. Deliberately
// bare-bones: this is the one screen in the product that must never
// itself be the thing that fails.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
          maxWidth: "40rem",
          margin: "0 auto",
        }}
      >
        <h1>Something went wrong</h1>
        <p>The app hit an unexpected error. It&apos;s on our end.</p>
        <button type="button" onClick={reset}>
          Try again
        </button>
      </body>
    </html>
  );
}
