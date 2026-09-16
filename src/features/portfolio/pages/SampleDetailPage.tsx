import React from 'react';
import { SamplePreview } from '../components/SamplePreview';
import { PageHero, HERO_TONES } from '../../../shared/ui/PageHero';

export const SampleDetailPage = () => {
  return (
    <div className="min-h-screen">
      <PageHero
        tone={HERO_TONES.primary}
        eyebrow="Portfolio Sample"
        title="Sample Architectural Drawing Preview"
        subtitle="Preview is blurred and watermarked — purchase to download the full file"
        image={{ src: '/images/samples/sample-arch.webp', alt: 'Sample' }}
      />

      <section className="section">
        <div className="container max-w-3xl">
          <SamplePreview title="3-Bedroom House — Sample" image="/images/samples/sample-arch.webp" />
        </div>
      </section>
    </div>
  );
};
