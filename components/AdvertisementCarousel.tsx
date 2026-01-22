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

interface PromoBannerCarouselProps {
    topBanners: Banner[]
}

export default function PromoBannerCarousel({
    topBanners,
}: PromoBannerCarouselProps) {
    // Top banner carousel setup
    const [topEmblaRef, topEmblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 5000, stopOnInteraction: false })
    ]);
    const [topSelectedIndex, setTopSelectedIndex] = useState(0);

    // Bottom left banner carousel setup
    const [bottomLeftEmblaRef, bottomLeftEmblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 6000, stopOnInteraction: false })
    ]);
    const [bottomLeftSelectedIndex, setBottomLeftSelectedIndex] = useState(0);

    // Bottom right banner carousel setup
    const [bottomRightEmblaRef, bottomRightEmblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 7000, stopOnInteraction: false })
    ]);
    const [bottomRightSelectedIndex, setBottomRightSelectedIndex] = useState(0);

    // Top carousel effect
    const onTopSelect = useCallback(() => {
        if (!topEmblaApi) return;
        setTopSelectedIndex(topEmblaApi.selectedScrollSnap());
    }, [topEmblaApi]);

    useEffect(() => {
        if (!topEmblaApi) return;
        onTopSelect();
        topEmblaApi.on("select", onTopSelect);
        return () => {
            topEmblaApi.off("select", onTopSelect);
        };
    }, [topEmblaApi, onTopSelect]);

    // Bottom left carousel effect
    const onBottomLeftSelect = useCallback(() => {
        if (!bottomLeftEmblaApi) return;
        setBottomLeftSelectedIndex(bottomLeftEmblaApi.selectedScrollSnap());
    }, [bottomLeftEmblaApi]);

    useEffect(() => {
        if (!bottomLeftEmblaApi) return;
        onBottomLeftSelect();
        bottomLeftEmblaApi.on("select", onBottomLeftSelect);
        return () => {
            bottomLeftEmblaApi.off("select", onBottomLeftSelect);
        };
    }, [bottomLeftEmblaApi, onBottomLeftSelect]);

    // Bottom right carousel effect
    const onBottomRightSelect = useCallback(() => {
        if (!bottomRightEmblaApi) return;
        setBottomRightSelectedIndex(bottomRightEmblaApi.selectedScrollSnap());
    }, [bottomRightEmblaApi]);

    useEffect(() => {
        if (!bottomRightEmblaApi) return;
        onBottomRightSelect();
        bottomRightEmblaApi.on("select", onBottomRightSelect);
        return () => {
            bottomRightEmblaApi.off("select", onBottomRightSelect);
        };
    }, [bottomRightEmblaApi, onBottomRightSelect]);

    const scrollToTop = useCallback((index: number) => {
        if (topEmblaApi) topEmblaApi.scrollTo(index);
    }, [topEmblaApi]);

    const scrollToBottomLeft = useCallback((index: number) => {
        if (bottomLeftEmblaApi) bottomLeftEmblaApi.scrollTo(index);
    }, [bottomLeftEmblaApi]);

    const scrollToBottomRight = useCallback((index: number) => {
        if (bottomRightEmblaApi) bottomRightEmblaApi.scrollTo(index);
    }, [bottomRightEmblaApi]);

    return (
        <section className="w-full flex flex-col items-center bg-white py-12 md:py-16 px-4">
            <div className="w-full max-w-360 flex flex-col gap-6 md:gap-8">
                {/* Top Promo Banner - Full width */}
                {topBanners.length > 0 && (
                    <div className="relative w-full">
                        <div className="overflow-hidden rounded-2xl" ref={topEmblaRef}>
                            <div className="flex">
                                {topBanners.map((banner, index) => (
                                    <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative">
                                        <div className="relative w-full aspect-[16/10] md:aspect-[21/9]">
                                            <Image
                                                src={banner.image}
                                                alt={banner.title}
                                                fill
                                                className="object-cover object-center md:object-left"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1440px"
                                                priority={index === 0}
                                            />
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Carousel Dots for Top Banner */}
                        {topBanners.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                                {topBanners.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => scrollToTop(index)}
                                        className={`transition-all duration-300 rounded-full ${index === topSelectedIndex
                                            ? 'bg-white w-4 md:w-6 h-1.5 md:h-2'
                                            : 'bg-white/50 w-1.5 md:w-2 h-1.5 md:h-2 hover:bg-white/75'
                                            }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Bottom Row: Two-column layout */}
                {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 w-full">
                    {bottomLeftBanners.length > 0 && (
                        <div className="relative w-full">
                            <div className="overflow-hidden rounded-2xl" ref={bottomLeftEmblaRef}>
                                <div className="flex">
                                    {bottomLeftBanners.map((banner, index) => (
                                        <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative">
                                            <div className="relative w-full aspect-[4/3] md:aspect-[7/5]">
                                                <Image
                                                    src={banner.image}
                                                    alt={banner.title}
                                                    fill
                                                    className="object-cover object-left"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 720px"
                                                    priority={index === 0}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {bottomLeftBanners.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                                    {bottomLeftBanners.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => scrollToBottomLeft(index)}
                                            className={`transition-all duration-300 rounded-full ${index === bottomLeftSelectedIndex
                                                ? 'bg-white w-4 md:w-6 h-1.5 md:h-2'
                                                : 'bg-white/50 w-1.5 md:w-2 h-1.5 md:h-2 hover:bg-white/75'
                                                }`}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {bottomRightBanners.length > 0 && (
                        <div className="relative w-full">
                            <div className="overflow-hidden rounded-2xl" ref={bottomRightEmblaRef}>
                                <div className="flex">
                                    {bottomRightBanners.map((banner, index) => (
                                        <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative">
                                            <div className="relative w-full aspect-[4/3] md:aspect-[7/5]">
                                                <Image
                                                    src={banner.image}
                                                    alt={banner.title}
                                                    fill
                                                    className="object-cover object-left"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 720px"
                                                    priority={index === 0}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {bottomRightBanners.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                                    {bottomRightBanners.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => scrollToBottomRight(index)}
                                            className={`transition-all duration-300 rounded-full ${index === bottomRightSelectedIndex
                                                ? 'bg-white w-4 md:w-6 h-1.5 md:h-2'
                                                : 'bg-white/50 w-1.5 md:w-2 h-1.5 md:h-2 hover:bg-white/75'
                                                }`}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div> */}
            </div>
        </section>
    )
}