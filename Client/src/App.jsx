import React, { useState, useEffect } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customKeyword, setCustomKeyword] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // New Custom Alias validation & suggestions state
  const [aliasError, setAliasError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const quickPicks = ["portfolio", "resume", "github", "docs", "blog", "api"];

  // Helper: Live dynamic URL validation
  const validateUrl = (value) => {
    if (!value) return false;
    let urlString = value.trim();
    if (!/^https?:\/\//i.test(urlString)) {
      urlString = "https://" + urlString;
    }
    try {
      const url = new URL(urlString);
      const hostname = url.hostname;
      return (
        hostname.includes(".") &&
        !hostname.startsWith(".") &&
        !hostname.endsWith(".") &&
        hostname.length >= 4 &&
        /[a-z]/i.test(hostname)
      );
    } catch {
      return false;
    }
  };

  const isValidInput = validateUrl(originalUrl);

  // Debounced check for custom alias availability
  useEffect(() => {
    if (!customKeyword) {
      setAliasError("");
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      checkAliasAvailability(customKeyword);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [customKeyword]);

  const checkAliasAvailability = async (alias) => {
    if (!alias) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/check-alias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alias }),
      });

      if (!response.ok) return;
      const data = await response.json();

      if (!data.available) {
        setAliasError("That alias is already taken.");
        setSuggestions(data.suggestions || []);
        setSelectedSuggestionIndex(-1);
      } else {
        setAliasError("");
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Error checking alias:", err);
    }
  };

  const handleAliasBlur = () => {
    if (customKeyword) {
      checkAliasAvailability(customKeyword);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setCustomKeyword(suggestion);
    setAliasError("");
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
  };

  // Keyboard navigation support for alias suggestions
  const handleAliasKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!isValidInput || aliasError) return;

    setLoading(true);
    setError("");
    setShortenedUrl("");
    setShowSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl,
          customKeyword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errMsg = data.error || "An error occurred while shortening the URL.";
        if (
          errMsg.toLowerCase().includes("taken") ||
          errMsg.toLowerCase().includes("already in use") ||
          errMsg.toLowerCase().includes("slug") ||
          errMsg.toLowerCase().includes("keyword") ||
          errMsg.toLowerCase().includes("unavailable")
        ) {
          errMsg = "That alias is unavailable. Try another alias.";
        }
        throw new Error(errMsg);
      }

      const slug = data.slug;
      const constructedUrl = `${window.location.origin}/${slug}`;
      setShortenedUrl(constructedUrl);
      setShowSuccess(true);
      
      // Auto-revert the success button checkmark after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortenedUrl) return;
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="linksense-layout">
      {/* GitHub Button top right */}
      <a
        href="https://github.com/Gurudevkini/LinkSense"
        target="_blank"
        rel="noopener noreferrer"
        className="github-link"
        aria-label="View on GitHub"
      >
        <svg
          className="github-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.95 3.29 9.14 7.86 10.62.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.36-1.3-1.72-1.3-1.72-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.11-.76.41-1.27.75-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.19a11.03 11.03 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.5 3.17-1.19 3.17-1.19.64 1.59.24 2.77.12 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.68.42.36.79 1.08.79 2.18 0 1.58-.01 2.86-.01 3.25 0 .31.21.68.8.56 4.57-1.48 7.86-5.67 7.86-10.62C23.25 5.48 18.27.5 12 .5z" />
        </svg>
        <span className="github-text">view on github</span>
      </a>

      {/* Subtle radial background vignette */}
      <div className="spotlight" />

      <div className="container">
        <header className="header">
          <h1 className="title">LinkSense</h1>
          <p className="subtitle">Enterprise-grade URL shortening.</p>
        </header>

        <main className="main-content">
          <form onSubmit={handleShorten} noValidate className="shortener-form">
            {/* Input Group: Original URL */}
            <div className="input-group">
              <label htmlFor="original-url" className="input-label">
                Original URL
              </label>
              <input
                id="original-url"
                type="url"
                required
                placeholder="https://youtube.com/watch?v=..."
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className={`text-input ${originalUrl && !isValidInput ? "input-error-state" : ""}`}
              />
              {originalUrl && !isValidInput && (
                <span className="inline-input-error">Invalid domain</span>
              )}
            </div>

            {/* Input Group: Custom Alias */}
            <div className="input-group">
              <label htmlFor="custom-alias" className="input-label">
                Custom Alias <span className="label-optional">(Optional)</span>
              </label>
              <input
                id="custom-alias"
                type="text"
                placeholder="your-link"
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                onBlur={handleAliasBlur}
                onKeyDown={handleAliasKeyDown}
                className={`text-input ${aliasError ? "input-error-state" : ""}`}
              />
              
              {/* Compact Inline Validation Area */}
              {aliasError && (
                <div className="inline-validation-area">
                  <div className="validation-error-title">
                    <span>⚠</span> {aliasError}
                  </div>
                  {suggestions.length > 0 && (
                    <div className="validation-suggestions">
                      <div className="suggestions-subtitle">Try one of these instead</div>
                      <div className="suggestions-grid">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={suggestion}
                            type="button"
                            className={`suggestion-chip ${
                              selectedSuggestionIndex === index ? "active" : ""
                            }`}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleSelectSuggestion(suggestion);
                              }
                            }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Picks */}
            <div className="quick-picks-container">
              {quickPicks.map((pick) => (
                <button
                  key={pick}
                  type="button"
                  onClick={() => setCustomKeyword(pick)}
                  className={`quick-pick-pill ${
                    customKeyword === pick ? "active" : ""
                  }`}
                >
                  {pick}
                </button>
              ))}
            </div>

            {/* Live Preview */}
            <div className="live-preview-box">
              <span className="live-preview-label">Your Short Link</span>
              <span className="live-preview-url">
                linksense.vercel.app/{customKeyword || "your-link"}
              </span>
            </div>

            {/* Submit Button */}
            <div className="button-wrapper">
              <button
                type="submit"
                disabled={!isValidInput || loading || !!aliasError}
                className={`submit-btn ${showSuccess ? "success" : ""}`}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner" />
                    Generating...
                  </>
                ) : showSuccess ? (
                  "✓ Link Generated"
                ) : (
                  "Generate Link"
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Shortened URL Result Card */}
          {shortenedUrl && (
            <div className="result-card">
              <div className="result-header">Shortened Link Ready</div>
              <div className="result-body">
                <span className="result-url">{shortenedUrl}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="copy-btn"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          <p>© {new Date().getFullYear()} LinkSense</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
