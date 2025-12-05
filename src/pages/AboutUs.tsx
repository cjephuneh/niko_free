import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Sparkles, Target, Heart, Zap, Calendar, Shield, Users, TrendingUp, Clock, CheckCircle, Star, Ticket } from 'lucide-react';

interface AboutUsProps {
  onNavigate: (page: string) => void;
}

export default function AboutUs({ onNavigate }: AboutUsProps) {
  return (
    <>
      <SEO
        title="About Us - Niko Free | Wellness Is the New Luxury"
        description="At Niko Free, we're building a new culture of going out — one where people choose experiences that uplift, energize, and expand their lives. Discover wellness events that fit your life."
        keywords="about niko free, wellness events, lifestyle platform, event discovery kenya, wellness culture, social wellness, meaningful experiences"
        url="https://niko-free.com/about"
      />
      
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
        <Navbar onNavigate={onNavigate} currentPage="about" />
      </div>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-200 relative overflow-hidden">
      {/* Light mode dot pattern overlay */}
      <div className="block dark:hidden fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>
      
      {/* Dark mode dot pattern overlay */}
      <div className="hidden dark:block fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(156, 163, 175, 0.15) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>
      
      <div className="relative z-10">

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-[#27aae2] via-[#1e8bb8] to-[#27aae2] text-white overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24" data-aos="fade-down">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/20">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide">ABOUT NIKO FREE</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Wellness Is the<br />New Luxury
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-8">
                We're building a new culture of going out — one where people choose experiences that <span className="font-semibold text-white">uplift, energize, and expand their lives.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => onNavigate('landing')}
                  className="px-8 py-4 bg-white text-[#27aae2] rounded-xl font-bold hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg"
                >
                  Explore Events
                </button>
                <button
                  onClick={() => onNavigate('become-partner')}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold hover:bg-white/20 transform hover:scale-105 transition-all"
                >
                  Become a Partner
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Intro Section with Image */}
          <div className="py-5 md:py-9">
            <div className="grid lg:grid-cols-2 gap-12 items-center" data-aos="fade-up">
              <div className="order-2 lg:order-1">
                <div className="relative">
                  <div className="aspect-w-4 aspect-h-3 rounded-3xl overflow-hidden shadow-2xl">
                    <img
                      src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="Wellness lifestyle"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-xs">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#27aae2] to-[#1e8bb8] rounded-xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">15+</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 px-4 py-2 rounded-full">
                  <Star className="w-4 h-4 text-[#27aae2]" />
                  <span className="text-sm font-semibold text-[#27aae2]">OUR STORY</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  Redefining How You Go Out
                </h2>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Our platform brings together curated events, activities, and experiences designed to help you reconnect with yourself, your community, and the world around you.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  We believe that the most meaningful luxury today is <span className="font-semibold text-[#27aae2]">wellness</span> — the kind that fits naturally into everyday living. We also use <span className="font-semibold text-[#27aae2]">AI</span> to generate engaging and accurate event descriptions, helping you understand what each experience offers before you attend.
                </p>
              </div>
            </div>
          </div>

          {/* Mission Section */}
          <div className="py-5 md:py-10" data-aos="zoom-in">
            <div className="bg-gradient-to-br from-[#27aae2]/10 via-transparent to-[#1e8bb8]/10 dark:from-[#27aae2]/20 dark:to-[#1e8bb8]/20 rounded-3xl p-8 md:p-12 lg:p-16 border border-[#27aae2]/20">
              <div className="text-center max-w-4xl mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-[#27aae2] to-[#1e8bb8] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  ✨ Our Mission
                </h2>
                <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  To make wellness <span className="font-bold text-[#27aae2]">social, exciting, and accessible</span> by helping people discover experiences that add real value to their lives — mentally, emotionally, and socially.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed italic">
                  We exist to inspire a new generation of intentional living, where going out means feeling better, not drained.
                </p>
              </div>
            </div>
          </div>

          {/* Why We Exist Section */}
          <div className="py-5 md:py-10" data-aos="fade-up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 px-4 py-2 rounded-full mb-4">
                <Zap className="w-4 h-4 text-[#27aae2]" />
                <span className="text-sm font-semibold text-[#27aae2]">OUR PURPOSE</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                🌟 Why Niko Free Exists
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                We're on a mission to transform how people spend their time and energy
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Card 1 */}
              <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-[#27aae2]/50 hover:-translate-y-2" data-aos="fade-up" data-aos-delay="0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  1. Choosing Better Over Empty Routines
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We inspire a shift away from endless, no-value drinking sessions or repetitive hangouts that don't contribute to your growth.
                </p>
              </div>

              {/* Card 2 */}
              <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-[#27aae2]/50 hover:-translate-y-2" data-aos="fade-up" data-aos-delay="100">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  2. 📱 Breaking the Doom-Scroll Cycle
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Instead of losing hours scrolling on your phone, discover meaningful, energizing activities that reconnect you with real life.
                </p>
              </div>

              {/* Card 3 */}
              <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-[#27aae2]/50 hover:-translate-y-2" data-aos="fade-up" data-aos-delay="200">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  3. 💚 Wellness, Without the Stereotypes
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Wellness is more than meditation or fitness. It's whatever is good for you — connection, joy, creativity, nature, discovery, and shared experiences.
                </p>
              </div>
            </div>
          </div>

          {/* What We Offer Section */}
          <div className="py-5 md:py-10" data-aos="fade-up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 px-4 py-2 rounded-full mb-4">
                <CheckCircle className="w-4 h-4 text-[#27aae2]" />
                <span className="text-sm font-semibold text-[#27aae2]">WHAT WE OFFER</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Everything You Need for<br />Meaningful Experiences
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Offer 1 */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all" data-aos="flip-left" data-aos-delay="0">
                <div className="w-12 h-12 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 rounded-xl flex items-center justify-center mb-4">
                  <Ticket className="w-6 h-6 text-[#27aae2]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  🎟️ Paid & Free Events
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Whether you're exploring on a budget or looking for a premium experience, we make wellness accessible for everyone.
                </p>
              </div>

              {/* Offer 2 */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all" data-aos="flip-left" data-aos-delay="100">
                <div className="w-12 h-12 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-[#27aae2]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  🎫 Flexible Ticket Options
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Event partners can choose between limited-ticket and unlimited-ticket setups, giving them complete control.
                </p>
              </div>

              {/* Offer 3 */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all" data-aos="flip-left" data-aos-delay="200">
                <div className="w-12 h-12 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-[#27aae2]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  🗓️ 15+ Categories
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  From sports & fitness to music & culture, social activities and more. Something for every lifestyle.
                </p>
              </div>

              {/* Offer 4 */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all" data-aos="flip-left" data-aos-delay="300">
                <div className="w-12 h-12 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-[#27aae2]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  ⚡ Instant Booking
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Effortless bookings, secure payments, instant confirmations. Fast, transparent payouts for partners.
                </p>
              </div>
            </div>
          </div>

          {/* Vision Section with Image */}
          <div className="py-16 md:py-24" data-aos="fade-up">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#27aae2]/10 dark:bg-[#27aae2]/20 px-4 py-2 rounded-full">
                  <Users className="w-4 h-4 text-[#27aae2]" />
                  <span className="text-sm font-semibold text-[#27aae2]">OUR VISION</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  🚀 Building a Wellness-First Community
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  A world where wellness is <span className="font-semibold text-[#27aae2]">fun, social, and seamlessly woven</span> into how people live.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  A community where <span className="font-semibold">choosing yourself</span> — your joy, your growth, your peace — becomes the norm.
                </p>
                <div className="pt-6">
                  <button
                    onClick={() => onNavigate('landing')}
                    className="group px-8 py-4 bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] text-white rounded-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <span>Join Us Today</span>
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-w-4 aspect-h-3 rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.pexels.com/photos/3184430/pexels-photo-3184430.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="Community wellness"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating stats */}
                <div className="absolute -top-6 -left-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">100%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Secure</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-5 md:py-10" data-aos="zoom-in">
            <div className="bg-gradient-to-br from-[#27aae2] via-[#1e8bb8] to-[#27aae2] rounded-3xl p-8 md:p-12 lg:p-16 text-center text-white relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  Join Us and Redefine<br />How You Go Out
                </h2>
                <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                  <span className="font-semibold">Niko Free</span> — Wellness that fits your life.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => onNavigate('landing')}
                    className="px-8 py-4 bg-white text-[#27aae2] rounded-xl font-bold hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg"
                  >
                    Discover Events
                  </button>
                  <button
                    onClick={() => onNavigate('become-partner')}
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold hover:bg-white/20 transform hover:scale-105 transition-all"
                  >
                    Partner With Us
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      <Footer onNavigate={onNavigate} />
      </div>
    </div>
    </>
  );
}
