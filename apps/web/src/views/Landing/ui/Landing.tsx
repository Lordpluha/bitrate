import "@app/global.css";
import {
  Button,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
} from "@spotify/ui";
import { Enjoy } from "@widgets/Enjoy";
import Footer from "@widgets/Footer/Footer";
import { Header } from "@widgets/Header";
import { Hero } from "@widgets/Hero";
import { Info } from "@widgets/Info";
import { Plans } from "@widgets/Plans/Plans";
import { QRcode } from "@widgets/QRcode";

export const Landing = () => {
  return (
    <div className="wrap">
      {/* <Header /> */}
      <main>
        <Hero />
        <QRcode />
        <Info />
        <Plans />
        <Enjoy />
      </main>

      <Footer />
    </div>
  );
};
