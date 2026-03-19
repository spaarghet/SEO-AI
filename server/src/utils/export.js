exports.exportToTxt = (gen) => {
    const out = [];
    out.push("SEO AI GENERATION REPORT");
    out.push("=========================");
    out.push(`Provider:   ${gen.provider}`);
    out.push(`Model:      ${gen.providerModel || "unknown"}`);
    out.push(`Date:       ${new Date(gen.createdAt).toLocaleString()}`);
    out.push("");

    out.push("--- INPUT ---");
    out.push(`Keyword:    ${gen.input?.keyword || "N/A"}`);
    out.push(`Topic/URL:  ${gen.input?.topic || "N/A"}`);
    out.push("");

    out.push("--- OUTPUT ---");
    out.push(`Meta Title:       ${gen.output?.metaTitle || "N/A"}`);
    out.push(`Meta Description: ${gen.output?.metaDescription || "N/A"}`);
    out.push("");

    out.push("OUTLINE:");
    if (Array.isArray(gen.output?.outline)) {
        gen.output.outline.forEach((item, index) => {
            out.push(`${index + 1}. ${item}`);
        });
    } else {
        out.push(gen.output?.outline || "No outline generated.");
    }
    out.push("");

    out.push("SUGGESTED INTERNAL LINKS:");
    if (Array.isArray(gen.output?.internalLinks) && gen.output.internalLinks.length > 0) {
        gen.output.internalLinks.forEach((link) => {
            out.push(`- ${link}`);
        });
    } else {
        out.push("No internal links suggested.");
    }

    return out.join("\n");
};