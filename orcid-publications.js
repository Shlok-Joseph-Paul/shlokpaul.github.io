const ORCID_ID = "0000-0001-8038-5497"; // Replace this with your ORCID iD
const REVIEW_JOURNAL_TITLES = {
  "1749-4893": "Nature Photonics",
  "0884-2914": "Journal of Materials Research"
};

const INITIAL_PUBLICATION_COUNT = 3;
const PUBLICATIONS_PER_CLICK = 5;

let allPublications = [];
let visibleCount = INITIAL_PUBLICATION_COUNT;
let allReviews = [];

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderPublications() {
  const container = document.getElementById("orcid-publications");

  const visiblePublications = allPublications.slice(0, visibleCount);

  const publicationsHtml = visiblePublications.map(pub => `
    <article class="publication-card">
      <h3>
        ${
          pub.doiUrl
            ? `<a href="${escapeHtml(pub.doiUrl)}" target="_blank" rel="noopener">${escapeHtml(pub.title)}</a>`
            : escapeHtml(pub.title)
        }
      </h3>
      <p>${escapeHtml([pub.journal, pub.year].filter(Boolean).join(" · "))}</p>
      ${pub.doi ? `<p><strong>DOI:</strong> ${escapeHtml(pub.doi)}</p>` : ""}
    </article>
  `).join("");

  const hasMore = visibleCount < allPublications.length;

  const showMoreHtml = hasMore
    ? `
      <div class="show-more-row">
        <button class="button secondary" id="show-more-publications" type="button">
          Show 5 more publications
        </button>
        <p class="pub-meta">
          Showing ${visiblePublications.length} of ${allPublications.length}
        </p>
      </div>
    `
    : allPublications.length > INITIAL_PUBLICATION_COUNT
      ? `
        <div class="show-more-row">
          <p class="pub-meta">Showing all ${allPublications.length} publications</p>
        </div>
      `
      : "";

  container.innerHTML = publicationsHtml + showMoreHtml;

  const showMoreButton = document.getElementById("show-more-publications");

  if (showMoreButton) {
    showMoreButton.addEventListener("click", () => {
      visibleCount += PUBLICATIONS_PER_CLICK;
      renderPublications();
    });
  }
}

function renderReviews() {
  const container = document.getElementById("orcid-reviews");

  if (!container) {
    return;
  }

  const reviewsHtml = allReviews.map(review => `
    <article class="publication-card">
      <h3>${escapeHtml(review.organization)}</h3>
      <p>${escapeHtml(review.summary)}</p>
      <p>${escapeHtml(review.yearsLabel)}</p>
    </article>
  `).join("");

  container.innerHTML = reviewsHtml;
}

function normalizeReviews(reviews) {
  return reviews.map(review => ({
    ...review,
    summary: `${review.reviewCount} public review${review.reviewCount === 1 ? "" : "s"}`,
    yearsLabel: review.years.length > 0
      ? `Years active: ${review.years.join(", ")}`
      : "Year not listed"
  }));
}

function getReviewJournalTitle(group) {
  const peerReviewId = group?.["external-ids"]?.["external-id"]?.find(
    id => id["external-id-type"] === "peer-review"
  )?.["external-id-value"] || "";

  const issn = peerReviewId.replace(/^issn:/i, "");

  return REVIEW_JOURNAL_TITLES[issn] || "";
}

async function loadReviewFallback() {
  const response = await fetch("orcid-reviews.json", {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Could not load review fallback data.");
  }

  const reviews = await response.json();

  allReviews = normalizeReviews(reviews).sort((a, b) => {
    const aLatestYear = a.years[0] || "";
    const bLatestYear = b.years[0] || "";

    if (Number(bLatestYear || 0) !== Number(aLatestYear || 0)) {
      return Number(bLatestYear || 0) - Number(aLatestYear || 0);
    }

    return b.reviewCount - a.reviewCount;
  });

  renderReviews();
}

async function loadOrcidPublications() {
  const container = document.getElementById("orcid-publications");

  try {
    const response = await fetch(`https://pub.orcid.org/v3.0/${ORCID_ID}/works`, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Could not load ORCID works.");
    }

    const data = await response.json();
    const groups = data.group || [];

    if (groups.length === 0) {
      container.innerHTML = "<p>No public ORCID works found.</p>";
      return;
    }

    allPublications = groups.map(group => {
      const summary = group["work-summary"]?.[0];

      const title = summary?.title?.title?.value || "Untitled work";
      const journal = summary?.["journal-title"]?.value || "";
      const year = summary?.["publication-date"]?.year?.value || "";

      const doi = summary?.["external-ids"]?.["external-id"]?.find(
        id => id["external-id-type"] === "doi"
      )?.["external-id-value"];

      const doiUrl = doi ? `https://doi.org/${doi}` : null;

      return {
        title,
        journal,
        year,
        doi,
        doiUrl
      };
    });

    allPublications.sort((a, b) => {
      return Number(b.year || 0) - Number(a.year || 0);
    });

    renderPublications();

  } catch (error) {
    container.innerHTML = `
      <p>Publications could not be loaded from ORCID right now.</p>
      <p>
        <a href="https://orcid.org/${ORCID_ID}" target="_blank" rel="noopener">
          View publications on ORCID
        </a>
      </p>
    `;
    console.error(error);
  }
}

async function loadOrcidReviews() {
  const container = document.getElementById("orcid-reviews");

  if (!container) {
    return;
  }

  try {
    const response = await fetch(`https://pub.orcid.org/v3.0/${ORCID_ID}/peer-reviews`, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Could not load ORCID peer reviews.");
    }

    const data = await response.json();
    const groups = data.group || [];

    if (groups.length === 0) {
      container.innerHTML = "<p>No public ORCID peer reviews found.</p>";
      return;
    }

    allReviews = groups.map(group => {
      const reviewSummaries = (group["peer-review-group"] || [])
        .flatMap(item => item["peer-review-summary"] || []);

      const organization =
        getReviewJournalTitle(group) ||
        reviewSummaries[0]?.["convening-organization"]?.name ||
        reviewSummaries[0]?.source?.["source-name"]?.value ||
        "Review activity";

      const reviewCount = reviewSummaries.length;
      const years = [...new Set(
        reviewSummaries
          .map(summary => summary["completion-date"]?.year?.value)
          .filter(Boolean)
      )].sort((a, b) => Number(b) - Number(a));

      return {
        organization,
        reviewCount,
        years,
        latestYear: years[0] || ""
      };
    }).sort((a, b) => {
      if (Number(b.latestYear || 0) !== Number(a.latestYear || 0)) {
        return Number(b.latestYear || 0) - Number(a.latestYear || 0);
      }

      return b.reviewCount - a.reviewCount;
    });

    allReviews = normalizeReviews(allReviews);

    renderReviews();
  } catch (error) {
    try {
      await loadReviewFallback();
    } catch (fallbackError) {
      container.innerHTML = `
        <p>Review activity could not be loaded from ORCID right now.</p>
        <p>
          <a href="https://orcid.org/${ORCID_ID}" target="_blank" rel="noopener">
            View reviews on ORCID
          </a>
        </p>
      `;
      console.error(fallbackError);
    }
    console.error(error);
  }
}

loadOrcidPublications();
loadOrcidReviews();
