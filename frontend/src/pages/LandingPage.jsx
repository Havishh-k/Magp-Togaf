import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, ShieldCheck, Scale, Lock, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Global Header */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary-600 shrink-0" />
          <span className="font-bold tracking-tight text-slate-900 text-lg">Maliba AI</span>
        </div>
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary font-medium text-sm uppercase"
        >
          <Globe className="w-4 h-4" />
          {i18n.language}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center">
        
        {/* Hero Section */}
        <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 tracking-tight mb-6">
            {t('landing.heroHeadline', "Maliba AI Governance Platform")}
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-3xl mx-auto mb-10 leading-relaxed">
            {t('landing.heroSubheadline', "Automated, policy-driven oversight for AI deployments in the national health network. Enforcing WHO ethics through zero-trust governance.")}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="w-full sm:w-auto font-medium shadow-sm transition-transform hover:scale-105"
              onClick={() => navigate('/public-registry')}
            >
              Public Registry
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="w-full sm:w-auto font-medium shadow-sm transition-transform hover:scale-105"
              onClick={() => navigate('/login')}
            >
              {t('landing.ctaMinistry', "Login")}
            </Button>
          </div>
        </section>

        {/* Value Proposition Grid */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-primary-600" />
                </div>
                <CardTitle className="text-xl">{t('landing.card1Title', "Context-Aware Fairness")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500 leading-relaxed">
                  {t('landing.card1Desc', "Automated bias detection explicitly calibrated for Maliba's rural populations and aging facility equipment.")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Scale className="w-6 h-6 text-primary-600" />
                </div>
                <CardTitle className="text-xl">{t('landing.card2Title', "Policy as Code")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500 leading-relaxed">
                  {t('landing.card2Desc', "Deterministic enforcement of WHO AI ethics principles without requiring in-house data science expertise.")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-primary-600" />
                </div>
                <CardTitle className="text-xl">{t('landing.card3Title', "Cryptographic Accountability")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500 leading-relaxed">
                  {t('landing.card3Desc', "A tamper-evident, append-only audit trail guaranteeing the integrity of every governance decision.")}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
        
      </main>
    </div>
  );
}
