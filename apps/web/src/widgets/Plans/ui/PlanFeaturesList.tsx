import Image from "next/image";

type PlanListProps = {
  features: string[];
};

export const PlansList = ({ features }: PlanListProps) => {
  return (
    <ul className="text-left flex flex-col items-start gap-2 mb-6">
      {features.map((feature, i) => (
        <li key={i} className="flex items-center gap-3">
          <Image
            src="/icons/green-check.svg"
            alt="Check"
            height={22}
            width={14}
          />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
};
