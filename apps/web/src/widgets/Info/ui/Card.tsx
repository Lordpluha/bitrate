
import Image from "next/image"
import { Typography  } from '@spotify/ui'
import { FC, ReactNode } from "react"

type CardProps = {
  icon: string,
  title: ReactNode,
  description: ReactNode,
}

export const Card:FC<CardProps> = (props) => {

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-[124px] h-[124] mb-4 flex flex-col items-center justify-center bg-[#121212] rounded-full shadow-[0_6px_20px_1px_rgba(30,215,96,0.3)]">
      <Image className="w-auto h-auto" src={props.icon} alt="" width={60} height={60}/>
      </div>

      <Typography.Heading5>{props.title}</Typography.Heading5>
      <Typography.Paragraph>{props.description}</Typography.Paragraph>
    </div>
  )
}

