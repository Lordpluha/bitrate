import { Enjoy } from "@widgets/Enjoy";
import { Footer } from "@widgets/Footer";
import { Header } from "@widgets/Header";
import { Hero } from "@widgets/Hero";
import { Info } from "@widgets/Info";
import { Plans } from "@widgets/Plans";
import { QRcode } from "@widgets/QRcode";

export const Landing = () => {
  return (
    <>
      <Hero />
      <QRcode />
      <Info />
      <Plans />
      <Enjoy />
    </>
  );
};
