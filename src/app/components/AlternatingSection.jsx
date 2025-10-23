import React from "react";

export default function AlternatingSection({ alignment = "left", image, text, buttonLabel, buttonLink, id }) {
  const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || '';
  const isLeft = alignment === "left";

  // Build absolute image URL
  let imageUrl = '';
  let imageAlt = '';
  if (typeof image === 'object' && image !== null) {
    const raw = image.url || '';
    imageUrl = raw && (raw.startsWith('http://') || raw.startsWith('https://')) ? raw : `${CMS_URL}${raw}`;
    imageAlt = image.alt || '';
  } else if (typeof image === 'string') {
    imageUrl = image.startsWith('http') ? image : `${CMS_URL}${image}`;
  }

  // Convert rich text JSON to simple HTML paragraphs if needed (legacy Payload logic removed)
  const renderTextHTML = () => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    // If you use a new CMS format, update this logic accordingly
    return '';
  };

  const html = renderTextHTML();

  return (
    <section id={id} className="alternating-section my-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center md:gap-12">
        {isLeft && imageUrl && (
          <div className="alternating-image md:w-1/2 w-full flex justify-center mb-6 md:mb-0">
            <img
              src={imageUrl}
              alt={imageAlt}
              width={600}
              height={400}
              className="rounded-lg shadow-md max-w-full"
            />
          </div>
        )}

        <div className="alternating-text md:w-1/2 w-full">
          {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null}
          {buttonLabel && buttonLink && (
            <a
              href={buttonLink}
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {buttonLabel}
            </a>
          )}
        </div>

        {!isLeft && imageUrl && (
          <div className="alternating-image md:w-1/2 w-full flex justify-center mb-6 md:mb-0">
            <img
              src={imageUrl}
              alt={imageAlt}
              width={600}
              height={400}
              className="rounded-lg shadow-md max-w-full"
            />
          </div>
        )}
      </div>
    </section>
  );
}
