import React, { Fragment } from "react";

// Import your block components here (make sure these exist in your frontend project)
import ServicesPreview from "./ServicesPreview";
import Testimonials from "./Testimonials";
import AboutPreview from "./AboutPreview";
import Accreditations from "./Accreditations";
import TosSection from "./TosSection";
import MediaBlock from "./MediaBlock";
import AlternatingSection from "./AlternatingSection";
import CallToActionBlock from "./CallToActionBlock";
import ContentBlock from "./ContentBlock";
import ArchiveBlock from "./ArchiveBlock";
import FormBlock from "./FormBlock";
import Slider from "./Slider";
// Add other blocks as needed

const blockComponents = {
  callToAction: CallToActionBlock,
  content: ContentBlock,
  archive: ArchiveBlock,
  formBlock: FormBlock,
  slider: Slider,
  servicesPreview: ServicesPreview,
  testimonials: Testimonials,
  aboutPreview: AboutPreview,
  accreditations: Accreditations,
  tosSection: TosSection,
  mediaBlock: MediaBlock,
  alternatingSection: AlternatingSection,
  // Add other blocks here
};

export default function RenderBlocks({ blocks }) {
  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0;

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, idx) => {
          // Use blockType directly from new CMS, no normalization needed
          const Block = blockComponents[block.blockType];
          if (Block) {
            // Map props for accreditations block
            if (block.blockType === "accreditations") {
              const items = Array.isArray(block.items)
                ? block.items.map((item) => ({
                    name: item.name,
                    logoUrl: item.logoUrl || "",
                  }))
                : [];
              return <Block key={String(block.id ?? idx)} items={items} />;
            }
            // Map props for tosSection block
            if (block.blockType === "tosSection") {
              return <Block key={String(block.id ?? idx)} content={block.content || ""} />;
            }
            // Map props for servicesPreview block
            if (block.blockType === "servicesPreview") {
              return <Block key={String(block.id ?? idx)} servicesData={block} />;
            }
            // Map props for aboutPreview block
            if (block.blockType === "aboutPreview") {
              return <Block key={String(block.id ?? idx)} aboutData={block} />;
            }
            // Default: spread all block props
            return <Block key={String(block.id ?? idx)} {...block} />;
          }
          return null;
        })}
      </Fragment>
    );
  }

  return null;
}
