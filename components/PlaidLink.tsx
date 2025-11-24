import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

export default function PlaidLink() {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  // Get API URL from environment variable - falls back to localhost for development
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // 1. Get link_token from backend
  useEffect(() => {
    const createLinkToken = async () => {
      const res = await fetch(`${API_BASE_URL}/api/plaid/create-link-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "12345" }),
      });

      const data = await res.json();
      console.log("link_token response:", data);
      setLinkToken(data.link_token);
    };

    createLinkToken();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken!,
    onSuccess: async (public_token, metadata) => {
      console.log("👉 Plaid SUCCESS triggered");
      console.log("public_token received:", public_token);
      console.log("metadata:", metadata);

      const res = await fetch(`${API_BASE_URL}/api/plaid/exchange-public-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_token,
          userId: "12345",
          institutionName: metadata.institution?.name,
        }),
      });

      const data = await res.json();
      console.log("👉 Backend response:", data);
    },
  });


  if (!linkToken) return <div>Loading…</div>;

  return (
    <button
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300"
      onClick={() => open()}
      disabled={!ready}
    >
      Connect your bank
    </button>
  );
}
