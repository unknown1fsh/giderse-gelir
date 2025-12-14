'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
// import { useUser } from '@/lib/user-context' // TODO: Kullanılacak
import { EnterprisePremiumContactModal } from '@/components/enterprise-premium-contact-modal'
import {
  Building2,
  Users,
  Shield,
  Zap,
  BarChart3,
  Globe,
  Headphones,
  Award,
  Rocket,
  MessageSquare,
  Crown,
  Phone,
  Brain,
} from 'lucide-react'

export default function EnterprisePage() {
  const router = useRouter()
  // const { user } = useUser() // TODO: Kullanılacak
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  // const _isAlreadyEnterprise = user?.plan === 'enterprise' // TODO: Kullanılacak
  // const _isAlreadyEnterprisePremium = user?.plan === 'enterprise_premium' // TODO: Kullanılacak

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-orange-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-amber-500/30 mb-8">
              <Award className="h-5 w-5 text-amber-400" />
              <span className="text-amber-400 font-semibold">Enterprise Solutions</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-8">
              <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                ULTRA
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                POWER
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-12 leading-relaxed">
              Dünyanın en güçlü finansal yönetim platformu.
              <span className="text-amber-400 font-bold"> AI, Blockchain, IoT</span> ve
              <span className="text-emerald-400 font-bold"> Siber Güvenlik</span> teknolojileri ile
              donatılmış.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-12 py-6 text-xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={() => router.push('/enterprise-premium')}
              >
                <Rocket className="h-6 w-6 mr-3" />
                ULTRA PREMIUM&apos;U KEŞFET
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 text-xl font-bold backdrop-blur-sm"
                onClick={() => setIsContactModalOpen(true)}
              >
                <MessageSquare className="h-6 w-6 mr-3" />
                DEMO TALEP ET
              </Button>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Enterprise Security</h3>
                <p className="text-blue-200">Bank-level encryption & compliance</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI-Powered</h3>
                <p className="text-blue-200">Machine learning & predictive analytics</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mx-auto mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Real-time</h3>
                <p className="text-blue-200">Instant processing & updates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Features Grid */}
        <div className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  ENTERPRISE
                </span>
                <br />
                <span className="text-white">FEATURES</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Cards */}
              {[
                {
                  icon: Building2,
                  title: 'Multi-Company Management',
                  description: 'Manage unlimited companies, subsidiaries, and business units',
                  color: 'from-blue-500 to-indigo-600',
                },
                {
                  icon: Users,
                  title: 'Unlimited Users',
                  description: 'Add unlimited team members with role-based access',
                  color: 'from-emerald-500 to-teal-600',
                },
                {
                  icon: Shield,
                  title: 'Enterprise Security',
                  description: 'SOC 2, ISO 27001, GDPR compliant security',
                  color: 'from-red-500 to-rose-600',
                },
                {
                  icon: BarChart3,
                  title: 'Advanced Analytics',
                  description: 'Real-time dashboards and predictive insights',
                  color: 'from-purple-500 to-pink-600',
                },
                {
                  icon: Globe,
                  title: 'Global Operations',
                  description: 'Multi-currency, multi-language, multi-timezone',
                  color: 'from-amber-500 to-orange-600',
                },
                {
                  icon: Headphones,
                  title: '24/7 VIP Support',
                  description: 'Dedicated account manager and priority support',
                  color: 'from-cyan-500 to-blue-600',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                >
                  <div
                    className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-blue-200 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-3xl p-12 border border-amber-500/30">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                READY FOR
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  {' '}
                  ULTRA POWER?
                </span>
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join the world&apos;s most powerful companies using our Enterprise solutions
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-12 py-6 text-xl font-bold shadow-2xl"
                  onClick={() => router.push('/enterprise-premium')}
                >
                  <Crown className="h-6 w-6 mr-3" />
                  ULTRA PREMIUM
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 text-xl font-bold backdrop-blur-sm"
                  onClick={() => setIsContactModalOpen(true)}
                >
                  <Phone className="h-6 w-6 mr-3" />
                  CONTACT SALES
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Premium İletişim Modal */}
      <EnterprisePremiumContactModal
        open={isContactModalOpen}
        onOpenChange={setIsContactModalOpen}
        planId="enterprise"
      />
    </div>
  )
}
