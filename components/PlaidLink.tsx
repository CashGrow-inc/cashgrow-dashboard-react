import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Get auth token from localStorage (set this after login)
const getAuthToken = () => localStorage.getItem("auth_token");

export default function PlaidLink() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Get link_token from backend
  useEffect(() => {
    const createLinkToken = async () => {
      const authToken = getAuthToken();
      if (!authToken) {
        setError("Not authenticated. Please log in first.");
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/plaid/create_link_token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to create link token: ${res.status}`);
        }

        const data = await res.json();
        console.log("✅ Link token received:", data.link_token?.substring(0, 30) + "...");
        setLinkToken(data.link_token);
      } catch (err) {
        console.error("Error creating link token:", err);
        setError("Failed to initialize Plaid Link");
      }
    };

    createLinkToken();
  }, []);

const { open, ready } = usePlaidLink({
  token: linkToken!,
  onSuccess: async (public_token, metadata) => {
    console.log("👉 Plaid SUCCESS triggered");
    console.log("public_token received:", public_token);
    console.log("metadata:", metadata);

    const authToken = getAuthToken();

    try {
      // Exchange public token for access token
      const res = await fetch(`${API_BASE_URL}/plaid/exchange_public_token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          public_token,
          institution_name: metadata.institution?.name,
        }),
      });

      const data = await res.json();
      console.log("✅ Bank accounts linked:", data);

      // Automatically sync transactions after linking
      const syncRes = await fetch(`${API_BASE_URL}/plaid/sync_transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
          end_date: new Date().toISOString().split('T')[0] // Today
        })
      });

      const syncData = await syncRes.json();
      console.log("✅ Transactions synced:", syncData);

      alert(`Bank connected! ${data.accounts?.length || 0} accounts linked. ${syncData.transactions_added || 0} transactions synced.`);
    } catch (err) {
      console.error("Error exchanging token:", err);
      alert("Failed to connect bank account");
    }
  },
});


  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!linkToken) {
    return <div>Loading Plaid Link...</div>;
  }

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
