import { useEffect, useState } from "react";
import { enableAnalytics } from "../utils/analytics";

const consentKey = "quiz-generator-analytics-consent";

function CookieConsent() {
  const [choice, setChoice] = useState(() => localStorage.getItem(consentKey));

  useEffect(() => {
    if (choice === "accepted") {
      enableAnalytics();
    }
  }, [choice]);

  function saveChoice(value) {
    localStorage.setItem(consentKey, value);
    setChoice(value);
  }

  if (choice) return null;

  return (
    <section className="cookieConsent" aria-label="Cookie preference">
      <p>
        We use optional analytics cookies to understand how the quiz is used.
      </p>
      <div className="cookieActions">
        <button onClick={() => saveChoice("declined")}>No thanks</button>
        <button className="acceptCookies" onClick={() => saveChoice("accepted")}>
          Accept analytics
        </button>
      </div>
    </section>
  );
}

export default CookieConsent;
