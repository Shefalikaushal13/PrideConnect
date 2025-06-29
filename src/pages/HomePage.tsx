import React from 'react';
import Hero from '../components/Home/Hero';
import FeaturesSection from '../components/Home/FeaturesSection';
import StatsSection from '../components/Home/StatsSection';

const HomePage: React.FC = () => {
  return (
    <div>
      <Hero />
      <FeaturesSection />
      <StatsSection />
    </div>
  );
};

export default HomePage;