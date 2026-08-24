import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section, SectionHeading } from "@/components/layout/section";
import { FadeIn } from "@/components/motion/fade-in";
import { getStorefrontFaqs } from "@/lib/storefront-data";
import type { FaqItem } from "@/types/product";

function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export async function FaqAccordion() {
  const items = await getStorefrontFaqs();

  return (
    <Section id="faq" className="bg-white" containerClassName="max-w-3xl">
      <FaqJsonLd items={items} />
      <SectionHeading eyebrow="Good to know" title="Frequently asked questions" />
      <FadeIn>
        <Accordion className="mt-8">
          {items.map((item, index) => (
            <AccordionItem key={item.question} value={`item-${index}`}>
              <AccordionTrigger className="font-heading text-base">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </FadeIn>
    </Section>
  );
}
