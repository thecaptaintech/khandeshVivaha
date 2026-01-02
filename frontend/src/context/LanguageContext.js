import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navbar
    home: 'Home',
    register: 'Register',
    browse: 'Browse Profiles',
    adminLogin: 'Admin Login',
    language: 'Language',
    
    // Home Page
    heroTitle: 'Find Your Perfect Life Partner',
    heroSubtitle: 'Trusted Matrimony Service for Khandesh Community',
    heroTitleMarathi: 'खान्देश मॅट्रिमोनी',
    heroSubtitleMarathi: 'आपल्या योग्य जीवनसाथीचा शोध सुरू करा',
    aboutTitle: 'About Khandesh Matrimony',
    aboutDescription: 'Khandesh Matrimony (khandeshmatrimony.com) is a dedicated marriage registration platform for the Khandesh community. We help individuals and families find suitable life partners within our community, preserving our cultural values and traditions.',
    whyChooseUs: 'Why Choose Us?',
    verifiedProfiles: 'Verified Profiles',
    verifiedProfilesDesc: 'All profiles are verified by our admin team',
    easyRegistration: 'Easy Registration',
    easyRegistrationDesc: 'Simple and quick registration process',
    privacySecurity: 'Privacy & Security',
    privacySecurityDesc: 'Your data is safe and secure with us',
    communityFocused: 'Community Focused',
    communityFocusedDesc: 'Dedicated platform for Khandesh community',
    getStarted: 'Get Started Today',
    registerNow: 'Register Now',
    browseProfiles: 'Browse Profiles',
    
    // Registration
    registrationForm: 'Registration Form',
    registrationSuccess: 'Registration Successful!',
    yourRegisterId: 'Your Register ID',
    fullName: 'Full Name',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    divorcee: 'Divorcee',
    widow: 'Widow',
    widower: 'Widower',
    dateOfBirth: 'Date of Birth',
    casteReligion: 'Caste / Religion',
    education: 'Education',
    occupation: 'Occupation',
    height: 'Height',
    weight: 'Weight',
    district: 'District',
    taluka: 'Taluka',
    village: 'Village',
    contactNumber: 'Contact Number',
    email: 'Email',
    aboutYourself: 'About Yourself',
    uploadPhotos: 'Upload Photos (Max 4)',
    selectPhotos: 'Select Photos',
    photosSelected: 'photos selected',
    submit: 'Submit',
    paymentInstructions: 'Payment Instructions',
    paymentNote: 'Please send payment to UPI ID: {upi_id} with your KM Register ID as reference.',
    contactAdmin: 'Contact info@khandeshmatrimony.com for confirmation.',
    
    // Browse
    browseTitle: 'Browse Profiles',
    filterByGender: 'Filter by Gender',
    all: 'All',
    searchPlaceholder: 'Search by name or ID...',
    noProfilesFound: 'No profiles found',
    years: 'years',
    viewProfile: 'View Profile',
    
    // Profile Detail
    profileDetails: 'Profile Details',
    basicInformation: 'Basic Information',
    age: 'Age',
    contactInformation: 'Contact Information',
    phone: 'Phone',
    location: 'Location',
    about: 'About',
    photos: 'Photos',
    backToProfiles: 'Back to Profiles',
    
    // Admin
    adminPanel: 'Admin Panel',
    login: 'Login',
    username: 'Username',
    password: 'Password',
    dashboard: 'Dashboard',
    statistics: 'Statistics',
    pendingApprovals: 'Pending Approvals',
    approvedProfiles: 'Approved Profiles',
    rejectedProfiles: 'Rejected Profiles',
    paidUsers: 'Paid Users',
    unpaidUsers: 'Unpaid Users',
    pendingRegistrations: 'Pending Registrations',
    approve: 'Approve',
    reject: 'Reject',
    markAsPaid: 'Mark as Paid',
    markAsUnpaid: 'Mark as Unpaid',
    delete: 'Delete',
    registeredOn: 'Registered on',
    paymentStatus: 'Payment Status',
    approvalStatus: 'Approval Status',
    actions: 'Actions',
    logout: 'Logout',
    
    // Status
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    paid: 'Paid',
    unpaid: 'Unpaid',
    
    // Footer
    footerAbout: 'About',
    footerAboutText: 'Khandesh Matrimony (khandeshmatrimony.com) is a trusted platform for finding life partners within the Khandesh community.',
    footerQuickLinks: 'Quick Links',
    footerContact: 'Contact Us',
    footerPhone: 'Phone',
    footerEmail: 'Email',
    footerRights: '© 2026 Khandesh Matrimony. All rights reserved.',
    footerDisclaimer: 'Khandesh Matrimony is a matchmaking service only. Please verify all details independently before marriage.',
    topDisclaimer: 'Khandesh Matrimony is a matchmaking service only. Please verify all details independently before marriage.',
    termsAndConditions: 'Terms & Conditions',
    
    // Sitemap
    sitemap: 'Sitemap',
    sitemapDescription: 'Complete list of all pages on our website',
    mainPages: 'Main Pages',
    xmlSitemap: 'XML Sitemap',
    xmlSitemapForSearchEngines: 'XML Sitemap for search engines:',
    homePage: 'Khandesh Matrimony Home Page',
    registerForMarriage: 'Register for Marriage',
    browseAllProfiles: 'Browse All Available Profiles',
    websiteTerms: 'Website Terms and Conditions',
  },
  
  mr: {
    // Navbar
    home: 'मुख्यपृष्ठ',
    register: 'नोंदणी करा',
    browse: 'प्रोफाइल पहा',
    adminLogin: 'प्रशासक लॉगिन',
    language: 'भाषा',
    
    // Home Page
    heroTitle: 'आपला योग्य जीवनसाथी शोधा',
    heroSubtitle: 'खान्देश समुदायासाठी विश्वासू मॅट्रिमोनी सेवा',
    heroTitleMarathi: 'खान्देश मॅट्रिमोनी',
    heroSubtitleMarathi: 'आपल्या योग्य जीवनसाथीचा शोध सुरू करा',
    aboutTitle: 'खान्देश मॅट्रिमोनी बद्दल',
    aboutDescription: 'खान्देश मॅट्रिमोनी (khandeshmatrimony.com) हे खान्देश समुदायासाठी एक समर्पित विवाह नोंदणी व्यासपीठ आहे. आम्ही व्यक्ती आणि कुटुंबांना आपल्या समुदायात योग्य जीवनसाथी शोधण्यात मदत करतो, आपली सांस्कृतिक मूल्ये आणि परंपरा जपत.',
    whyChooseUs: 'आम्हाला का निवडावे?',
    verifiedProfiles: 'सत्यापित प्रोफाइल',
    verifiedProfilesDesc: 'सर्व प्रोफाइल आमच्या प्रशासक टीमद्वारे सत्यापित',
    easyRegistration: 'सोपी नोंदणी',
    easyRegistrationDesc: 'साधी आणि जलद नोंदणी प्रक्रिया',
    privacySecurity: 'गोपनीयता आणि सुरक्षा',
    privacySecurityDesc: 'आपला डेटा आमच्याकडे सुरक्षित आहे',
    communityFocused: 'समुदाय केंद्रित',
    communityFocusedDesc: 'खान्देश समुदायासाठी समर्पित व्यासपीठ',
    getStarted: 'आज सुरुवात करा',
    registerNow: 'आता नोंदणी करा',
    browseProfiles: 'प्रोफाइल पहा',
    
    // Registration
    registrationForm: 'नोंदणी फॉर्म',
    registrationSuccess: 'नोंदणी यशस्वी!',
    yourRegisterId: 'तुमचा नोंदणी क्रमांक',
    fullName: 'पूर्ण नाव',
    gender: 'लिंग',
    male: 'पुरुष',
    female: 'स्त्री',
    divorcee: 'घटस्फोटित',
    widow: 'विधवा',
    widower: 'विदुर',
    dateOfBirth: 'जन्मतारीख',
    casteReligion: 'जात / धर्म',
    education: 'शिक्षण',
    occupation: 'व्यवसाय',
    height: 'उंची',
    weight: 'वजन',
    district: 'जिल्हा',
    taluka: 'तालुका',
    village: 'गाव',
    contactNumber: 'संपर्क क्रमांक',
    email: 'ईमेल',
    aboutYourself: 'स्वतःबद्दल',
    uploadPhotos: 'फोटो अपलोड करा (कमाल ४)',
    selectPhotos: 'फोटो निवडा',
    photosSelected: 'फोटो निवडले',
    submit: 'सबमिट करा',
    paymentInstructions: 'पेमेंट सूचना',
    paymentNote: 'कृपया UPI ID: {upi_id} वर तुमच्या KM नोंदणी क्रमांकासह पेमेंट पाठवा.',
    contactAdmin: 'पुष्टीकरणासाठी info@khandeshmatrimony.com वर संपर्क साधा.',
    
    // Browse
    browseTitle: 'प्रोफाइल पहा',
    filterByGender: 'लिंगानुसार फिल्टर करा',
    all: 'सर्व',
    searchPlaceholder: 'नाव किंवा आयडीने शोधा...',
    noProfilesFound: 'कोणतेही प्रोफाइल आढळले नाही',
    years: 'वर्षे',
    viewProfile: 'प्रोफाइल पहा',
    
    // Profile Detail
    profileDetails: 'प्रोफाइल तपशील',
    basicInformation: 'मूलभूत माहिती',
    age: 'वय',
    contactInformation: 'संपर्क माहिती',
    phone: 'फोन',
    location: 'स्थान',
    about: 'बद्दल',
    photos: 'फोटो',
    backToProfiles: 'प्रोफाइलकडे परत',
    
    // Admin
    adminPanel: 'प्रशासक पॅनेल',
    login: 'लॉगिन',
    username: 'वापरकर्तानाव',
    password: 'पासवर्ड',
    dashboard: 'डॅशबोर्ड',
    statistics: 'आकडेवारी',
    pendingApprovals: 'प्रलंबित मंजुरी',
    approvedProfiles: 'मंजूर प्रोफाइल',
    rejectedProfiles: 'नाकारलेले प्रोफाइल',
    paidUsers: 'पैसे भरलेले वापरकर्ते',
    unpaidUsers: 'पैसे न भरलेले वापरकर्ते',
    pendingRegistrations: 'प्रलंबित नोंदणी',
    approve: 'मंजूर करा',
    reject: 'नाकारा',
    markAsPaid: 'पेड म्हणून चिन्हांकित करा',
    markAsUnpaid: 'अनपेड म्हणून चिन्हांकित करा',
    delete: 'हटवा',
    registeredOn: 'नोंदणी दिनांक',
    paymentStatus: 'पेमेंट स्थिती',
    approvalStatus: 'मंजूरी स्थिती',
    actions: 'क्रिया',
    logout: 'बाहेर पडा',
    
    // Status
    pending: 'प्रलंबित',
    approved: 'मंजूर',
    rejected: 'नाकारले',
    paid: 'पेड',
    unpaid: 'अनपेड',
    
    // Footer
    footerAbout: 'बद्दल',
    footerAboutText: 'खान्देश मॅट्रिमोनी (khandeshmatrimony.com) हे खान्देश समुदायात जीवनसाथी शोधण्यासाठी एक विश्वासू व्यासपीठ आहे.',
    footerQuickLinks: 'द्रुत दुवे',
    footerContact: 'आमच्याशी संपर्क साधा',
    footerPhone: 'फोन',
    footerEmail: 'ईमेल',
    footerRights: '© २०२५ खान्देश मॅट्रिमोनी. सर्व हक्क राखीव.',
    footerDisclaimer: 'खान्देश मॅट्रिमनी ही केवळ ओळख करून देणारी सेवा आहे. विवाह ठरवण्याआधी सर्व माहिती स्वतः पडताळून घ्या.',
    topDisclaimer: 'खान्देश मॅट्रिमनी ही केवळ ओळख करून देणारी सेवा आहे. विवाह ठरवण्याआधी सर्व माहिती स्वतः पडताळून घ्या.',
    termsAndConditions: 'अटी व शर्ती',
    
    // Sitemap
    sitemap: 'साइटमॅप',
    sitemapDescription: 'आमच्या वेबसाइटवरील सर्व पृष्ठांची यादी',
    mainPages: 'मुख्य पृष्ठे',
    xmlSitemap: 'XML साइटमॅप',
    xmlSitemapForSearchEngines: 'सर्च इंजिनसाठी XML साइटमॅप:',
    homePage: 'खानदेश मॅट्रिमोनी मुख्यपृष्ठ',
    registerForMarriage: 'विवाहासाठी नोंदणी करा',
    browseAllProfiles: 'सर्व उपलब्ध प्रोफाइल पहा',
    websiteTerms: 'वेबसाइटचे नियम आणि अटी',
  }
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('mr'); // Default to English

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'mr' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

