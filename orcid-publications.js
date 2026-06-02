const ORCID_ID = "0000-0001-8038-5497"; // Replace this with your ORCID iD

const INITIAL_PUBLICATION_COUNT = 3;
const PUBLICATIONS_PER_CLICK = 5;

let allPublications = [];
let visibleCount = INITIAL_PUBLICATION_COUNT;

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

loadOrcidPublications();