import Link from "next/link";
import { ArrowRight, Camera, Map, MonitorSmartphone, Package, CheckCircle2, TrendingUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { FeaturedGuides } from "@/components/home/FeaturedGuides";
import { GlobalFeed } from "@/components/home/GlobalFeed";
import { HeroCarousel } from "@/components/home/HeroCarousel";

export default async function Home() {
  const t = await getTranslations('Landing');

  const CATEGORIES = [
    {
      title: t('catTourGuides'),
      description: t('catTourDesc'),
      icon: Map,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
    },
    {
      title: t('catPhotography'),
      description: t('catPhotoDesc'),
      icon: Camera,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
    },
    {
      title: t('catTech'),
      description: t('catTechDesc'),
      icon: MonitorSmartphone,
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
    },
    {
      title: t('catEveryday'),
      description: t('catEverydayDesc'),
      icon: Package,
      color: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col pb-24">
      {/* ─── Hero Section ─── */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Background carousel */}
        <HeroCarousel />

        {/* Content */}
        <div className="relative z-10 px-4 py-24 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight">
            {t('heroTitle1')}
            <span className="text-teal-300 relative inline-block">
              {t('heroTitle2')}
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-teal-500" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="transparent"/></svg>
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            {t('heroSubtitle')}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
            <Link href="/guides" className="w-full">
              <Button size="lg" className="w-full h-14 text-lg rounded-full bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/30 transition-all">
                <Search className="mr-2 h-5 w-5" />
                {t('exploreTalent')}
              </Button>
            </Link>
            <Link href="/how-it-works" className="w-full">
              <Button size="lg" variant="outline" className="w-full h-14 text-lg rounded-full border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm">
                {t('howItWorks')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Service Categories ─── */}
      <section className="px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{t('categoriesTitle')}</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">{t('categoriesSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((category) => (
              <div 
                key={category.title} 
                className="group relative bg-white dark:bg-slate-950 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${category.color}`}>
                  <category.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{category.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{category.description}</p>
                
                <div className="mt-6 flex items-center text-sm font-semibold text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-300">
                  {t('exploreTalent')} <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it Works Timeline ─── */}
      <section className="px-4 py-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">{t('timelineTitle')}</h2>
            <p className="text-slate-500 text-lg mb-10 leading-relaxed">
              {t('timelineSubtitle')}
            </p>

            <div className="space-y-8">
              {[
                { step: "01", title: t('step1'), desc: t('step1Desc') },
                { step: "02", title: t('step2'), desc: t('step2Desc') },
                { step: "03", title: t('step3'), desc: t('step3Desc') }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold border border-teal-100 dark:border-teal-800 shrink-0">
                      {item.step}
                    </div>
                    {idx !== 2 && <div className="w-[2px] h-full bg-slate-100 dark:bg-slate-800 my-2" />}
                  </div>
                  <div className="pb-8">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
                    <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative bg-slate-900 border border-slate-800">
              <img src="/beach.jpg" alt="Student at work" className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    <span className="text-white font-medium text-lg">{t('jobBadge1')}</span>
                  </div>
                  <p className="text-slate-300 text-sm">"Incredible photography skills. Highly recommend hiring verified students!"</p>
                </div>
              </div>
            </div>
            
            {/* Floating widget */}
            <div className="absolute -left-12 top-1/4 bg-white dark:bg-slate-950 p-5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 hidden md:block animate-bounce" style={{animationDuration: '3s'}}>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{t('jobBadge2')}</p>
                  <p className="text-xs text-slate-500">Fast & Secure</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Talent ─── */}
      <section className="px-4 py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{t('featuredTitle')}</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">{t('featuredDesc')}</p>
          </div>
          <FeaturedGuides />
        </div>
      </section>

      {/* ─── Global Feed ─── */}
      <section className="px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
         <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{t('recentActivityTitle')}</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">{t('recentActivityDesc')}</p>
          </div>
          <GlobalFeed />
        </div>
      </section>

    </div>
  );
}
