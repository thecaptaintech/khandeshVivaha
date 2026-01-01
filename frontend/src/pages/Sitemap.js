import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Sitemap.css';

const Sitemap = () => {
    const { t, language } = useLanguage();

    const staticPages = [
        {
            path: '/',
            title: t('home'),
            description: t('homePage')
        },
        {
            path: '/register',
            title: t('register'),
            description: t('registerForMarriage')
        },
        {
            path: '/browse',
            title: t('browse'),
            description: t('browseAllProfiles')
        },
        {
            path: '/terms-and-conditions',
            title: t('termsAndConditions'),
            description: t('websiteTerms')
        }
    ];

    return (
        <div className="sitemap-container">
            <div className="sitemap-content">
                <h1 className="sitemap-title">
                    {t('sitemap')}
                </h1>
                <p className="sitemap-description">
                    {t('sitemapDescription')}
                </p>

                {/* Static Pages */}
                <section className="sitemap-section">
                    <h2 className="section-title">
                        {t('mainPages')}
                    </h2>
                    <ul className="sitemap-list">
                        {staticPages.map((page, index) => (
                            <li key={index} className="sitemap-item">
                                <Link to={page.path} className="sitemap-link">
                                    <span className="link-title">{page.title}</span>
                                    <span className="link-path">{page.path}</span>
                                    <span className="link-description">{page.description}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* XML Sitemap Link */}
                <section className="sitemap-section">
                    <h2 className="section-title">
                        {t('xmlSitemap')}
                    </h2>
                    <div className="xml-sitemap-info">
                        <p>
                            {t('xmlSitemapForSearchEngines')}
                        </p>
                        <a 
                            href="/sitemap.xml" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="xml-link"
                        >
                            https://www.khandeshmatrimony.com/sitemap.xml
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Sitemap;

