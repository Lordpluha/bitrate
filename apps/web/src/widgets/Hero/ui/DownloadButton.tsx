import Image from "next/image";
import DownloadIcon from "../assets/download-icon.svg"

export const DownloadButton = () => (
    <a className="text-xl py-2 px-6 rounded-3xl hover:opacity-70 transition-[1s] text-white font-medium border-solid border-2 flex items-center gap-2" href="#">
      <span>Download The App</span>
      <Image width={36} height={36} src={DownloadIcon} alt="download"/>
    </a>
  );
