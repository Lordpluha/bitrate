import Image from "next/image";

// next link
export const DownloadButton = () => (
    <a className="text-xl py-2 px-6 rounded-3xl hover:opacity-70 transition-[1s] text-white font-medium border-solid border-2 flex items-center gap-2" href="#">
      <span>Download The App</span>
      <Image width={36} height={36} src={'/images/download-icon.svg'} alt="download"/>
    </a>
  );

