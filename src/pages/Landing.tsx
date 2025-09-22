import { FormEvent, useState } from "react";
import "../styles/landing.css";

import logoMark from "../assets/cashgrow-logo.png";
import storyGraphic from "./landing/What is CashGrow about.svg";
import explanationGraphic from "./landing/A bit of explanation.svg";
import roadmapGraphic from "./landing/To be continued....svg";

const FORMS_ENDPOINT = (import.meta.env.VITE_FORMS_ENDPOINT ?? "").trim();
type SubmitStatus = "idle" | "loading" | "success" | "error";

const PATTERN_CELLS = Array.from({ length: 12 }, (_, index) => index);

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const galleryItems = [
  {
    id: "insights",
    src: explanationGraphic,
    alt: "Illustration showing the insight workflow inside CashGrow",
    title: "Insights tailored to your accounts",
    description:
      "CashGrow groups every transaction into a story you can act on, highlighting trends, leaks, and wins automatically."
  },
  {
    id: "story",
    src: storyGraphic,
    alt: "Overview slide describing what CashGrow is about",
    title: "Built to grow with you",
    description:
      "Connect the accounts you already use and watch the data roll into simple narratives that keep you motivated and on track."
  },
  {
    id: "roadmap",
    src: roadmapGraphic,
    alt: "Visual roadmap teasing the next milestones for the product",
    title: "Roadmap you can follow",
    description:
      "We are shipping guided playbooks, collaborative planning, and smarter alerts so your household can plan together."
  }
] as const;

export default function Landing() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    if (!FORMS_ENDPOINT) {
      try {
        const key = "cashgrow_waitlist";
        const raw = localStorage.getItem(key);
        const existing: string[] = raw ? JSON.parse(raw) : [];

        if (!existing.includes(email)) {
          existing.push(email);
          localStorage.setItem(key, JSON.stringify(existing));
        }

        setStatus("success");
        setEmail("");
        return;
      } catch (storageError) {
        console.error("Failed to store email locally", storageError);
        setStatus("error");
        return;
      }
    }

    try {
      const response = await fetch(FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "cashgrow-dashboard" })
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      setStatus("success");
      setEmail("");
    } catch (networkError) {
      console.error("Failed to submit email", networkError);
      setStatus("error");
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-shell">
        <div className="landing-pattern" aria-hidden="true">
          {PATTERN_CELLS.map((cell) => (
            <div key={cell} className="landing-pattern-cell">
              <img src={logoMark} alt="" loading="lazy" />
            </div>
          ))}
        </div>

        <header className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-badge">Beta access is limited</span>
            <h1>Design your cashflow with confidence</h1>
            <p>
              CashGrow turns raw account data into beautiful, guided stories so you can make better money moves every week. Join the
              first wave and help shape the experience.
            </p>

            <form className="landing-form" onSubmit={handleSubmit} noValidate>
              <label className="sr-only" htmlFor="email">
                Email address
              </label>
              <div className="landing-form-row">
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError("");
                    if (status !== "idle") setStatus("idle");
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "email-error" : undefined}
                  required
                />
                <button type="submit" disabled={status === "loading"}>
                  {status === "loading" ? "Submitting..." : "Join the waitlist"}
                </button>
              </div>
            </form>

            {error && (
              <p className="message error" id="email-error" role="alert">
                {error}
              </p>
            )}

            {status === "success" && (
              <div className="message success" role="status">
                Thanks! You&apos;re on the list. We&apos;ll be in touch soon.
              </div>
            )}

            {status === "error" && (
              <div className="message error" role="alert">
                Something went wrong. Please try again.
              </div>
            )}

            <p className="landing-footnote">We only send one message when the doors open. No spam, ever.</p>
          </div>
        </header>

        <section className="landing-highlights">
          <div className="landing-highlights-copy">
            <h2>What is CashGrow about?</h2>
            <p>
              We combine automated data aggregation, delightful visual storytelling, and collaborative planning so you always know
              what to focus on next. CashGrow is the coach in your corner when money starts to feel messy.
            </p>
            <ul className="landing-highlights-list">
              <li>Connect multiple accounts in minutes—no spreadsheets required.</li>
              <li>Read weekly money recaps that celebrate wins and flag risks.</li>
              <li>Build plans you can share with a partner or advisor.</li>
            </ul>
          </div>

          <div className="landing-highlights-art">
            <img src={storyGraphic} alt="CashGrow story board and brand illustration" loading="lazy" />
          </div>
        </section>

        <section className="landing-gallery" aria-label="CashGrow preview gallery">
          {galleryItems.map((item) => (
            <figure key={item.id} className="landing-gallery-card">
              <img src={item.src} alt={item.alt} loading="lazy" />
              <figcaption>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </figcaption>
            </figure>
          ))}
        </section>
      </div>
    </div>
  );
}
