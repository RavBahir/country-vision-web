import { Card, SectionTitle } from '@/components/portal/UI'
import React from 'react'
import { SphereChart } from './common'
import { CHECKUPS } from '@/lib/portal-data'

const CheckoutTrend = () => {
  return (
       <Card className="p-6">
            <SectionTitle title="Prescription trend" />
            <p className="mt-1 mb-5 text-sm text-[#1F1A15]/55">Sphere power (SPH) at each exam. Values closer to zero mean milder short-sightedness.</p>
            <SphereChart data={CHECKUPS} />
          </Card>
  )
}

export default CheckoutTrend