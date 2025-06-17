"use client";
import Script from "next/script";

export default function GoogleMapsScript() {
  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry&loading=async&callback=initMap`}
        strategy="beforeInteractive"
        onLoad={() => {
          window.dispatchEvent(new CustomEvent('googleMapsLoaded'));
        }}
      />
      <Script id="google-maps-callback" strategy="beforeInteractive">
        {`
          window.initMap = function() {
            window.googleMapsReady = true;
            window.dispatchEvent(new CustomEvent('googleMapsReady'));
          };
        `}
      </Script>
    </>
  );
} 