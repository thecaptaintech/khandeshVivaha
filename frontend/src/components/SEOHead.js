import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const SEOHead = () => {
    const location = useLocation();
    const { language } = useLanguage();

    useEffect(() => {
        // Update document title and meta tags based on current page
        const updateSEO = () => {
            const baseTitle = language === 'mr' 
                ? 'खान्देश मॅट्रिमोनी | Khandesh Matrimony | खान्देश विवाह | खान्देश लग्न'
                : 'Khandesh Matrimony | Khandesh Vivah | Khandesh Maratha Matrimony | Khandesh Lagn';
            
            const baseDescription = language === 'mr'
                ? 'खान्देश मॅट्रिमोनी - खान्देश समुदायासाठी विश्वासू विवाह नोंदणी व्यासपीठ. खान्देश विवाह, खान्देश लग्न, खान्देश मराठा मॅट्रिमोनी. योग्य जीवनसाथी शोधा.'
                : 'Khandesh Matrimony - Trusted marriage registration platform for Khandesh community. Khandesh Vivah, Khandesh Lagn, Khandesh Maratha Matrimony. Find your perfect life partner.';

            const keywords = language === 'mr'
                ? 'खान्देश मॅट्रिमोनी, खान्देश विवाह, खान्देश लग्न, खान्देश मराठा मॅट्रिमोनी, खान्देश विवाह नोंदणी, खान्देश लग्न जोडी, खान्देश समुदाय विवाह, खान्देश मराठा लग्न, खान्देश जोडीदार शोध, खान्देश विवाह साइट'
                : 'Khandesh Matrimony, Khandesh Vivah, Khandesh Lagn, Khandesh Maratha Matrimony, Khandesh Marriage Registration, Khandesh Matrimony Site, Khandesh Community Marriage, Khandesh Maratha Wedding, Khandesh Bride Groom Search, Khandesh Matrimonial Services';

            let pageTitle = baseTitle;
            let pageDescription = baseDescription;

            // Page-specific SEO
            switch (location.pathname) {
                case '/':
                    pageTitle = language === 'mr'
                        ? 'खान्देश मॅट्रिमोनी | मुख्यपृष्ठ | Khandesh Matrimony | खान्देश विवाह'
                        : 'Khandesh Matrimony | Home | Khandesh Vivah | Khandesh Maratha Matrimony';
                    pageDescription = language === 'mr'
                        ? 'खान्देश मॅट्रिमोनी मुख्यपृष्ठ. खान्देश समुदायासाठी विवाह नोंदणी. खान्देश विवाह, खान्देश लग्न, खान्देश मराठा मॅट्रिमोनी.'
                        : 'Khandesh Matrimony Home - Marriage registration for Khandesh community. Khandesh Vivah, Khandesh Lagn, Khandesh Maratha Matrimony services.';
                    break;
                case '/register':
                    pageTitle = language === 'mr'
                        ? 'नोंदणी करा | खान्देश मॅट्रिमोनी | Khandesh Matrimony Registration'
                        : 'Register | Khandesh Matrimony | Khandesh Vivah Registration';
                    pageDescription = language === 'mr'
                        ? 'खान्देश मॅट्रिमोनी वर नोंदणी करा. खान्देश विवाह, खान्देश लग्नासाठी नोंदणी. सोपी आणि जलद प्रक्रिया.'
                        : 'Register on Khandesh Matrimony. Registration for Khandesh Vivah, Khandesh Lagn. Simple and quick process.';
                    break;
                case '/browse':
                    pageTitle = language === 'mr'
                        ? 'प्रोफाइल पहा | खान्देश मॅट्रिमोनी | Khandesh Matrimony Profiles'
                        : 'Browse Profiles | Khandesh Matrimony | Khandesh Vivah Profiles';
                    pageDescription = language === 'mr'
                        ? 'खान्देश मॅट्रिमोनी वर सर्व प्रोफाइल पहा. खान्देश विवाह, खान्देश लग्नासाठी योग्य जोडीदार शोधा.'
                        : 'Browse all profiles on Khandesh Matrimony. Find perfect match for Khandesh Vivah, Khandesh Lagn.';
                    break;
                case '/sitemap':
                    pageTitle = language === 'mr'
                        ? 'साइटमॅप | खान्देश मॅट्रिमोनी'
                        : 'Sitemap | Khandesh Matrimony';
                    break;
                default:
                    if (location.pathname.startsWith('/profile/')) {
                        pageTitle = language === 'mr'
                            ? 'प्रोफाइल तपशील | खान्देश मॅट्रिमोनी'
                            : 'Profile Details | Khandesh Matrimony';
                    }
            }

            // Update title
            document.title = pageTitle;

            // Update or create meta tags
            const updateMetaTag = (name, content, isProperty = false) => {
                const attribute = isProperty ? 'property' : 'name';
                let meta = document.querySelector(`meta[${attribute}="${name}"]`);
                if (!meta) {
                    meta = document.createElement('meta');
                    meta.setAttribute(attribute, name);
                    document.head.appendChild(meta);
                }
                meta.setAttribute('content', content);
            };

            // Basic meta tags
            updateMetaTag('description', pageDescription);
            updateMetaTag('keywords', keywords);
            updateMetaTag('author', 'Khandesh Matrimony');
            updateMetaTag('robots', 'index, follow');
            updateMetaTag('language', language === 'mr' ? 'Marathi' : 'English');
            updateMetaTag('revisit-after', '7 days');

            // Open Graph tags
            updateMetaTag('og:title', pageTitle, true);
            updateMetaTag('og:description', pageDescription, true);
            updateMetaTag('og:type', 'website', true);
            updateMetaTag('og:url', `https://www.khandeshmatrimony.com${location.pathname}`, true);
            updateMetaTag('og:site_name', 'Khandesh Matrimony', true);
            updateMetaTag('og:locale', language === 'mr' ? 'mr_IN' : 'en_US', true);
            updateMetaTag('og:locale:alternate', language === 'mr' ? 'en_US' : 'mr_IN', true);

            // Twitter Card tags
            updateMetaTag('twitter:card', 'summary_large_image');
            updateMetaTag('twitter:title', pageTitle);
            updateMetaTag('twitter:description', pageDescription);
            updateMetaTag('twitter:site', '@khandeshmatrimony');

            // Canonical URL
            let canonical = document.querySelector('link[rel="canonical"]');
            if (!canonical) {
                canonical = document.createElement('link');
                canonical.setAttribute('rel', 'canonical');
                document.head.appendChild(canonical);
            }
            canonical.setAttribute('href', `https://www.khandeshmatrimony.com${location.pathname}`);

            // Language alternates
            const addAlternate = (lang, href) => {
                let alternate = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
                if (!alternate) {
                    alternate = document.createElement('link');
                    alternate.setAttribute('rel', 'alternate');
                    alternate.setAttribute('hreflang', lang);
                    document.head.appendChild(alternate);
                }
                alternate.setAttribute('href', href);
            };
            addAlternate('mr', `https://www.khandeshmatrimony.com${location.pathname}?lang=mr`);
            addAlternate('en', `https://www.khandeshmatrimony.com${location.pathname}?lang=en`);
            addAlternate('x-default', `https://www.khandeshmatrimony.com${location.pathname}`);

            // Structured Data (JSON-LD)
            const removeExistingStructuredData = () => {
                const existing = document.querySelectorAll('script[type="application/ld+json"]');
                existing.forEach(el => el.remove());
            };
            removeExistingStructuredData();

            const structuredData = {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Khandesh Matrimony",
                "alternateName": ["खान्देश मॅट्रिमोनी", "Khandesh Vivah", "Khandesh Lagn", "Khandesh Maratha Matrimony"],
                "url": "https://www.khandeshmatrimony.com",
                "description": pageDescription,
                "inLanguage": language === 'mr' ? 'mr' : 'en',
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://www.khandeshmatrimony.com/browse?search={search_term_string}",
                    "query-input": "required name=search_term_string"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "Khandesh Matrimony",
                    "alternateName": "खान्देश मॅट्रिमोनी"
                }
            };

            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.text = JSON.stringify(structuredData);
            document.head.appendChild(script);

            // Add Matrimonial Service structured data
            const serviceData = {
                "@context": "https://schema.org",
                "@type": "Service",
                "serviceType": "Matrimonial Service",
                "provider": {
                    "@type": "Organization",
                    "name": "Khandesh Matrimony",
                    "alternateName": ["खान्देश मॅट्रिमोनी", "Khandesh Vivah", "Khandesh Lagn"],
                    "url": "https://www.khandeshmatrimony.com",
                    "logo": "https://www.khandeshmatrimony.com/logo.png"
                },
                "areaServed": {
                    "@type": "State",
                    "name": "Maharashtra",
                    "containsPlace": {
                        "@type": "Place",
                        "name": "Khandesh Region"
                    }
                },
                "description": pageDescription,
                "keywords": keywords
            };

            const serviceScript = document.createElement('script');
            serviceScript.type = 'application/ld+json';
            serviceScript.text = JSON.stringify(serviceData);
            document.head.appendChild(serviceScript);
        };

        updateSEO();
    }, [location.pathname, language]);

    return null;
};

export default SEOHead;

