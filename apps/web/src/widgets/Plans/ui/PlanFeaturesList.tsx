import { GreenCheck } from '@spotify/ui-react'

type PlanListProps = {
  features: string[]
}

export const PlansList = ({ features }: PlanListProps) => {
  return (
    <ul className="text-left flex flex-col items-start gap-2 mb-6">
      {features.map((feature, _i) => (
        <li className="flex items-center gap-3" key={feature}>
          <GreenCheck
            height={22}
            width={14}
          />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  )
}
