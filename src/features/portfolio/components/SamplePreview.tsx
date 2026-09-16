import React from 'react';
import { Button } from '../../../shared/ui/Button';

export const SamplePreview = ({ title, image }: { title: string; image: string }) => {
  return (
    <div className="rounded-md overflow-hidden shadow-sm bg-white">
      <div className="relative">
        <img src={image} alt={title} className="w-full h-60 object-cover filter blur-sm grayscale" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/80 text-center p-4 rounded">
            <div className="text-sm font-semibold">Preview (watermarked)</div>
            <div className="text-xs text-text-secondary">High-resolution files are available after purchase</div>
            <div className="mt-3">
              <Button>Purchase &amp; Download</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-text-secondary mt-2">Sample preview is blurred & watermarked to protect IP.</p>
      </div>
    </div>
  );
};
