import { useEffect } from "react";

const SITE_NAME = "Try Your Career";
const DEFAULT_TITLE = "Try Your Career | AI-Powered Career Guidance & Exploration Platform";
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
  noindex = false,
}) {
  useEffect(() => {
    // 1. Document Title
    let fullTitle = DEFAULT_TITLE;
    if (title) {
      fullTitle = title.includes("Try Your Career") ? title : `${title} | ${SITE_NAME}`;
    }
    document.title = fullTitle;

    // 2. Canonical URL (strictly https://tryyourcareer.com without www or queries)
    let cleanPath = "/";
    if (url) {
      const parsedPath = url.split("?")[0].split("#")[0];
      if (parsedPath.startsWith("http")) {
        cleanPath = parsedPath.replace(/^https?:\/\/(www\.)?tryyourcareer\.com/, "");
      } else {
        cleanPath = parsedPath.startsWith("/") ? parsedPath : `/${parsedPath}`;
      }
    } else if (typeof window !== "undefined") {
      cleanPath = window.location.pathname || "/";
    }
    const canonicalUrl = `${BASE_URL}${cleanPath === "/" ? "/" : cleanPath.replace(/\/+$/, "")}`;
    setLinkTag("canonical", canonicalUrl);

    // 3. Standard Meta
    setMetaTag("name", "description", description);
    if (keywords) {
      setMetaTag("name", "keywords", keywords);
    }

    // 4. Robots & Indexing Directive
    const robotsDirective = noindex
      ? "noindex, follow"
      : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";
    setMetaTag("name", "robots", robotsDirective);
    setMetaTag("name", "googlebot", robotsDirective);

    // 5. Open Graph
    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("property", "og:type", type);
    setMetaTag("property", "og:site_name", SITE_NAME);
    const resolvedImage = image.startsWith("http") ? image : `${BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
    setMetaTag("property", "og:image", resolvedImage);

    // 6. Twitter Card
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", fullTitle);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", resolvedImage);

    // 7. Structured Data (JSON-LD) Dynamic Injection & Clean up
    const scriptId = "dynamic-seo-jsonld";
    let scriptTag = document.getElementById(scriptId);

    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = scriptId;
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(schema);
    } else if (scriptTag && scriptTag.parentNode) {
      scriptTag.parentNode.removeChild(scriptTag);
    }

    return () => {
      // Clean up dynamic schema on unmount to prevent leaking to subsequent pages
      const tag = document.getElementById(scriptId);
      if (tag && tag.parentNode) {
        tag.parentNode.removeChild(tag);
      }
    };
  }, [title, description, keywords, image, url, type, schema, noindex]);

  return null;
}

