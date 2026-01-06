import { Plans } from '@widgets/Plans'
import { PremiumFeatures } from '@widgets/PremiumFeatures'

import { ForStudents } from './ForStudents/ForStudents'
import { QRcode } from './QRcode/QRcode'
import { Welcome } from './Welcome/Welcome'

export const LandingView = () => {
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
