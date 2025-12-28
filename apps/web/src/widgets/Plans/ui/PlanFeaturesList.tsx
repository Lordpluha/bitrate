import { GreenCheckIcon } from '@shared/ui'

type PlanListProps = {
  features: string[]
}

export const PlansList = ({ features }: PlanListProps) => {
  return (
    <ul className='text-left flex flex-col items-start gap-2 mb-6'>
      {features.map((feature, i) => (
        <li
          key={i}
          className='flex items-center gap-3'
        >
          {/* <GreenCheckIcon
            height={22}
            width={14}
            color='#1ED760'
          /> */}
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  )
}
