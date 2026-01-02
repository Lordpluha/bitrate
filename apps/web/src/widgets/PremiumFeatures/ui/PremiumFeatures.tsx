import { Typography } from '@spotify/ui';

import premiumFeatures from '../config/premium-features.json';

import { FeatureCard } from './FeatureCard';

export const PremiumFeatures = () => {
  return (
    <div className="py-16 container 3xl:!max-w-[1540px] text-center max-lg:py-12 max-md:py-8">
      <div className="container mb-16 max-lg:mb-12 max-md:mb-10">
        <Typography.Heading1 className={'leading-[1.2] mb-8'}>
          Enhance Your Music Journey with Premium
        </Typography.Heading1>
        <Typography.Paragraph>
          Upgrade to Spotify Premium and take your music journey to the next
          level. Enjoy uninterrupted music playback, even in offline mode. Say
          goodbye to those pesky ads, and indulge in high-quality audio for a
          truly immersive experience.
        </Typography.Paragraph>
      </div>

      <div className="grid grid-cols-4 gap-2 items-center max-md:grid-cols-2 max-xs:grid-cols-1">
        {premiumFeatures.map((card) => (
          <FeatureCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
};
