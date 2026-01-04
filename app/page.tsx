"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Share2, Users, Layers, Check, ChevronRight, Menu } from 'lucide-react'
import { useEffect, useState } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs"
import axios from "axios"

export default function Home() {
  const { isSignedIn, getToken } = useAuth();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const checkUser = async () => {
      if (!isSignedIn) return;
      try {
        const token = await getToken();
        await axios.get(`${BACKEND_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("User sync failed:", err);
      }
    };
    checkUser();
  }, [isSignedIn, getToken, BACKEND_URL]);

  const features = [
    {
      icon: <Users className="h-6 w-6 text-blue-400" />,
      title: "Real-time collaboration",
      description: "Work together with your team on the same canvas in real-time, seeing changes as they happen."
    },
    {
      icon: <Share2 className="h-6 w-6 text-purple-400" />,
      title: "Easy Sharing",
      description: "Share your drawings with a simple link. Control who can view or edit your work."
    },
    {
      icon: <Layers className="h-6 w-6 text-emerald-400" />,
      title: "Infinite canvas",
      description: "Never run out of space with our infinite canvas that expands as you draw."
    }
  ];

  const prices = [
    { name: "Free", price: "$0", description: "Perfect for getting started", features: ["Up to 100 notes", "Basic organization", "Mobile access"], buttonText: "Get Started" },
    { name: "Pro", price: "$9.99", period: "/mo", description: "For serious thinkers", features: ["Unlimited notes", "AI-powered insights", "Priority support", "Export options"], buttonText: "Start Free Trial", popular: true },
    { name: "Enterprise", price: "Custom", description: "For organizations", features: ["Everything in Pro", "Advanced security", "Custom integrations", "SLA guarantee"], buttonText: "Contact Sales" }
  ];

  return (
    <div className="bg-black text-white min-h-screen selection:bg-white/30">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tighter cursor-pointer">Xcal</div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-all">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
          </div>
          <button className="md:hidden"><Menu /></button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Video with improved overlay */}
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-30 grayscale" src="https://media.istockphoto.com/id/473312345/video/loopable-mathematic-symbols.mp4?s=mp4-640x640-is&k=20&c=c3jWEVt_zbFFsnkSqQOq1tsUZmaB-qpmqJHmkLbyip0=" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              Draw and collaborate <span className="text-gray-500 italic">in real-time</span>
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">
              Create beautiful diagrams, sketches and wireframes with a simple interface. 
              Join 15,000+ teams bringing concepts to life instantly.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/draw">
                <button className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                  Start drawing now <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="border border-white/20 px-6 py-3 rounded-full font-bold hover:bg-white/5 transition-colors">
                  Go to dashboard
                </button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <Image 
              src="https://i.pinimg.com/736x/6e/22/33/6e22335dfb94c453afefc69cb46528f2.jpg" 
              alt="Platform Preview" 
              width={600} height={400} 
              className="relative rounded-2xl border border-white/10 shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="features" className="py-24 bg-[#121212] relative overflow-hidden">
        {/* Dot Grid Background for Features */}
        <div className="absolute inset-0 opacity-[0.1] pointer-events-none"
             style={{ 
                 backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', 
                 backgroundSize: '24px 24px' 
             }}>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-kalam font-bold mb-4 text-[#A8A5FF] -rotate-1 inline-block">Powerful features</h2>
            <p className="text-white/60 text-xl font-kalam mt-2">Everything you need to collaborate at scale.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="group p-8 border-2 border-white/20 hover:border-[#A8A5FF] transition-all duration-300 hover:-translate-y-2 bg-[#1e1e1e]
                rounded-[255px_15px_225px_15px/15px_225px_15px_255px]">
                <div className="mb-6 p-4 bg-black/40 w-16 h-16 flex items-center justify-center rounded-full border border-white/10 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-kalam font-bold mb-3">{f.title}</h3>
                <p className="text-white/60 leading-relaxed font-sans">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-24 px-6 bg-[#121212] relative">
         <div className="absolute inset-0 opacity-[0.1] pointer-events-none"
             style={{ 
                 backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', 
                 backgroundSize: '24px 24px' 
             }}>
        </div>
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-5xl font-kalam font-bold mb-4">Simple Pricing</h2>
          <p className="text-white/60 font-kalam text-lg">Choose the plan that fits your needs</p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 items-start">
          {prices.map((tier, i) => (
            <div key={i} className={`relative p-8 transition-all duration-300 group
              rounded-[255px_15px_225px_15px/15px_225px_15px_255px]
              ${tier.popular 
                ? 'bg-[#1e1e1e] border-2 border-[#A8A5FF] shadow-[0_0_20px_-5px_rgba(168,165,255,0.3)] scale-105 z-10' 
                : 'bg-black/20 border-2 border-white/10 hover:border-white/30'
              }`}>
              
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#A8A5FF] text-black font-kalam font-bold px-4 py-1 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] text-sm rotate-2 shadow-lg">
                  MOST POPULAR
                </div>
              )}
              
              <h3 className="font-kalam text-2xl font-bold mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold font-sans">{tier.price}</span>
                {tier.period && <span className="text-white/50 text-sm font-sans">{tier.period}</span>}
              </div>
              
              <p className="text-white/60 mb-8 pb-6 border-b border-white/10 text-sm">{tier.description}</p>
              
              <ul className="space-y-4 mb-8 text-left">
                {tier.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-white/80">
                    <div className="min-w-[20px] h-5 rounded-full bg-[#A8A5FF]/20 flex items-center justify-center text-[#A8A5FF]">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-3 font-kalam font-bold text-lg transition-all rounded-[255px_15px_225px_15px/15px_225px_15px_255px] border-2
                ${tier.popular 
                  ? 'bg-[#A8A5FF] text-black border-black hover:bg-[#B8B5FF] hover:-translate-y-1 hover:shadow-lg' 
                  : 'bg-transparent text-white border-white/20 hover:border-white hover:bg-white/5'
                }`}>
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 px-6 bg-[#121212] relative">
         <div className="absolute inset-0 opacity-[0.1] pointer-events-none"
             style={{ 
                 backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', 
                 backgroundSize: '24px 24px' 
             }}>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-[#1e1e1e] to-black p-12 relative overflow-hidden text-center group
            rounded-[255px_15px_225px_15px/15px_225px_15px_255px] border-2 border-white/10 hover:border-[#A8A5FF]/50 transition-colors">
            
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 p-32 bg-[#A8A5FF] opacity-5 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-32 bg-pink-500 opacity-5 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-kalam font-bold mb-6 text-white transition-transform duration-500">
                Ready to start drawing?
              </h2>
              <p className="text-xl text-white/50 mb-10 max-w-lg mx-auto font-sans">
                Join thousands of developers and designers who trust Xcal for their diagrams.
              </p>
              
              <div className="flex justify-center">
                <button className="bg-white text-black px-8 py-4 font-kalam font-bold text-xl flex items-center gap-2 hover:scale-105 hover:rotate-1 transition-all
                  rounded-[255px_15px_225px_15px/15px_225px_15px_255px] border-2 border-transparent hover:border-[#A8A5FF] shadow-xl">
                  Get Started Free <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}