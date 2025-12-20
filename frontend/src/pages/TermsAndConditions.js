import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './TermsAndConditions.css';

const TermsAndConditions = () => {
  const { language, t } = useLanguage();

  const marathiContent = {
    title: 'अटी व शर्ती – खान्देश मॅट्रिमनी',
    sections: [
      {
        heading: 'सेवेचा उद्देश',
        content: 'खान्देश मॅट्रिमनी ही केवळ एक विवाहविषयक माहिती व ओळख करून देणारी सेवा आहे. ही कोणत्याही प्रकारे विवाहाची हमी, वचनबद्धता किंवा कायदेशीर करार प्रदान करत नाही.'
      },
      {
        heading: 'जबाबदारी व पडताळणी',
        content: 'वेबसाईटवर दिलेली सर्व माहिती (नाव, वय, शिक्षण, व्यवसाय, जात, वैवाहिक स्थिती इ.) संबंधित वापरकर्त्यांनी स्वतः भरलेली असते. विवाह ठरवण्यापूर्वी वधू-वरांनी व त्यांच्या कुटुंबीयांनी एकमेकांची माहिती स्वतः योग्य प्रकारे पडताळून घ्यावी.'
      },
      {
        heading: 'विवाहाचा निर्णय',
        content: 'विवाहाचा अंतिम निर्णय हा पूर्णपणे दोन्ही पक्षांचा (वधू व वर) आणि त्यांच्या कुटुंबीयांचा आहे. खान्देश मॅट्रिमनी कोणत्याही विवाहासाठी जबाबदार राहणार नाही.'
      },
      {
        heading: 'खोटी माहिती',
        content: 'कोणत्याही प्रकारची चुकीची, खोटी किंवा दिशाभूल करणारी माहिती दिल्यास संबंधित प्रोफाइल हटवण्याचा अधिकार खान्देश मॅट्रिमनीकडे राखीव आहे.'
      },
      {
        heading: 'वयाची अट',
        content: 'वेबसाईट वापरण्यासाठी वापरकर्ता कायदेशीर विवाहयोग्य वयाचा असणे आवश्यक आहे (वर: 21 वर्षे, वधू: 18 वर्षे).'
      },
      {
        heading: 'सुरक्षा व गोपनीयता',
        content: 'वापरकर्त्यांची वैयक्तिक माहिती सुरक्षित ठेवण्याचा आम्ही प्रयत्न करतो, मात्र वैयक्तिक संवाद किंवा भेटींची जबाबदारी वापरकर्त्यांची स्वतःची असेल.'
      },
      {
        heading: 'जबाबदारी नाकारणे (Disclaimer)',
        content: 'भेटी, संवाद, नाते जुळणे किंवा विवाहानंतर उद्भवणाऱ्या कोणत्याही समस्यांसाठी खान्देश मॅट्रिमनी जबाबदार राहणार नाही.'
      },
      {
        heading: 'अटींमध्ये बदल',
        content: 'या अटी व शर्ती कोणतीही पूर्वसूचना न देता बदलण्याचा अधिकार खान्देश मॅट्रिमनीकडे राखीव आहे.'
      }
    ]
  };

  const englishContent = {
    title: 'Terms & Conditions – Khandesh Matrimony',
    sections: [
      {
        heading: 'Nature of Service',
        content: 'Khandesh Matrimony is only a matchmaking and profile-listing platform. We do not guarantee marriage, engagement, or any form of commitment between users.'
      },
      {
        heading: 'User Responsibility & Verification',
        content: 'All profile information is provided by users themselves. Users and their families must personally verify all details before proceeding towards marriage.'
      },
      {
        heading: 'Marriage Decision',
        content: 'The final decision to marry rests solely with the bride, groom, and their families. Khandesh Matrimony holds no responsibility for any marriage outcome.'
      },
      {
        heading: 'False Information',
        content: 'Any profile found with false, misleading, or incorrect information may be removed without notice.'
      },
      {
        heading: 'Age Requirement',
        content: 'Users must be of legal marriage age (Male: 21 years, Female: 18 years).'
      },
      {
        heading: 'Privacy & Safety',
        content: 'We strive to protect user data, but personal meetings, communications, and decisions are entirely at the user\'s own risk.'
      },
      {
        heading: 'Disclaimer',
        content: 'Khandesh Matrimony is not responsible for disputes, misunderstandings, or issues arising before or after marriage.'
      },
      {
        heading: 'Modification of Terms',
        content: 'These terms may be updated at any time without prior notice.'
      }
    ]
  };

  const content = language === 'mr' ? marathiContent : englishContent;

  return (
    <div className="terms-and-conditions-page">
      <div className="container">
        <div className="terms-content">
          <h1 className="terms-title">{content.title}</h1>
          
          <div className="terms-sections">
            {content.sections.map((section, index) => (
              <div key={index} className="terms-section">
                <h2 className="section-heading">{section.heading}</h2>
                <p className="section-content">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="terms-footer">
            <p className="terms-last-updated">
              {language === 'mr' 
                ? 'अंतिम अपडेट: ' 
                : 'Last Updated: '}
              {new Date().toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;

