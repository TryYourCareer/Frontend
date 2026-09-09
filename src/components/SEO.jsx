import { useEffect } from "react";

const SITE_NAME = "Try Your Careers";
const DEFAULT_TITLE = "Try Your Careers | AI-Powered Career Guidance & Exploration";
const DEFAULT_DESCRIPTION =
  "Discover your ideal career path with AI-driven assessments, salary insights, interactive industry roadmaps, and real-world career reality checks.";
const DEFAULT_IMAGE = "https://tryyourcareer.com/career_discovery.png";
const BASE_URL = "https://tryyourcareer.com";

/**
 * Helper to update or create a <meta> tag by name or property attribute.
 */
function setMetaTag(attributeName, attributeValue, content) {
  if (!content) return;
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

/**
 * Helper to update or create a <link rel="..."> tag.
 */
function setLinkTag(rel, href) {
  if (!href) return;
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  schema,
}) {
  useEffect(() => {
    // 1. Document Title
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    document.title = fullTitle;

    // 2. Canonical URL
    const canonicalUrl = url
      ? (url.startsWith("http") ? url : `${BASE_URL}${url}`)
      : window.location.href.split("?")[0].split("#")[0];
    setLinkTag("canonical", canonicalUrl);

    // 3. Standard Meta
    setMetaTag("name", "description", description);
    if (keywords) {
      setMetaTag("name", "keywords", keywords);
    }

    // 4. Open Graph
    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("property", "og:type", type);
    setMetaTag("property", "og:site_name", SITE_NAME);
    const resolvedImage = image.startsWith("http") ? image : `${window.location.origin}${image}`;
    setMetaTag("property", "og:image", resolvedImage);

    // 5. Twitter Card
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", fullTitle);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", resolvedImage);

    // 6. Structured Data (JSON-LD)
    let scriptTag = null;
    if (schema) {
      const scriptId = "dynamic-seo-jsonld";
      scriptTag = document.getElementById(scriptId);
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = scriptId;
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(schema);
    }

    return () => {
      // Optional cleanup on unmount
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [title, description, keywords, image, url, type, schema]);

  return null;
}
