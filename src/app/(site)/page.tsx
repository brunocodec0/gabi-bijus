import { HeroBento } from "@/components/home/HeroBento";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CampaignSection } from "@/components/home/CampaignSection";
import { AboutSection } from "@/components/home/AboutSection";
import { InstagramGrid } from "@/components/home/InstagramGrid";
import { Marquee } from "@/components/site/Marquee";
import { WaveDivider } from "@/components/site/WaveDivider";
import { getActiveCampaign, getProducts, getSiteContent } from "@/lib/data";

export default async function Home() {
  const [products, content, campaign] = await Promise.all([
    getProducts(),
    getSiteContent(),
    getActiveCampaign(),
  ]);

  return (
    <>
      <HeroBento products={products} content={content} />
      <Marquee words={content.marqueeWords} />
      <FeaturedProducts products={products} />
      {campaign && <CampaignSection campaign={campaign} />}
      <div className="bg-bg">
        <WaveDivider id="home-wave" className="text-earth/25 pt-6" />
      </div>
      <AboutSection content={content} />
      <Marquee words={content.marqueeWords} />
      <InstagramGrid content={content} />
    </>
  );
}
