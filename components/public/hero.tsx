"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
    alt: "Students coding together",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=80",
    alt: "Club workshop session",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80",
    alt: "Programming contest presentation",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] border-b border-[var(--btn-secondary-border)]">
      
      {/* Top Image Slider Section */}
      <div className="relative w-full h-[320px] sm:h-[450px] md:h-[580px] overflow-hidden group">
        
        {/* Images Wrap */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              className="object-cover"
            />
            {/* Dark Overlay image accent */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        {/* Left Arrow Button */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-md bg-black/40 text-white hover:bg-black/70 border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-md bg-black/40 text-white hover:bg-black/70 border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
        >
          <ChevronRight size={20} />
        </button>

        {/* Carousel Indicators (Dots/Bars) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                index === currentSlide
                  ? "w-8 bg-[var(--btn-primary-bg)]"
                  : "w-2 bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Content & Action Buttons Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          
          {/* Left Text Box */}
          <div className="md:col-span-7 flex flex-col justify-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--btn-primary-bg)]">
              ABOUT THE CLUB
            </span>
            <p className="text-base sm:text-lg text-[var(--text-primary)] leading-relaxed font-normal">
              Computer Club is where CSE students at NeU write code, ship
              projects, run workshops, and argue about tabs vs. spaces.
              Everyone who likes making things is welcome.
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="md:col-span-5 flex flex-col justify-center space-y-3">
            <Link
              href="/events"
              className="w-full py-3.5 px-6 rounded bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-semibold text-center text-xs sm:text-sm tracking-wider uppercase hover:opacity-90 transition-all shadow-md"
            >
              EXPLORE EVENTS
            </Link>
            
            <Link
              href="/membership"
              className="w-full py-3.5 px-6 rounded bg-transparent border border-[var(--text-primary)] text-[var(--text-primary)] font-semibold text-center text-xs sm:text-sm tracking-wider uppercase hover:bg-[var(--stat-card-bg)] transition-all"
            >
              BECOME A MEMBER
            </Link>
          </div>

        </div>
      </div>

    </section>
  );
}