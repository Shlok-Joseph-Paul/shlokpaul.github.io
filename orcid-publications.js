const ORCID_ID = "0000-0001-8038-5497"; // Replace this with your ORCID iD

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

    const publications = groups.map(group => {
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

    publications.sort((a, b) => {
      return Number(b.year || 0) - Number(a.year || 0);
    });

    container.innerHTML = publications.map(pub => `
      <article class="publication-card">
        <h3>${pub.doiUrl ? `<a href="${pub.doiUrl}" target="_blank" rel="noopener">${pub.title}</a>` : pub.title}</h3>
        <p>${[pub.journal, pub.year].filter(Boolean).join(" · ")}</p>
        ${pub.doi ? `<p><strong>DOI:</strong> ${pub.doi}</p>` : ""}
      </article>
    `).join("");

  } catch (error) {
    container.innerHTML = `
      <p>Publications could not be loaded from ORCID right now.</p>
      <p><a href="https://orcid.org/${ORCID_ID}" target="_blank" rel="noopener">View publications on ORCID</a></p>
    `;
    console.error(error);
  }
}

loadOrcidPublications();