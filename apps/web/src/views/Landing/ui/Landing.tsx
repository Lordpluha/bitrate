import { PremiumFeatures } from '@widgets/PremiumFeatures'
import { Plans } from '@widgets/Plans'
import { ForStudents } from './ForStudents/ForStudents'
import { QRcode } from './QRcode/QRcode'
import { Welcome } from './Welcome/Welcome'

export const Landing = () => {
  return (
    <>
      <Welcome />
      <QRcode />
      <PremiumFeatures />
      <Plans />
      <ForStudents />
    </>
  )
}
