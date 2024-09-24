"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import SplashScreen from "@/components/SplashScreen";

const HomePage = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current URL path
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const locale = pathname.split("/")[1]; // Extract the locale from the URL

    if (locale) {
      const timer = setTimeout(() => {
        setLoading(false);
        router.replace(`/${locale}/projects`);
      }, 3000); // Adjust the timeout duration as needed

      return () => clearTimeout(timer); // Cleanup the timer if the component unmounts
    }
  }, [pathname, router]);

  if (loading) {
    return <SplashScreen />;
  }

  return null; // Optionally return null after loading
};

export default HomePage;
