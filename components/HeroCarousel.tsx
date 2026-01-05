'use client'

import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"

interface Banner {
    id: number
    title: string
    image: string
}

interface HeroCarouselProp {
    banners: Banner[],
    heading?: string,
    subheading?: string
}

export default function HeroCarousel({ banners, heading, subheading }: HeroCarouselProp) {
    // Hero carousel setup
    const [heroEmblaRef, heroEmblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 5000, stopOnInteraction: false })
    ]);
    const [heroSelectedIndex, setHeroSelectedIndex] = useState(0);


    // Hero carousel effect
    const onHeroSelect = useCallback(() => {
        if (!heroEmblaApi) return;
        setHeroSelectedIndex(heroEmblaApi.selectedScrollSnap());
    }, [heroEmblaApi]);

    useEffect(() => {
        if (!heroEmblaApi) return;
        onHeroSelect();
        heroEmblaApi.on("select", onHeroSelect);
        return () => {
            heroEmblaApi.off("select", onHeroSelect);
        };
    }, [heroEmblaApi, onHeroSelect]);

    const scrollToHero = useCallback((index: number) => {
        if (heroEmblaApi) heroEmblaApi.scrollTo(index);
    }, [heroEmblaApi]);

    return (
        <section className="relative w-full flex flex-col items-center bg-black">
            {/* Image Carousel */}
            <div className="relative w-full">
                <div className="relative w-full min-h-[300px] md:min-h-[500px] lg:min-h-[780px]">
                    {/* Carousel */}
                    <div className="overflow-hidden h-full" ref={heroEmblaRef}>
                        <div className="flex h-full">
                            {banners.length > 0 ? (
                                banners.map((banner, index) => (
                                    <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative h-full">
                                        <div className="relative w-full h-[300px] md:h-[500px] lg:h-[780px]">
                                            <Image
                                                src={banner.image}
                                                alt={banner.title}
                                                fill
                                                className="object-cover opacity-80"
                                                priority={index === 0}
                                                sizes="100vw"
                                            />
                                            <div className="absolute inset-0 bg-black opacity-40 z-0" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex-[0_0_100%] min-w-0 relative">
                                    <div className="relative w-full h-[300px] md:h-[500px] bg-gray-800" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Text Overlay - Hidden on Mobile */}
                    <div className="hidden md:block absolute inset-0 z-10">
                        <div className="h-full flex items-end pb-10">
                            <div className="w-full max-w-[951px] mx-auto px-6 md:px-12">
                                <h1 className="font-poppins text-white text-3xl md:text-4xl lg:text-[3.1rem] font-bold leading-tight drop-shadow-2xl">
                                    {heading}
                                </h1>
                                <p className="text-white text-base md:text-lg lg:text-[1.15rem] max-w-lg drop-shadow-lg">
                                    {subheading}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Carousel Dots */}
                    {banners.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollToHero(index)}
                                    className={`transition-all duration-300 rounded-full ${index === heroSelectedIndex
                                        ? 'bg-white w-4 md:w-6 h-1.5 md:h-2'
                                        : 'bg-white/50 w-1.5 md:w-2 h-1.5 md:h-2 hover:bg-white/75'
                                        }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
