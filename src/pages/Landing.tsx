import { FormEvent, useState } from "react";
import "../styles/landing-page.css";

import heroWordmark from "../assets/logo.png";
import heroPrimary from "../assets/landing/Home2.png";
import heroSecondary from "../assets/landing/Home3.png";
import heroTertiary from "../assets/landing/Home4.png";

const FORMS_ENDPOINT = (import.meta.env.VITE_FORMS_ENDPOINT ?? "").trim();
type SubmitStatus = "idle" | "loading" | "success" | "error";
type LandingProps = {
  onNavigateToDashboard?: () => void;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const galleryItems = [
  {
    id: "insights",
    src: heroSecondary,
    alt: "Illustration showing the insight workflow inside CashGrow",
    title: "Insights tailored to your accounts",
    description:
      "CashGrow groups every transaction into a story you can act on, highlighting trends, leaks, and wins automatically."
  },
  {
    id: "story",
    src: heroPrimary,
    alt: "Overview slide describing what CashGrow is about",
    title: "Built to grow with you",
    description:
      "Connect the accounts you already use and watch the data roll into simple narratives that keep you motivated and on track."
  },
  {
    id: "roadmap",
    src: heroTertiary,
    alt: "Visual roadmap teasing the next milestones for the product",
    title: "Roadmap you can follow",
    description:
      "We are shipping guided playbooks, collaborative planning, and smarter alerts so your household can plan together."
  }
] as const;

export default function Landing({ onNavigateToDashboard }: LandingProps = {}) {
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

  const handlePreviewDashboard = () => {
    onNavigateToDashboard?.();
  };

  return (
    <div className="landing-page">
      <header className="landing-hero" role="banner">
        <div className="landing-hero__copy">
          <span className="landing-hero__badge">Beta access is limited</span>
          <h1 className="landing-hero__headline">Design your cashflow with confidence</h1>
          <p className="landing-hero__subhead">
            CashGrow turns raw account data into guided stories so you can celebrate wins, surface leaks, and stay aligned on every
            money move together.
          </p>

          <div className="landing-hero__cta">
            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="email" className="landing-hero__label">
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
                  className="landing-hero__input"
                />
                <button type="submit" className="landing-hero__cta-button" disabled={status === "loading"}>
                  {status === "loading" ? "Submitting..." : "Join the waitlist"}
                </button>
              </div>
            </form>

            {error && (
              <p id="email-error" role="alert" className="landing-message landing-message--error">
                {error}
              </p>
            )}

            {status === "success" && (
              <p role="status" className="landing-message landing-message--success">
                Thanks! You&apos;re on the list. We&apos;ll be in touch soon.
              </p>
            )}

            {status === "error" && !error && (
              <p role="alert" className="landing-message landing-message--error">
                Something went wrong. Please try again.
              </p>
            )}

            <span className="landing-hero__cta-note">We only send one message when the doors open. No spam, ever.</span>

            {onNavigateToDashboard && (
              <button
                type="button"
                onClick={handlePreviewDashboard}
                className="landing-hero__cta-button landing-hero__cta-button--ghost"
              >
                Preview the dashboard demo
              </button>
            )}
          </div>
        </div>

        <div className="landing-hero__media" aria-hidden="true">
          <div className="landing-hero__media-wordmark">
            <img src={heroWordmark} alt="" loading="lazy" />
          </div>
          <div className="landing-hero__device landing-hero__device--primary">
            <img src={heroPrimary} alt="" loading="lazy" />
          </div>
          <div className="landing-hero__device landing-hero__device--secondary">
            <img src={heroSecondary} alt="" loading="lazy" />
          </div>
          <div className="landing-hero__device landing-hero__device--tertiary">
            <img src={heroTertiary} alt="" loading="lazy" />
          </div>
        </div>
      </header>

      <main className="landing-body" id="landing-body">
        <section className="landing-section">
          <h2 className="landing-section__title">What is CashGrow about?</h2>
          <p className="landing-section__description">
            We combine automated aggregation, delightful visual storytelling, and collaborative planning so your household always
            knows what to focus on next.
          </p>
          <ul className="landing-section__list">
            <li>Connect multiple accounts in minutes—no spreadsheets required.</li>
            <li>Read weekly recaps that celebrate wins and flag risks early.</li>
            <li>Build guided playbooks you can share with a partner or advisor.</li>
          </ul>
        </section>

        <section className="landing-section" aria-label="CashGrow preview gallery">
          <h2 className="landing-section__title">Sneak peek</h2>
          <p className="landing-section__description">
            Explore a few frames from the CashGrow experience while we polish the beta.
          </p>

          <div className="landing-gallery">
            {galleryItems.map((item) => (
              <figure key={item.id} className="landing-gallery__card">
                <img src={item.src} alt={item.alt} loading="lazy" />
                <figcaption>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
