import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';


type SectionType = 'farmers' | 'ladies' | 'students' | 'seniors';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    image?: string | null;
}

interface SectionData {
    id: SectionType;
    label: string;
    themeColor: string;
    lightThemeColor: string;
    hero: { tag: string; title: string; desc: string; };
    diagnostic: { title: string; uploadTitle: string; uploadDesc: string; chatTitle: string; chatDesc: string; };
    schemes: Array<{ title: string; desc: string; id: string; img: string; }>;
    services: Array<{ title: string; dist: string; icon: string; color: string; }>;
    specialService?: { title: string; addr: string; icon: string; };
    avatar: string;
    userName: string;
}


const SECTIONS: Record<SectionType, SectionData> = {
    farmers: {
        id: 'farmers', label: 'किसान', themeColor: 'bg-emerald-600', lightThemeColor: 'bg-emerald-50 text-emerald-700',
        hero: { tag: "24/7 हेल्पलाइन", title: "नमस्ते!\nखेती में मदद?", desc: "फसलों, कीटों and सब्सिडी पर विशेषज्ञ सलाह के लिए बस एक कॉल करें।" },
        diagnostic: { title: "फसलें", uploadTitle: "फोटो निदान", uploadDesc: "AI तुरंत कीटों का पता लगाता है", chatTitle: "विशेषज्ञ चैट", chatDesc: "AI विशेषज्ञ से बात करें" },
        schemes: [
            { title: "जैविक मिशन", desc: "खाद के लिए ₹50,000 की सब्सिडी।", id: "PM-2024", img: "/schemes/farmer_organic.png" },
            { title: "ड्रिप सिंचाई", desc: "सोलर पंप स्थापना।", id: "MI-SCH", img: "/schemes/farmer_irrigation.png" }



        ],
        services: [
            { title: "कृषि केंद्र", dist: "2.4 किमी दूर", icon: "local_police", color: "text-emerald-600" },
            { title: "पशु अस्पताल", dist: "0.8 किमी दूर", icon: "medical_services", color: "text-red-500" }
        ],

        specialService: { title: "कृषि विज्ञान केंद्र", addr: "मुख्य बाजार रोड", icon: "agriculture" },
        avatar: "/avatars/farmer.png",
        userName: "राजेश कुमार"
    },




    ladies: {
        id: 'ladies', label: 'महिलाएँ', themeColor: 'bg-pink-600', lightThemeColor: 'bg-pink-50 text-pink-700',
        hero: { tag: "सुरक्षा और स्वास्थ्य", title: "नमस्ते!\nसहायता चाहिए?", desc: "महिला स्वास्थ्य और कल्याण पर विशेषज्ञ सलाह के लिए बस एक कॉल करें।" },
        diagnostic: { title: "कल्याण", uploadTitle: "स्वास्थ्य जाँच", uploadDesc: "बच्चों की देखभाल के लिए AI मार्गदर्शन", chatTitle: "SHG समूह", chatDesc: "स्थानीय महिलाओं से जुड़ें" },
        schemes: [
            { title: "मातृ वंदना", desc: "स्तनपान कराने वाली माताओं के लिए ₹5,000।", id: "PMMVY-24", img: "/schemes/lady_maternal.png" },
            { title: "कौशल अनुदान", desc: "नर्सिंग और डिजिटल साक्षरता प्रशिक्षण।", id: "STEW-SCH", img: "/schemes/lady_skill.png" }


        ],
        services: [
            { title: "181 हेल्पलाइन", dist: "हमेशा चालू", icon: "support_agent", color: "text-pink-600" },
            { title: "स्वास्थ्य केंद्र", dist: "1.2 किमी दूर", icon: "emergency", color: "text-red-500" }
        ],

        specialService: { title: "महिला शक्ति केंद्र", addr: "कम्युनिटी सेंटर, सेक्टर 4", icon: "groups" },
        avatar: "/avatars/lady.png",
        userName: "अंजलि शर्मा"
    },




    students: {
        id: 'students', label: 'विद्यार्थी', themeColor: 'bg-blue-600', lightThemeColor: 'bg-blue-50 text-blue-700',
        hero: { tag: "भविष्य निर्माता", title: "नमस्ते!\nबेहतर सीखें?", desc: "करियर, परीक्षा और कौशल पर अपने साथी के लिए बस एक कॉल करें।" },
        diagnostic: { title: "करियर", uploadTitle: "रिज्यूमे तैयारी", uploadDesc: "AI करियर मेंटरिंग", chatTitle: "परीक्षा सहायता", chatDesc: "अटक गए? हमारे AI विशेषज्ञ से पूछें।" },
        schemes: [
            { title: "शिक्षण अनुदान", desc: "प्रतिभाशाली छात्रों के लिए 100% छूट।", id: "MS-2024", img: "/schemes/student_edu.png" },
            { title: "डिजिटल डिवाइस", desc: "80%+ स्कोर करने पर मुफ्त लैपटॉप।", id: "FL-SCH", img: "/schemes/student_laptop.png" }



        ],
        services: [
            { title: "डिजिटल लाइब्रेरी", dist: "ऑनलाइन", icon: "library_books", color: "text-blue-600" },
            { title: "विद्यालय", dist: "3.5 किमी दूर", icon: "school", color: "text-blue-800" }
        ],

        specialService: { title: "कौशल विकास सेल", addr: "शिक्षा भवन, सेक्टर 2", icon: "history_edu" },
        avatar: "/avatars/student.png",
        userName: "राहुल वर्मा"
    },




    seniors: {
        id: 'seniors', label: 'वरिष्ठ नागरिक', themeColor: 'bg-amber-600', lightThemeColor: 'bg-amber-50 text-amber-700',
        hero: { tag: "बुजुर्ग सहायता", title: "नमस्ते!\nबेहतर जीवन?", desc: "पेंशन, स्वास्थ्य और बुजुर्गों के अधिकारों पर सलाह के लिए बस एक कॉल करें।" },
        diagnostic: { title: "लाभ", uploadTitle: "पेंशन फॉर्म", uploadDesc: "स्थिति जाँचें या आसानी से आवेदन करें", chatTitle: "आसान सहायता", chatDesc: "कानूनी और भावनात्मक समर्थन" },
        schemes: [
            { title: "पेंशन योजना", desc: "60 से अधिक उम्र वालों के लिए ₹2,500 मासिक।", id: "OAPS-24", img: "/schemes/senior_pension.png" },
            { title: "स्वास्थ्य सहायता", desc: "BPL वरिष्ठ नागरिकों के लिए मुफ्त सहायता उपकरण।", id: "VH-SCH", img: "/schemes/senior_medical.png" }



        ],
        services: [
            { title: "14567 हेल्पलाइन", dist: "टोल फ्री", icon: "blind", color: "text-amber-600" },
            { title: "वेलनेस पार्क", dist: "0.5 किमी दूर", icon: "park", color: "text-green-600" }
        ],

        specialService: { title: "सीनियर सिटिजन क्लब", addr: "मेन पार्क, सेक्टर 7", icon: "elderly" },
        avatar: "/avatars/senior.png",
        userName: "शिवनाथ मिश्रा"
    }


};



const CHIPS: Record<SectionType, Array<{ label: string; icon: string; color: string }>> = {
    farmers: [
        { label: 'कीट समस्या रिपोर्ट', icon: 'bug_report', color: 'text-emerald-700' },
        { label: 'मौसम पूर्वानुमान', icon: 'cloud', color: 'text-blue-600' },
        { label: 'सब्सिडी जाँचें', icon: 'fact_check', color: 'text-emerald-600' },
    ],
    ladies: [
        { label: 'स्वास्थ्य सलाह', icon: 'health_and_safety', color: 'text-pink-600' },
        { label: 'ई-पंजीकरण', icon: 'how_to_reg', color: 'text-pink-700' },
        { label: 'हेल्पलाइन 181', icon: 'support_agent', color: 'text-red-600' },
    ],
    students: [
        { label: 'छात्रवृत्ति स्थिति', icon: 'fact_check', color: 'text-blue-600' },
        { label: 'परीक्षा टिप्स', icon: 'school', color: 'text-blue-700' },
        { label: 'करियर गाइड', icon: 'work', color: 'text-indigo-600' },
    ],
    seniors: [
        { label: 'पेंशन जाँच', icon: 'account_balance', color: 'text-amber-700' },
        { label: 'स्वास्थ्य सेवा', icon: 'medical_services', color: 'text-red-600' },
        { label: 'हेल्पलाइन 14567', icon: 'call', color: 'text-amber-600' },
    ],
};

const NEWS: Record<SectionType, Array<{ headline: string; source: string }>> = {
    farmers: [
        { headline: '🌾 खरीफ 2026 के लिए MSP में 8% की बढ़ोतरी, किसानों को बड़ा फायदा', source: 'कृषि मंत्रालय' },
        { headline: '🌧️ मानसून जल्दी आएगा - IMD ने जून 1 की भविष्यवाणी की', source: 'IMD भारत' },
        { headline: '🐛 टिड्डी नियंत्रण के लिए 500 करोड़ रुपये की मंजूरी', source: 'NIPHM' },
        { headline: '💧 नई PM Kisan Drip Irrigation Yojana शुरू - 80% सब्सिडी', source: 'जल शक्ति मंत्रालय' },
        { headline: '🌽 हाइब्रिड बीज पर नई सब्सिडी - रबी सीजन 2026', source: 'ICAR' },
    ],
    ladies: [
        { headline: '👩‍⚕️ सरकारी अस्पतालों में महिलाओं को मुफ्त OPD - UP, MP में लागू', source: 'स्वास्थ्य मंत्रालय' },
        { headline: '💼 महिला उद्यमी लोन पर 2% ब्याज सब्सिडी - PM Mudra Yojana', source: 'MSME मंत्रालय' },
        { headline: '🎓 बालिका शिक्षा योजना: कक्षा 9-12 के लिए ₹1,500/माह stipend', source: 'शिक्षा मंत्रालय' },
        { headline: '🏠 PM Awas Yojana में महिला के नाम पर मकान अनिवार्य', source: 'आवास मंत्रालय' },
        { headline: '🛡️ 181 हेल्पलाइन पर 24 घंटे चैट सुविधा शुरू', source: 'WCD मंत्रालय' },
    ],
    students: [
        { headline: '📚 National Scholarship Portal 2026-27 के आवेदन शुरू - 5 लाख तक', source: 'शिक्षा मंत्रालय' },
        { headline: '💻 PM e-Vidya Yojana: 1 करोड़ छात्रों को मुफ्त टैबलेट', source: 'IT मंत्रालय' },
        { headline: '🎯 CUET 2026 की तारीखें घोषित - May 15 से July 2', source: 'NTA' },
        { headline: '🏆 INSPIRE Scholarship: Science में ₹80,000/वर्ष - Class 11-12', source: 'DST भारत' },
        { headline: '🌐 PM Kaushal Vikas 4.0: AI & Data Science ट्रेनिंग मुफ्त', source: 'MSDE' },
    ],
    seniors: [
        { headline: '👴 वृद्धावस्था पेंशन ₹1,000 से ₹2,500 - नई दरें लागू', source: 'सामाजिक न्याय मंत्रालय' },
        { headline: '🏥 Ayushman Bharat: 70+ उम्र के लिए 5 लाख सालाना इलाज मुफ्त', source: 'NHA' },
        { headline: '🚌 वरिष्ठ नागरिकों के लिए ट्रेन में 50% छूट बहाल - Railway बोर्ड', source: 'Indian Railways' },
        { headline: '📞 14567 हेल्पलाइन अब WhatsApp पर भी उपलब्ध', source: 'Elder Helpline' },
        { headline: '🏠 PM Senior Citizen Housing: Low-cost flats - आवेदन खुले', source: 'आवास मंत्रालय' },
    ],
};

const EXTRA_SCHEMES: Record<SectionType, any[]> = {
    farmers: [
        { title: "PM किसान निधि", desc: "सालाना ₹6,000 की नकद सहायता।", id: "PM-KISAN" },
        { title: "Kisan Credit Card", desc: "खेती के लिए कम ब्याज पर लोन।", id: "KCC-2024" },
        { title: "मृदा स्वास्थ्य", desc: "मिट्टी की उर्वरता जाँच रिपोर्ट।", id: "SH-CARD" },
        { title: "PM फसल बीमा", desc: "प्राकृतिक आपदा से फसल सुरक्षा।", id: "PMFBY-24" }
    ],
    ladies: [
        { title: "सुकन्या समृद्धि", desc: "बेटियों के भविष्य के लिए उच्च ब्याज बचत।", id: "SSY-GOLD" },
        { title: "सिलाई मशीन योजना", desc: "मुफ्त सिलाई मशीन हेतु अनुदान।", id: "FSM-SCH" },
        { title: "महिला बचत पत्र", desc: "स्थिर आय और बचत के लिए प्रमाण पत्र।", id: "MSSC-24" },
        { title: "लाडली बहना योजना", desc: "मासिक आर्थिक सहायता ₹1,250।", id: "LBY-2024" }
    ],
    students: [
        { title: "राष्ट्रीय छात्रवृत्ति", desc: "मेधावी छात्रों के लिए सरकारी स्कॉलरशिप।", id: "NSP-PRO" },
        { title: "SWAYAM कोर्स फ्री", desc: "AI और स्किल कोर्सेज पर मुफ्त प्रमाणपत्र।", id: "SWAY-24" },
        { title: "स्टूडेंट क्रेडिट कार्ड", desc: "उच्च शिक्षा हेतु आसान ऋण सुविधा।", id: "SCC-SCH" },
        { title: "PM-USHA ग्रांट", desc: "विश्वविद्यालय शोध हेतु वित्तीय मदद।", id: "USHA-24" }
    ],
    seniors: [
        { title: "वयो वंदना योजना", desc: "सुनिश्चित मासिक रिटर्न पेंशन प्लान।", id: "PMVVY-24" },
        { title: "SCSS बचत खाता", desc: "वरिष्ठ नागरिकों के लिए विशेष निवेश योजना।", id: "SCSS-PRO" },
        { title: "रेलवे/बस छूट", desc: "यात्रा किराए में सरकारी रियायत सुविधा।", id: "TC-SEN" },
        { title: "इंदिरा गांधी पेंशन", desc: "निराश्रित बुजुर्गों के लिए मासिक पेंशन।", id: "IGNP-24" }
    ]
};

interface Step {
    id: number;
    time: string;
    status: string;
    title: string;
    detail: string;
    dotColor: string;
    dotHover: string;
    cardBorder: string;
    titleColor: string;
    lightBg: string;
    lightText: string;
    outline: string;
    isNew?: boolean;
    due?: string;
    dotBorder?: string;
}

const ROADMAPS: Record<SectionType, { title: string; desc: string; status: string; summaryIcon: string; summaryLabel: string; summaryTitle: string; summaryValueLabel: string; summaryValue: string; steps: Step[] }> = {
    farmers: {
        title: "फसल सफलता रोडमैप",
        desc: "एग्रीकल्चर प्लान (Agri-Plan)",
        status: "Currently Active",
        summaryIcon: "potted_plant",
        summaryLabel: "अगली फसल",
        summaryTitle: "गेहूं की बुवाई (Wheat)",
        summaryValueLabel: "अनुमानित लाभ",
        summaryValue: "₹1.2 लाख/एकड़",
        steps: [
            { id: 0, time: "वर्तमान", status: "Active", title: "मिट्टी परीक्षण", detail: "नाइट्रोजन की कमी पाई गई। यूरिया का छिड़काव करें।",
              dotColor: "bg-emerald-500", dotHover: "hover:border-emerald-400", cardBorder: "border-l-emerald-500", titleColor: "text-emerald-600", lightBg: "bg-emerald-50", lightText: "text-emerald-700", outline: "border-emerald-100", dotBorder: "border-emerald-200" },
            { id: 1, time: "अगला कदम", status: "ट्रेनिंग", title: "PM Kaushal Vikas Training", detail: "30 दिन का निःशुल्क कोर्स और प्रमाणपत्र।",
              dotColor: "bg-green-500", dotHover: "hover:border-green-400", cardBorder: "border-l-green-500", titleColor: "text-green-600", lightBg: "bg-green-50", lightText: "text-green-700", outline: "border-green-100", dotBorder: "border-green-200" },
            { id: 2, time: "त्योहारी सीजन", status: "लोन", title: "Mudra Yojana Loan", detail: "मशीन खरीदने के लिए 50,000 रुपये तक का लोन।",
              dotColor: "bg-rose-500", dotHover: "hover:border-rose-400", cardBorder: "border-l-rose-500", titleColor: "text-rose-600", lightBg: "bg-rose-50", lightText: "text-rose-700", outline: "border-rose-100", dotBorder: "border-rose-200" },
        ]
    },
    ladies: {
        title: "कौशल विकास रोडमैप",
        desc: "स्वयं सहायता समूह (SHG)",
        status: "Member Since 2023",
        summaryIcon: "woman_2",
        summaryLabel: "नया कौशल",
        summaryTitle: "डिज지털 साक्षरता (ITC)",
        summaryValueLabel: "मासिक बचत",
        summaryValue: "₹4,500/माह",
        steps: [
            { id: 0, time: "वर्तमान", status: "पंजीकृत", title: "SHG पंजीकरण", detail: "समूह 'उन्नति' में आपका नाम जोड़ा गया है।",
              dotColor: "bg-pink-500", dotHover: "hover:border-pink-400", cardBorder: "border-l-pink-500", titleColor: "text-pink-600", lightBg: "bg-pink-50", lightText: "text-pink-700", outline: "border-pink-100", dotBorder: "border-pink-200" },
            { id: 1, time: "प्रशिक्षण", status: "आगामी", title: "सिलाई मशीन ट्रेनिंग", detail: "प्रधानमंत्री विश्वकर्मा योजना के तहत प्रशिक्षण शुरू होगा।",
              dotColor: "bg-purple-500", dotHover: "hover:border-purple-400", cardBorder: "border-l-purple-500", titleColor: "text-purple-600", lightBg: "bg-purple-50", lightText: "text-purple-700", outline: "border-purple-100", dotBorder: "border-purple-200" },
            { id: 2, time: "ऋण सहायता", status: "पात्र", title: "Lakhpati Didi Loan", detail: "व्यवसाय शुरू करने के लिए ब्याज मुक्त ऋण आवेदन।",
              dotColor: "bg-indigo-500", dotHover: "hover:border-indigo-400", cardBorder: "border-l-indigo-500", titleColor: "text-indigo-600", lightBg: "bg-indigo-50", lightText: "text-indigo-700", outline: "border-indigo-100", dotBorder: "border-indigo-200" },
        ]
    },
    students: {
        title: "शिक्षा और करियर रोडमैप",
        desc: "भविष्य की तैयारी (Career Ready)",
        status: "Academic Year 2026",
        summaryIcon: "school",
        summaryLabel: "अगली परीक्षा",
        summaryTitle: "SSC/Bank/Railway",
        summaryValueLabel: "कोर्स प्रोग्रेस",
        summaryValue: "72% पूर्ण",
        steps: [
            { id: 0, time: "वर्तमान", status: "अध्ययनरत", title: "कक्षा 12वीं / स्नातक", detail: "लक्ष्य: 85% से अधिक अंक प्राप्त करना।",
              dotColor: "bg-blue-500", dotHover: "hover:border-blue-400", cardBorder: "border-l-blue-500", titleColor: "text-blue-600", lightBg: "bg-blue-50", lightText: "text-blue-700", outline: "border-blue-100", dotBorder: "border-blue-200" },
            { id: 1, time: "अगला कदम", status: "छात्रवृत्ति", title: "National Scholarship Portal", detail: "आवेदन शुरू: 5 लाख तक की सहायता के लिए रजिस्टर करें।",
              dotColor: "bg-indigo-500", dotHover: "hover:border-indigo-400", cardBorder: "border-l-indigo-500", titleColor: "text-indigo-600", lightBg: "bg-indigo-50", lightText: "text-indigo-700", outline: "border-indigo-100", dotBorder: "border-indigo-200" },
            { id: 2, time: "कौशल", status: "नया कोर्स", title: "AI & Data Science Course", detail: "PM Kaushal Vikas 4.0 के तहत मुफ्त ट्रेनिंग शुरू करें।",
              dotColor: "bg-purple-500", dotHover: "hover:border-purple-400", cardBorder: "border-l-purple-500", titleColor: "text-purple-600", lightBg: "bg-purple-50", lightText: "text-purple-700", outline: "border-purple-100", dotBorder: "border-purple-200" },
        ]
    },
    seniors: {
        title: "सुखद जीवन रोडमैप",
        desc: "कल्याण और सुरक्षा (Welfare)",
        status: "Benefits Plan Active",
        summaryIcon: "elderly",
        summaryLabel: "पेंशन स्थिति",
        summaryTitle: "OAPS स्वीकृत",
        summaryValueLabel: "मासिक सहायता",
        summaryValue: "₹2,500/माह",
        steps: [
            { id: 0, time: "वर्तमान", status: "पंजीकृत", title: "पेंशन योजना (OAPS)", detail: "मासिक सहायता: ₹2,500 प्राप्त हो रही है।",
              dotColor: "bg-amber-500", dotHover: "hover:border-amber-400", cardBorder: "border-l-amber-500", titleColor: "text-amber-600", lightBg: "bg-amber-50", lightText: "text-amber-700", outline: "border-amber-100", dotBorder: "border-amber-200" },
            { id: 1, time: "स्वास्थ्य", status: "सक्रिय", title: "Ayushman Bharat Gold Card", detail: "5 लाख तक का मुफ्त इलाज किसी भी पैनल अस्पताल में।",
              dotColor: "bg-red-500", dotHover: "hover:border-red-400", cardBorder: "border-l-red-500", titleColor: "text-red-600", lightBg: "bg-red-50", lightText: "text-red-700", outline: "border-red-100", dotBorder: "border-red-200" },
            { id: 2, time: "सुविधा", status: "उपलब्ध", title: "Senior Citizen Housing", detail: "लो-कॉस्ट फ्लैट्स के लिए आवेदन प्रक्रिया की जानकारी लें।",
              dotColor: "bg-orange-500", dotHover: "hover:border-orange-400", cardBorder: "border-l-orange-500", titleColor: "text-orange-600", lightBg: "bg-orange-50", lightText: "text-orange-700", outline: "border-orange-100", dotBorder: "border-orange-200" },
        ]
    }
};

function WeatherPanel({ themeColor }: { themeColor: string }) {
    return (
        <section className={`mt-2 mb-6 rounded-[2rem] overflow-hidden shadow-sm relative text-white ${themeColor} animate-in fade-in duration-500`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
            <div className="p-5 flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 opacity-90 mb-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span className="text-[11px] font-bold tracking-widest uppercase">लखनऊ, उत्तर प्रदेश</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black tracking-tighter">32°</span>
                        <span className="text-sm font-medium pb-1.5 opacity-90">C</span>
                    </div>
                    <span className="text-xs font-medium mt-1">आंशिक बादल (Partly Cloudy)</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="material-symbols-outlined text-[48px] drop-shadow-lg" style={{ fontVariationSettings: "'FILL' 1" }}>partly_cloudy_day</span>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] opacity-80">water_drop</span>
                            <span className="text-[10px] font-bold">45%</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] opacity-80">air</span>
                            <span className="text-[10px] font-bold">12 km/h</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function RoadmapSection({ section, themeColor, onOpenAI }: { section: SectionType; themeColor: string; onOpenAI: () => void }) {
    const data = ROADMAPS[section];
    
    return (
        <section className="space-y-6 pb-4 animate-in fade-in duration-500">
            {/* Roadmap Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${themeColor} text-white flex items-center justify-center shadow-md`}>
                        <span className="material-symbols-outlined text-xl">map</span>
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-on-surface leading-tight">{data.title}</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{data.desc}</p>
                            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                            <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">{data.status}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Summary Card */}
            <div className="p-6 bg-surface-container-lowest rounded-[2rem] shadow-[0_-8px_32px_rgba(25,28,30,0.04)] border border-outline-variant/10">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full ${themeColor} flex items-center justify-center text-white shadow-inner`}>
                        <span className="material-symbols-outlined text-2xl">{data.summaryIcon}</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant opacity-60">{data.summaryLabel}</p>
                        <h2 className="text-lg font-black text-on-surface leading-tight">{data.summaryTitle}</h2>
                    </div>
                </div>
                <div className="flex justify-between items-center py-3.5 px-5 bg-surface-container-low rounded-2xl border border-outline-variant/5">
                    <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{data.summaryValueLabel}</span>
                    <span className={`text-base font-black ${themeColor.replace('bg-', 'text-')}`}>{data.summaryValue}</span>
                </div>
            </div>

            {/* Vertical Timeline Roadmap */}
            <div className="relative pl-8 space-y-12">
                {/* Timeline Line */}
                <div className="absolute left-[11px] top-4 bottom-6 w-[2px] bg-outline-variant/20"></div>

                {data.steps.map((step: any, i: number) => (
                    <div key={i} className="relative group">
                        {/* Circle Mark */}
                        <div className={`absolute -left-[25px] top-1.5 w-5 h-5 rounded-full ${step.dotColor} border-[3.5px] ${step.dotBorder || 'border-white'} z-10 shadow-sm group-hover:scale-110 transition-transform`}></div>

                        <div className={`bg-surface-container-lowest p-5 rounded-[1.8rem] border-l-[5px] ${step.cardBorder} shadow-sm border border-outline-variant/10 hover:shadow-md transition-all`}>
                            <div className="flex justify-between items-start mb-2.5">
                                <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${step.titleColor}`}>{step.time}</span>
                                {step.status === 'Active' || step.status === 'Completed' ? (
                                    <span className={`material-symbols-outlined ${step.titleColor} text-[18px]`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                ) : step.isNew ? (
                                    <div className={`px-2 py-0.5 ${step.lightBg} rounded-full border ${step.outline}`}>
                                        <span className={`text-[8px] font-black ${step.lightText} tracking-tighter`}>NEW</span>
                                    </div>
                                ) : null}
                            </div>

                            <h3 className="text-sm font-black text-on-surface mb-1.5">{step.title}</h3>
                            <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed opacity-80">{step.detail}</p>

                            {step.status === 'Recommended' && (
                                <button className={`mt-4 w-full py-3 ${themeColor} text-white rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform shadow-md hover:shadow-lg`}>
                                    Apply Now
                                </button>
                            )}

                            {step.due && (
                                <div className="mt-3.5 flex items-center gap-2 text-on-surface-variant text-[10px] font-bold opacity-60">
                                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                    {step.due}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom CTAs */}
            <div className="space-y-4 pt-4">
                <button className={`w-full h-14 ${themeColor} text-white rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl hover:shadow-2xl`}>
                    <span>Vistar se Jane</span>
                    <span className="text-[10px] font-medium opacity-70 italic">(Full Strategy)</span>
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>

                <button 
                    onClick={onOpenAI}
                    className="w-full h-14 bg-white text-on-surface rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all shadow-md border border-outline-variant/20 hover:bg-slate-50"
                >
                    <span className={`material-symbols-outlined text-2xl ${themeColor.replace('bg-', 'text-')}`}>mic</span>
                    <span className="text-sm tracking-tight uppercase tracking-wider">Ask AI for another Roadmap</span>
                </button>
            </div>
        </section>
    );
}

function SchemeSelectionOverlay({ section, onClose, onSelect, themeColor, lightThemeColor }: { section: SectionType; onClose: () => void; onSelect: (name: string) => void; themeColor: string; lightThemeColor: string }) {
    const list = EXTRA_SCHEMES[section];

    return (
        <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-[510] bg-surface flex flex-col font-body animate-in slide-in-from-bottom duration-500 overflow-hidden shadow-2xl">
            {/* Header */}
            <header className={`px-6 py-5 flex items-center justify-between border-b border-outline-variant/10 shadow-sm bg-white`}>
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors active:scale-90">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div>
                        <h3 className="font-black text-on-surface text-base">खोजे गए फॉर्म्स (More Forms)</h3>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{section} - AI Discovery</p>
                    </div>
                </div>
                <div className={`w-10 h-10 rounded-2xl ${themeColor} text-white flex items-center justify-center shadow-md animate-bounce`}>
                    <span className="material-symbols-outlined text-xl">magical_exchange</span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container-lowest no-scrollbar">
                <div className="grid grid-cols-1 gap-4">
                    {list.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => onSelect(item.title)}
                            className="group bg-white p-5 rounded-3xl shadow-sm border border-outline-variant/20 flex items-center gap-4 active:scale-95 transition-all cursor-pointer hover:shadow-lg hover:border-primary/20"
                        >
                            <div className={`w-16 h-16 rounded-2xl ${lightThemeColor} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                                <span className={`material-symbols-outlined text-3xl ${themeColor.replace('bg-', 'text-')}`}>description</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-black text-sm text-on-surface mb-0.5 truncate">{item.title}</h4>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${themeColor} text-white`}>{item.id}</span>
                                </div>
                                <p className="text-[11px] text-on-surface-variant font-medium line-clamp-2 leading-relaxed opacity-80">{item.desc}</p>
                                <div className="mt-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${themeColor.replace('bg-', 'text-')}`}>आवेदन शुरू करें (Apply)</span>
                                    <span className={`material-symbols-outlined text-sm ${themeColor.replace('bg-', 'text-')}`}>arrow_right_alt</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`mt-10 p-6 rounded-[2rem] border border-dashed border-outline-variant text-center space-y-3 ${lightThemeColor}/30`}>
                    <span className="material-symbols-outlined text-4xl text-outline-variant">contact_emergency</span>
                    <p className="text-[11px] font-bold text-on-surface-variant leading-relaxed">AI द्वारा ये फॉर्म आपकी आवश्यकताओं के अनुसार सुझाए गए हैं। आप किसी भी फॉर्म पर क्लिक करके तुरंत वॉइस आवेदन शुरू कर सकते हैं।</p>
                </div>
            </main>
        </div>
    );
}

function VoiceSearchOverlay({ section, onFinish, themeColor }: { section: SectionType; onFinish: () => void; themeColor: string }) {
    const [status, setStatus] = useState('सुन रहा हूँ...');

    useEffect(() => {
        const sequence = [
            { t: 0, s: 'सुन रहा हूँ... (Listening)' },
            { t: 1500, s: 'प्रोसेस कर रहा हूँ... (Analyzing)' },
            { t: 3000, s: 'योजनाएँ ढूँढ रहा हूँ... (Fetching)' }
        ];

        sequence.forEach(step => {
            setTimeout(() => setStatus(step.s), step.t);
        });

        setTimeout(onFinish, 4500);
    }, [onFinish]);

    return (
        <div className="fixed inset-0 z-[520] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
            <div className="relative mb-12">
                <div className={`absolute inset-0 rounded-full ${themeColor} opacity-20 animate-ping`}></div>
                <div className={`relative z-10 w-40 h-40 rounded-full ${themeColor} flex flex-col items-center justify-center shadow-2xl border-4 border-white/30`}>
                    <span className="material-symbols-outlined text-7xl text-white animate-pulse">mic</span>
                </div>
            </div>
            <div className="space-y-3">
                <h3 className="text-3xl font-black text-white tracking-tight">{status}</h3>
                <p className="text-white/60 text-sm font-bold uppercase tracking-[0.2em]">{section} पोर्टल खोज</p>
            </div>
        </div>
    );
}

function RoadmapCounselOverlay({ onClose, section, themeColor, lightThemeColor }: { onClose: () => void; section: SectionType; themeColor: string; lightThemeColor: string }) {


    const [isListening, setIsListening] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const roadmap = ROADMAPS[section];

    return (
        <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-[500] bg-white flex flex-col font-body animate-in slide-in-from-bottom duration-500">
            {/* Header */}
            <header className={`px-6 py-5 flex items-center justify-between border-b border-outline-variant/10 shadow-sm bg-surface-container-lowest`}>
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors active:scale-90">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div>
                        <h3 className="font-black text-on-surface text-base">AI Roadmap Counsel</h3>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Personalized AI Mentor</p>
                    </div>
                </div>
                <div className={`w-10 h-10 rounded-2xl ${themeColor} text-white flex items-center justify-center shadow-md animate-pulse`}>
                    <span className="material-symbols-outlined text-xl">auto_awesome</span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-surface-container-lowest">
                {!showResults ? (
                    <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-10">
                        <div className="relative">
                            <div className={`absolute inset-0 rounded-full ${themeColor} opacity-20 animate-ping`}></div>
                            <div className={`relative z-10 w-32 h-32 rounded-full ${themeColor} flex items-center justify-center shadow-2xl`}>
                                <span className={`material-symbols-outlined text-6xl text-white ${isListening ? 'animate-pulse' : ''}`}>{isListening ? 'graphic_eq' : 'mic'}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-on-surface tracking-tight leading-tight">नमस्ते! मैं आपका AI कोच हूँ।</h2>
                            <p className="text-on-surface-variant text-sm font-medium leading-relaxed italic opacity-80">
                                "{section === 'farmers' ? 'अपनी ज़मीन और फसल के बारे में पूछें' : section === 'ladies' ? 'अपने व्यवसाय या कौशल विकास के बारे में पूछें' : section === 'students' ? 'अपने करियर या परीक्षा की तैयारी पर चर्चा करें' : 'स्वास्थ्य और पेंशन लाभ पर सलाह लें'}"
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setIsListening(true);
                                setTimeout(() => {
                                    setIsListening(false);
                                    setShowResults(true);
                                }, 2500);
                            }}
                            className={`px-8 py-4 rounded-3xl ${themeColor} text-white font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3`}
                        >
                            {isListening ? 'सुन रहा हूँ...' : 'मुझसे बात करें'}
                        </button>
                    </div>
                ) : (
                    <div className="p-6 pb-20 space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
                        <div className={`${lightThemeColor} p-5 rounded-[2rem] border border-outline-variant/10 shadow-sm space-y-2`}>
                            <h4 className="font-black text-lg leading-tight">आपका कस्टमाइज़्ड प्लान तैयार है 🎯</h4>
                            <p className="text-xs font-semibold opacity-90 leading-relaxed">आपके द्वारा दी गई जानकारी के आधार पर, यह आपका भविष्य का रोडमैप है।</p>
                        </div>

                        <div className="relative pl-8 space-y-12 before:content-[''] before:absolute before:left-[11px] before:top-4 before:bottom-6 before:w-[3px] before:bg-gradient-to-b before:from-primary before:via-primary/50 before:to-transparent">
                            {roadmap.steps.map((step: any, i: number) => (
                                <div key={i} className="relative group">
                                    {/* Circle Mark */}
                                    <div className={`absolute -left-[30px] top-1.5 w-6 h-6 rounded-full bg-white border-[6px] ${step.dotColor} z-10 shadow-md group-hover:scale-125 transition-transform`}></div>

                                    <div className={`bg-white p-5 rounded-[1.5rem] shadow-sm border border-outline-variant/20 hover:shadow-xl transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1`}>
                                        <div className={`absolute top-0 right-0 w-24 h-24 ${step.lightBg} opacity-20 rounded-full blur-3xl -translate-y-10 translate-x-10`}></div>

                                        <div className="flex items-center justify-between mb-3 relative z-10">
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-black ${step.titleColor} uppercase tracking-widest`}>{step.time}</span>
                                                <h4 className="text-base font-black text-on-surface mt-0.5">{step.title}</h4>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${step.lightBg} ${step.lightText} border ${step.outline}`}>
                                                {step.status}
                                            </span>
                                        </div>

                                        <p className="text-[12px] text-on-surface-variant font-medium leading-[1.6] relative z-10">
                                            {step.detail}
                                        </p>

                                        <div className="mt-4 pt-4 border-t border-outline-variant/10 flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[16px] text-on-surface-variant/40">info</span>
                                                <span className="text-[10px] font-bold text-on-surface-variant/60">More details available</span>
                                            </div>
                                            <button className={`text-[10px] font-black uppercase tracking-widest ${step.titleColor} flex items-center gap-1`}>
                                                जानें <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-surface-container-highest/30 p-6 rounded-3xl border border-dashed border-outline-variant text-center space-y-3">
                            <span className="material-symbols-outlined text-4xl text-outline-variant">contact_support</span>
                            <p className="text-[11px] font-bold text-on-surface-variant leading-relaxed">रोडमैप में कोई संशय होने पर आप कभी भी सलाहकार (AI Counselor) से दोबारा बात कर सकते हैं।</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Controls */}
            {showResults && (
                <footer className="p-5 border-t border-outline-variant/10 bg-white">
                    <button
                        onClick={() => setShowResults(false)}
                        className={`w-full py-4 rounded-2xl ${themeColor} text-white font-black text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3`}
                    >
                        <span className="material-symbols-outlined">restart_alt</span>
                        <span>दोबारा पूछें (Retry)</span>
                    </button>
                </footer>
            )}
        </div>
    );
}


function NewsSection({ section, themeColor, lightThemeColor }: { section: SectionType; themeColor: string; lightThemeColor: string }) {
    const news = NEWS[section];
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleVoiceSummary = () => {
        if (!window.speechSynthesis) {
            alert("आपका ब्राउज़र AI आवाज़ को सपोर्ट नहीं करता है।");
            return;
        }

        if (isSpeaking || window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        // Clean text for cleaner speech (remove emojis)
        const summaryText = news.slice(0, 3).map((n, i) => `${i + 1}. ${n.headline.replace(/[^\u0000-\u007F\u0900-\u097F\s.,?!]/gu, '')}`).join('. ');
        const fullText = `नमस्ते, यहाँ आज की ताज़ा खबरें हैं: ${summaryText}`;

        const utterance = new SpeechSynthesisUtterance(fullText);
        const voices = window.speechSynthesis.getVoices();

        // Find best Hindi voice (more robust selection)
        const hindiVoice = voices.find(v => v.lang.startsWith('hi-IN')) ||
            voices.find(v => v.lang.startsWith('hi')) ||
            voices.find(v => v.name.toLowerCase().includes('hindi'));

        if (hindiVoice) utterance.voice = hindiVoice;
        utterance.lang = 'hi-IN';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("Speech error:", e);
            if (e.error !== 'interrupted') {
                setIsSpeaking(false);
            }
        };

        // Reset and wait slightly (important for browsers to avoid 'interrupted' error)
        window.speechSynthesis.cancel();

        setTimeout(() => {
            if (window.speechSynthesis.speaking) {
                // If it's STILL speaking after our cancel, wait or skip to avoid interrupted error
                return;
            }
            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
        }, 300); // Increased delay

    };





    // Build concatenated marquee string (repeated for seamless loop)
    const ticker = news.map(n => `${n.headline}  •  `).join('  ');

    return (
        <section className="space-y-0">
            {/* Section title row */}
            <div className="flex items-center justify-between mb-3">
                <h3 className={`font-bold text-xl transition-colors duration-500 ${themeColor.replace('bg-', 'text-')}`}>ताज़ा खबरें</h3>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${lightThemeColor}`}>LIVE</span>
            </div>

            {/* News card */}
            <div className={`relative rounded-3xl overflow-hidden border border-outline-variant/15 shadow-sm bg-white`}>
                {/* Colored top strip */}
                <div className={`${themeColor} h-1.5 w-full`} />

                {/* Marquee ticker */}
                <div className="flex items-center gap-0 overflow-hidden py-3 px-0">
                    {/* Source badge */}
                    <div className={`shrink-0 flex items-center gap-1.5 ${lightThemeColor} px-4 py-1 mr-3 border-r border-outline-variant/20`}>
                        <span className={`material-symbols-outlined text-[16px] ${themeColor.replace('bg-', 'text-')}`} style={{ fontVariationSettings: "'FILL' 1" }}>newspaper</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${themeColor.replace('bg-', 'text-')} whitespace-nowrap`}>न्यूज़</span>
                    </div>

                    {/* Scrolling text */}
                    <div className="flex-1 overflow-hidden">
                        <div
                            className="flex whitespace-nowrap animate-[marquee_28s_linear_infinite] hover:pause-animation"
                            style={{ animation: 'marquee 28s linear infinite' }}
                        >
                            <span className="text-[12px] font-semibold text-on-surface pr-12">{ticker}{ticker}</span>
                        </div>
                    </div>

                    {/* AI Voice Summary button */}
                    <button
                        onClick={handleVoiceSummary}
                        className={`shrink-0 ml-2 mr-3 flex items-center gap-1 ${isSpeaking ? 'bg-red-500 text-white' : `${themeColor} text-white`} px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-sm hover:scale-105 active:scale-95 transition-all`}
                    >
                        <span className={`material-symbols-outlined text-[16px] ${isSpeaking ? 'animate-pulse' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            {isSpeaking ? 'stop_circle' : 'spatial_audio_off'}
                        </span>
                        <span className="hidden sm:inline">{isSpeaking ? 'रोकें' : 'AI सुनें'}</span>
                    </button>
                </div>

                {/* Stacked news items list */}
                <div className="divide-y divide-outline-variant/10 px-4 pb-3">
                    {news.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-start gap-3 py-3 group cursor-pointer">
                            <div className={`mt-0.5 w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black ${lightThemeColor}`}>{i + 1}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-semibold text-on-surface leading-snug line-clamp-2">{item.headline}</p>
                                <p className={`text-[10px] font-bold mt-0.5 ${themeColor.replace('bg-', 'text-')} opacity-75`}>{item.source}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </section>
    );
}

function VoiceFormOverlay({ formName, onClose, themeColor }: { formName: string; onClose: () => void; themeColor: string }) {
    const [fields, setFields] = useState<Record<string, string>>({
        name: '', aadhaar: '', address: '', bank: ''
    });
    const [step, setStep] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [aiStatus, setAiStatus] = useState('नमस्ते! मैं आपका फॉर्म भर रहा हूँ। आपका नाम क्या है? (Mic पर टैप करें)');

    // Simulate user "speaking" into the mic to answer the current question
    const handleMicClick = () => {
        if (isListening || step > 3) return;
        setIsListening(true);
        setAiStatus('सुन रहा हूँ... 🎙️');

        setTimeout(() => {
            setIsListening(false);
            if (step === 0) {
                setFields(p => ({ ...p, name: 'अंजलि शर्मा' }));
                setAiStatus('धन्यवाद। अपना आधार नंबर बताएँ। (Mic पर टैप करें)');
                setStep(1);
            } else if (step === 1) {
                setFields(p => ({ ...p, aadhaar: 'XXXX-XXXX-1234' }));
                setAiStatus('आपका पता? (Mic पर टैप करें)');
                setStep(2);
            } else if (step === 2) {
                setFields(p => ({ ...p, address: 'लखनऊ, उत्तर प्रदेश' }));
                setAiStatus('बैंक खाता संख्या? (Mic पर टैप करें)');
                setStep(3);
            } else if (step === 3) {
                setFields(p => ({ ...p, bank: 'SBI-0000000123' }));
                setAiStatus('✅ सभी विवरण भर दिए गए हैं। अब आप फॉर्म सबमिट कर सकते हैं!');
                setStep(4);
            }
        }, 1500);
    };

    const isComplete = step > 3;

    return (
        <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-[300] bg-surface flex flex-col font-body animate-in slide-in-from-bottom duration-300 shadow-2xl border-x border-outline-variant/20">
            {/* Header */}
            <header className={`px-4 py-4 ${themeColor} text-white flex justify-between items-center shadow-md pb-6 rounded-b-[2rem]`}>
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors active:scale-90">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">{formName}</h2>
                        <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">वॉइस एप्लीकेशन (Voice Application)</span>
                    </div>
                </div>
            </header>

            {/* Form Fields */}
            <main className="flex-1 p-6 space-y-6 overflow-y-auto bg-surface-container-lowest -mt-4 relative z-10 rounded-t-[2rem]">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/10 space-y-5">
                    {/* name */}
                    <div>
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">पूरा नाम (Full Name)</label>
                        <div className={`mt-1.5 p-3.5 rounded-xl border-2 transition-all duration-500 ${fields.name ? `${themeColor.replace('bg-', 'border-')} bg-white text-on-surface font-semibold shadow-sm` : 'border-outline-variant/30 text-slate-400 bg-surface-container-lowest'}`}>
                            {fields.name || 'AI is listening...'}
                        </div>
                    </div>
                    {/* aadhaar */}
                    <div>
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">आधार नंबर (Aadhaar)</label>
                        <div className={`mt-1.5 p-3.5 rounded-xl border-2 transition-all duration-500 ${fields.aadhaar ? `${themeColor.replace('bg-', 'border-')} bg-white text-on-surface font-semibold shadow-sm` : 'border-outline-variant/30 text-slate-400 bg-surface-container-lowest'}`}>
                            {fields.aadhaar || 'AI is listening...'}
                        </div>
                    </div>
                    {/* address */}
                    <div>
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">पता (Address)</label>
                        <div className={`mt-1.5 p-3.5 rounded-xl border-2 transition-all duration-500 ${fields.address ? `${themeColor.replace('bg-', 'border-')} bg-white text-on-surface font-semibold shadow-sm` : 'border-outline-variant/30 text-slate-400 bg-surface-container-lowest'}`}>
                            {fields.address || 'AI is listening...'}
                        </div>
                    </div>
                    {/* bank */}
                    <div>
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">बैंक खाता (Bank Account)</label>
                        <div className={`mt-1.5 p-3.5 rounded-xl border-2 transition-all duration-500 ${fields.bank ? `${themeColor.replace('bg-', 'border-')} bg-white text-on-surface font-semibold shadow-sm` : 'border-outline-variant/30 text-slate-400 bg-surface-container-lowest'}`}>
                            {fields.bank || 'AI is listening...'}
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className={`w-full py-4 rounded-full text-white font-extrabold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 ${isComplete ? themeColor : 'bg-slate-300 pointer-events-none'}`}
                >
                    सबमिट करें (Submit)
                </button>
            </main>

            {/* AI Assistant Banner */}
            <div className="bg-surface-container-high p-6 border-t border-outline-variant/20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative flex flex-col items-center">
                <button
                    onClick={handleMicClick}
                    disabled={isComplete || isListening}
                    className={`absolute -top-7 w-16 h-16 bg-white rounded-full shadow-xl border-4 border-surface flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${isListening ? `ring-4 ${themeColor.replace('bg-', 'ring-')}/40 animate-pulse` : isComplete ? 'cursor-default' : 'cursor-pointer hover:shadow-2xl'}`}
                >
                    <span className={`material-symbols-outlined text-3xl transition-colors duration-500 ${isComplete ? 'text-green-500' : isListening ? themeColor.replace('bg-', 'text-') : 'text-primary'}`}>
                        {isComplete ? 'check_circle' : isListening ? 'graphic_eq' : 'mic'}
                    </span>
                </button>
                <div className="mt-4 text-center">
                    <p className={`text-xs font-black uppercase tracking-widest mb-1 ${themeColor.replace('bg-', 'text-')}`}>AI Voice Assistant</p>
                    <p className="text-sm font-bold text-on-surface-variant animate-pulse">{aiStatus}</p>
                </div>
            </div>
        </div>
    );
}

function ProfileViewOverlay({ onClose, themeColor, lightThemeColor, avatar, userName }: { onClose: () => void; themeColor: string; lightThemeColor: string; avatar: string; userName: string; }) {


    return (
        <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-[400] bg-[#f9fafb] flex flex-col font-body animate-in slide-in-from-right duration-300 shadow-2xl border-x border-outline-variant/20">
            {/* Header */}
            <header className={`px-6 pt-6 pb-10 ${lightThemeColor} shadow-sm relative overflow-hidden rounded-b-[2.5rem] border-b border-outline-variant/10`}>
                <button onClick={onClose} className="absolute top-4 left-4 p-2 rounded-full hover:bg-black/5 transition-colors active:scale-90">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex flex-col items-center mt-4 z-10 relative">
                    {/* 2D Avatar SVG */}
                    <div className="w-28 h-28 mb-3 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                        <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                    </div>

                    <h2 className="text-2xl font-black tracking-tight text-on-surface">{userName}</h2>

                    <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`material-symbols-outlined text-[15px] ${themeColor.replace('bg-', 'text-')}`} style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        <p className={`text-xs font-bold uppercase tracking-widest ${themeColor.replace('bg-', 'text-')}`}>KYC Verified</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-5 py-6 space-y-6 bg-[#f9fafb]">

                {/* OTR Panel */}
                <section className="bg-white rounded-3xl shadow-sm border border-outline-variant/15 overflow-hidden">
                    <div className={`px-5 py-4 ${lightThemeColor} flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined text-[22px] ${themeColor.replace('bg-', 'text-')}`} style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
                            <h3 className="font-black text-base text-on-surface">One Time Registration</h3>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${themeColor} text-white`}>OTR</span>
                    </div>
                    <div className="px-5 py-4 space-y-4">
                        <p className="text-[12px] text-on-surface-variant leading-relaxed">
                            <span className="font-bold text-on-surface">OTR (One Time Registration)</span> is a government initiative that lets you register your core details - Aadhaar, address, bank account - just <span className="font-bold text-on-surface">once</span>. The AI then auto-fills these into any future scheme application, saving time and eliminating paperwork.
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            {([{ icon: 'lock', label: 'Secure Vault', color: 'text-indigo-500' }, { icon: 'bolt', label: 'Instant Fill', color: 'text-amber-500' }, { icon: 'fact_check', label: 'Error-Free', color: 'text-green-500' }] as const).map(b => (
                                <div key={b.label} className={`${lightThemeColor} rounded-2xl py-3 flex flex-col items-center gap-1`}>
                                    <span className={`material-symbols-outlined text-[22px] ${b.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
                                    <span className="text-[10px] font-black text-on-surface">{b.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-2xl border border-outline-variant/20 bg-[#f9fafb]">
                            <div>
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">OTR ID / UIN</p>
                                <p className="font-mono font-black text-on-surface text-base">UP-8291-XXXX</p>
                            </div>
                            <button className={`${lightThemeColor} p-2 rounded-xl active:scale-95 transition-transform`}>
                                <span className={`material-symbols-outlined text-[18px] ${themeColor.replace('bg-', 'text-')}`}>qr_code_2</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Past Conversations Log Panel */}
                <section className="bg-white rounded-3xl shadow-sm border border-outline-variant/15 overflow-hidden">
                    <div className={`px-5 py-4 ${lightThemeColor} flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined text-[22px] ${themeColor.replace('bg-', 'text-')}`} style={{ fontVariationSettings: "'FILL' 1" }}>history_edu</span>
                            <h3 className="font-black text-base text-on-surface">Past Conversations</h3>
                        </div>
                        <span className="text-[10px] font-black text-on-surface-variant bg-white px-2 py-0.5 rounded-full border border-outline-variant/20">3 logs</span>
                    </div>
                    <div className="divide-y divide-outline-variant/10">
                        {[
                            { title: 'फसल रोग - गेहूं पीलापन', date: '24 Mar', summary: 'AI ने कीटनाशक स्प्रे की सलाह दी। 3 सुझाव दिए गए।', icon: 'chat_bubble', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { title: 'PM Kisan Subsidy Form', date: '22 Mar', summary: 'Voice Apply से आवेदन पूरा किया। आधार, बैंक, पता भरा।', icon: 'description', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { title: 'मौसम चेतावनी पूछताछ', date: '20 Mar', summary: 'कल रात भारी वर्षा की संभावना। 2 मिनट की बातचीत।', icon: 'phone_in_talk', color: 'text-amber-600', bg: 'bg-amber-50' },
                        ].map((log, i) => (
                            <button key={i} className="w-full flex items-start gap-4 px-5 py-4 hover:bg-surface-container text-left transition-colors active:bg-gray-100">
                                <div className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center ${log.bg} mt-0.5`}>
                                    <span className={`material-symbols-outlined text-[20px] ${log.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{log.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                        <h4 className="font-bold text-on-surface text-[13px] truncate">{log.title}</h4>
                                        <span className="text-[10px] text-on-surface-variant shrink-0">{log.date}</span>
                                    </div>
                                    <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">{log.summary}</p>
                                </div>
                                <span className="material-symbols-outlined text-on-surface-variant opacity-30 self-center text-[18px] shrink-0">chevron_right</span>
                            </button>
                        ))}
                    </div>
                    <div className="px-5 py-3 border-t border-outline-variant/10">
                        <button className={`w-full text-center text-[12px] font-black ${themeColor.replace('bg-', 'text-')} py-1 hover:opacity-70 transition-opacity`}>
                            View All History →
                        </button>
                    </div>
                </section>

            </main>
        </div>
    );
}

export default function SecretariatUI({ onStartCall, onVoiceApply }: { onStartCall?: () => void, onVoiceApply?: () => void }) {
    const [activeSection, setActiveSection] = useState<SectionType>('farmers');
    const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isRoadmapAIOpen, setIsRoadmapAIOpen] = useState(false);
    const [isSchemeSearchOpen, setIsSchemeSearchOpen] = useState(false);
    const [isSchemeListOpen, setIsSchemeListOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);


    const [activeChatTab, setActiveChatTab] = useState<'chat' | 'record'>('chat');
    const [activeVoiceForm, setActiveVoiceForm] = useState<string | null>(null);
    const [isChatListening, setIsChatListening] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ? फसल, योजना, या किसी भी सवाल के लिए पूछें।' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const data = SECTIONS[activeSection];
    const chips = CHIPS[activeSection];

    const parseMessageContent = (text: string) => {
        let html = text.replace(/-/g, '-');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>');

        const tableRegex = /(?:\|.*\|\n?)+/g;
        html = html.replace(tableRegex, (match) => {
            const lines = match.trim().split('\n');
            let tableOutput = '<div class="overflow-x-auto my-3 shadow-sm rounded-lg border border-outline-variant/30"><table class="w-full text-left border-collapse text-[11px] leading-tight">';
            let isHeader = true;
            for (const line of lines) {
                if (line.includes('---')) {
                    isHeader = false;
                    continue;
                }
                const cells = line.split('|').filter(c => c.trim() !== '');
                if (cells.length === 0) continue;

                tableOutput += '<tr class="border-b border-outline-variant/20 last:border-0">';
                for (let i = 0; i < cells.length; i++) {
                    const cell = cells[i].trim();
                    if (isHeader) {
                        tableOutput += `<th class="p-2.5 bg-black/5 font-extrabold text-on-surface uppercase tracking-wider">${cell}</th>`;
                    } else {
                        tableOutput += `<td class="p-2.5 bg-white text-on-surface-variant">${cell}</td>`;
                    }
                }
                tableOutput += '</tr>';
            }
            tableOutput += '</table></div>';
            return tableOutput;
        });

        html = html.replace(/\*/g, '');
        html = html.replace(/\n{2,}/g, '<br/><br/>');
        html = html.replace(/\n/g, '<br/>');

        return html;
    };

    useEffect(() => {
        const initVoices = () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.getVoices();
            }
        };

        initVoices();
        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = initVoices;
        }
    }, []);


    const handleCall = () => {
        setIsVoiceOverlayOpen(false);
        onStartCall?.();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSelectedImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleChatMicClick = () => {
        if (isChatListening) return;
        setIsChatListening(true);
        setInputValue('');
        // Simulating the user speaking their question
        setTimeout(() => {
            setIsChatListening(false);
            setInputValue(selectedImage ? 'मुझे इस फोटो के बारे में जानकारी चाहिए।' : 'नमस्ते, मुझे एक समस्या है।');
        }, 2000);
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() && !selectedImage) return;
        const userMsg: ChatMessage = { role: 'user', content: inputValue || 'تصवीर भेजी गई', image: selectedImage };
        const newMsgs = [...chatMessages, userMsg];
        setChatMessages(newMsgs);
        setInputValue('');
        setSelectedImage(null);
        try {
            const response = await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: `You are a helpful government assistant for ${data.label}. Always respond in Hindi. Be concise and empathetic.` },
                        ...newMsgs.slice(-10)
                    ]
                })
            });
            const result = await response.json();
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: result.success ? result.data : 'क्षमा करें, उत्तर पाने में परेशानी हो रही है।'
            }]);
        } catch {
            setChatMessages(prev => [...prev, { role: 'assistant', content: 'नेटवर्क की त्रुटि। कृपया बाद में प्रयास करें।' }]);
        }
    };

    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Client-side execution check for portals
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    return (
        <>
            {/* ── Main Page ── */}
            <div className="bg-surface text-on-surface antialiased pb-32 font-body min-h-screen transition-colors duration-300 max-w-[420px] mx-auto relative shadow-2xl border-x border-outline-variant/10">

                {/* Sidebar */}
                {mounted && isSidebarOpen && createPortal(
                    <div className="fixed inset-0 z-[200] flex animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                        <div className="relative w-72 bg-surface-container-lowest h-full shadow-2xl flex flex-col p-6 animate-in slide-in-from-left duration-500">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-xl font-bold text-primary font-headline">AskBox</h2>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full hover:bg-surface-container">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="space-y-2">
                                {(Object.keys(SECTIONS) as SectionType[]).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => { setActiveSection(s); setIsSidebarOpen(false); }}
                                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-left ${activeSection === s ? `${SECTIONS[s].themeColor} text-white` : 'hover:bg-surface-container text-on-surface'}`}
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {s === 'farmers' ? 'agriculture' : s === 'ladies' ? 'woman_2' : s === 'students' ? 'school' : 'elderly'}
                                        </span>
                                        <span className="font-semibold">{SECTIONS[s].label}</span>
                                    </button>
                                ))}
                                <div className="pt-4 border-t border-outline-variant/20 mt-4 space-y-1">
                                    <button onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors">
                                        <span className="material-symbols-outlined">history</span>
                                        <span className="text-sm font-medium">Call History</span>
                                    </button>
                                    <button onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors">
                                        <span className="material-symbols-outlined">settings</span>
                                        <span className="text-sm font-medium">Settings</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* TopAppBar */}
                <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-40 bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 h-16 border-b border-outline-variant/20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors active:scale-95">
                            <span className={`material-symbols-outlined ${data.themeColor.replace('bg-', 'text-')} cursor-pointer select-none`}>menu</span>
                        </button>
                        <h1 className={`text-xl font-bold ${data.themeColor.replace('bg-', 'text-')} font-headline tracking-tight transition-colors duration-500`}>AskBox</h1>
                    </div>
                    <button onClick={() => setIsProfileOpen(true)} className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border-2 border-outline-variant hover:border-primary active:scale-95 transition-all outline-none shadow-md">
                        <img alt="User" className="w-full h-full object-cover" src={data.avatar} />
                    </button>

                </header>

                <main className="pt-20 px-4 space-y-8 max-w-lg mx-auto">

                    {/* Section Chips */}
                    <div className="flex overflow-x-auto gap-3 no-scrollbar py-2 -mx-1 px-1">
                        {(Object.keys(SECTIONS) as SectionType[]).map((s) => (
                            <button
                                key={s}
                                onClick={() => setActiveSection(s)}
                                className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold transition-all border ${activeSection === s
                                    ? `${SECTIONS[s].themeColor} text-white border-transparent shadow-lg scale-105`
                                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/30'
                                    }`}
                            >
                                {SECTIONS[s].label}
                            </button>
                        ))}
                    </div>

                    {/* Hero */}
                    <section className={`relative overflow-hidden rounded-3xl ${data.themeColor} p-8 text-white shadow-xl transition-colors duration-700`}>
                        <div className="relative z-10 space-y-4">
                            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold tracking-widest uppercase">{data.hero.tag}</span>
                            <h2 className="text-3xl font-extrabold leading-tight whitespace-pre-line">{data.hero.title}</h2>
                            <p className="text-white/80 text-sm max-w-[200px] mb-2">{data.hero.desc}</p>

                            {/* New Toll Free Helpline directly starts Call UX */}
                            <button
                                onClick={handleCall}
                                className={`mt-2 flex items-center gap-2 bg-white ${data.themeColor.replace('bg-', 'text-')} px-5 py-2.5 rounded-full font-extrabold text-sm shadow-lg hover:scale-105 hover:shadow-xl transition-all active:scale-95`}
                            >
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>phone_in_talk</span>
                                <span>टोल फ्री हेल्पलाईन</span>
                            </button>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute top-0 right-0 p-4 opacity-40 pointer-events-none">
                            <span className="material-symbols-outlined text-[120px]">settings_voice</span>
                        </div>
                    </section>

                    {/* Dynamic Weather Panel below Hero */}
                    <WeatherPanel themeColor={data.themeColor} />

                    {/* Render Profile Section independently via Portal */}
                    {mounted && isProfileOpen && createPortal(
                        <ProfileViewOverlay
                            onClose={() => setIsProfileOpen(false)}
                            themeColor={data.themeColor}
                            lightThemeColor={data.lightThemeColor}
                            avatar={data.avatar}
                            userName={data.userName}
                        />,
                        document.body
                    )}

                    {/* Diagnostic */}
                    <section className="space-y-4">
                        <div className="flex justify-between items-end">
                            <h3 className={`font-bold text-xl transition-colors duration-500 ${data.themeColor.replace('bg-', 'text-')}`}>{data.diagnostic.title}</h3>
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-lg ${data.lightThemeColor} tracking-wider uppercase`}>Beta v2.0</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {/* Image Upload Card */}
                            <div className={`bg-surface-container-lowest p-6 rounded-3xl shadow-sm space-y-4 border-l-4 ${data.themeColor.replace('bg-', 'border-')}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 ${data.lightThemeColor} rounded-full`}>
                                        <span className="material-symbols-outlined">photo_camera</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-on-surface">{data.diagnostic.uploadTitle}</h4>
                                        <p className="text-[12px] text-on-surface-variant font-medium">{data.diagnostic.uploadDesc}</p>
                                    </div>
                                </div>
                                {selectedImage && (
                                    <div className="relative rounded-2xl overflow-hidden h-40 border border-outline-variant/30">
                                        <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                        <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full">
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                {selectedImage ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex-1 text-center py-3 rounded-xl bg-surface-container-highest text-on-surface-variant font-bold text-sm cursor-pointer hover:bg-surface-container active:scale-95 transition-all"
                                        >
                                            बदलें (Change)
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsChatOpen(true);
                                                if (!chatMessages.some(m => m.content.includes('फोटो'))) {
                                                    setChatMessages(prev => [...prev, { role: 'assistant', content: 'आप इस फोटो के बारे में क्या जानना चाहते हैं? (बोलने के लिए Mic दबाएं)' }]);
                                                }
                                            }}
                                            className={`flex-1 text-center py-3 rounded-xl ${data.themeColor} text-white font-bold text-sm cursor-pointer shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1`}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">chat</span> Start Chat
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="block w-full text-center py-3 rounded-xl bg-surface-container-highest text-on-surface-variant font-bold text-sm cursor-pointer hover:bg-surface-container active:scale-95 transition-all"
                                    >
                                        गैलरी से चुनें (Gallery)
                                    </button>
                                )}
                            </div>

                            {/* Chat Card */}
                            <div
                                onClick={() => setIsChatOpen(true)}
                                className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 ${data.lightThemeColor} rounded-full transition-colors duration-500`}>
                                        <span className="material-symbols-outlined">forum</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-on-surface">{data.diagnostic.chatTitle}</h4>
                                        <p className="text-[12px] text-on-surface-variant font-medium">{data.diagnostic.chatDesc}</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-outline-variant">arrow_forward_ios</span>
                            </div>
                        </div>
                    </section>

                    {/* Government Schemes */}
                    <section className="space-y-4">
                        <h3 className={`font-bold text-xl transition-colors duration-500 ${data.themeColor.replace('bg-', 'text-')}`}>सरकारी योजनाएँ</h3>
                        <div className="flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar">
                            {data.schemes.map((scheme, idx) => (
                                <div key={idx} className="min-w-[280px] snap-center bg-surface-container-lowest rounded-3xl shadow-sm overflow-hidden flex flex-col border border-outline-variant/10">
                                    <div className="h-32 bg-slate-200 relative">
                                        <img alt={scheme.title} className="w-full h-full object-cover" src={scheme.img} />
                                        <div
                                            className="absolute top-2 right-2 cursor-pointer active:scale-95 transition-transform"
                                            onClick={(e) => { e.stopPropagation(); setActiveVoiceForm(scheme.title); }}
                                        >
                                            <span className={`px-3 py-1 rounded-full ${data.themeColor} text-white text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1 shadow-sm`}>
                                                <span className="material-symbols-outlined text-[14px]">mic</span> Voice Apply
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-2">
                                        <h4 className="font-bold text-on-surface leading-tight text-sm">{scheme.title}</h4>
                                        <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed font-medium">{scheme.desc}</p>
                                        <div className="pt-2 flex justify-between items-center">
                                            <span className={`text-[10px] font-extrabold ${data.themeColor.replace('bg-', 'text-')} tracking-widest uppercase`}>ID: {scheme.id}</span>
                                            <span className={`material-symbols-outlined ${data.themeColor.replace('bg-', 'text-')} text-lg`}>chevron_right</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {/* More Options Plus Card */}
                            <div
                                onClick={() => setIsSchemeSearchOpen(true)}
                                className="min-w-[160px] snap-center bg-surface-container-highest/30 rounded-3xl shadow-sm overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-outline-variant hover:bg-surface-container transition-all cursor-pointer group active:scale-95"
                            >
                                <div className={`w-12 h-12 rounded-full ${data.themeColor} text-white flex items-center justify-center shadow-md group-hover:scale-125 transition-transform duration-300`}>
                                    <span className="material-symbols-outlined text-2xl font-black">add</span>
                                </div>
                                <span className="mt-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">अधिक खोजें (Discovery)</span>
                            </div>
                        </div>
                    </section>


                    <NewsSection
                        section={activeSection}
                        themeColor={data.themeColor}
                        lightThemeColor={data.lightThemeColor}
                    />

                    {/* Dynamic Roadmap specific to Section */}
                    <RoadmapSection
                        section={activeSection}
                        themeColor={data.themeColor}
                        onOpenAI={() => setIsRoadmapAIOpen(true)}
                    />


                    {/* Render Roadmap AI Overlay via Portal */}
                    {mounted && isRoadmapAIOpen && createPortal(
                        <RoadmapCounselOverlay
                            onClose={() => setIsRoadmapAIOpen(false)}
                            section={activeSection}
                            themeColor={data.themeColor}
                            lightThemeColor={data.lightThemeColor}
                        />,
                        document.body
                    )}

                    {/* Nearby Services */}
                    <section className="space-y-4 pb-8">
                        <h3 className={`font-bold text-xl transition-colors duration-500 ${data.themeColor.replace('bg-', 'text-')}`}>नजदीकी सेवाएँ</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {data.services.map((service, idx) => (
                                <div key={idx} className={`bg-white p-4 rounded-3xl shadow-sm border-l-4 ${data.themeColor.replace('bg-', 'border-')} flex flex-col justify-between h-32 border border-outline-variant/10`}>
                                    <span className={`material-symbols-outlined ${service.color} text-3xl`}>{service.icon}</span>
                                    <div>
                                        <p className="font-bold text-sm text-on-surface">{service.title}</p>
                                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">{service.dist}</p>
                                    </div>
                                </div>
                            ))}
                            {data.specialService && (
                                <div className="col-span-2 bg-white px-5 py-4 rounded-3xl flex items-center justify-between border border-outline-variant/10 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-2xl ${data.themeColor} text-white flex items-center justify-center shadow-lg`}>
                                            <span className="material-symbols-outlined">{data.specialService.icon}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-on-surface">{data.specialService.title}</p>
                                            <p className="text-[10px] text-on-surface-variant font-medium">{data.specialService.addr}</p>
                                        </div>
                                    </div>
                                    <span className={`material-symbols-outlined ${data.themeColor.replace('bg-', 'text-')} font-bold`}>directions</span>
                                </div>
                            )}
                        </div>
                    </section>
                </main>

                {/* Bottom Nav */}
                <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] flex justify-around items-center px-4 pb-8 pt-4 bg-white/90 backdrop-blur-xl shadow-[0_-8px_32px_rgba(25,28,30,0.08)] rounded-t-[2.5rem] z-40 border-t border-outline-variant/10">
                    <a className={`flex flex-col items-center justify-center ${data.themeColor} text-white rounded-2xl px-12 py-2.5 transition-all active:scale-95 duration-500`} href="#">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                        <span className="text-[10px] font-extrabold tracking-wide uppercase mt-1">Home</span>
                    </a>
                    <button onClick={() => setIsProfileOpen(true)} className="flex flex-col items-center justify-center text-on-surface-variant px-12 py-2.5 transition-all active:scale-95 hover:bg-surface-container rounded-2xl">
                        <span className="material-symbols-outlined">person</span>
                        <span className="text-[10px] font-extrabold tracking-wide uppercase mt-1">Profile</span>
                    </button>
                </nav>

                {/* Call FAB */}
                <div className="fixed bottom-28 left-1/2 transform ml-[120px] z-50">
                    <button
                        onClick={() => setIsVoiceOverlayOpen(true)}
                        className="w-16 h-16 bg-primary text-white rounded-full shadow-[0_8px_30px_rgba(244,171,37,0.4)] flex items-center justify-center active:scale-90 transition-all hover:scale-110 border-4 border-white dark:border-surface"
                    >
                        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
                    </button>
                </div>

                {/* Voice Overlay */}
                {mounted && isVoiceOverlayOpen && createPortal(
                    <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-surface/95 z-[210] flex flex-col items-center justify-center p-6 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-300 shadow-2xl border-x border-outline-variant/20">
                        <div className="flex flex-col items-center space-y-8 w-full max-w-sm">
                            <div className="text-center space-y-2 mb-4">
                                <h3 className={`text-3xl font-black font-headline transition-colors duration-500 ${data.themeColor.replace('bg-', 'text-')}`}>Voice Assistant</h3>
                                <p className="text-on-surface-variant text-[12px] font-bold uppercase tracking-widest italic opacity-60">Help for {data.label}</p>
                            </div>
                            {/* Niche choices removed as per user request */}
                            <div className="grid grid-cols gap-4 w-full">
                                {[
                                    { label: "Call Support", icon: "call", color: "bg-primary-fixed text-primary", action: handleCall },
                                    { label: "Fill Form", icon: "description", color: "bg-secondary-container text-secondary", action: handleCall },
                                    { label: "Find Office", icon: "distance", color: "bg-tertiary-fixed text-tertiary", action: () => { } },
                                    { label: "File Complaint", icon: "report_problem", color: "bg-error-container text-error", action: () => { } }
                                ].map((opt, idx) => (
                                    <button key={idx} onClick={opt.action} className="bg-surface-container-lowest p-5 rounded-[2rem] shadow-md border border-outline-variant/30 flex flex-col items-center gap-3 active:scale-95 transition-all hover:bg-white text-on-surface">
                                        <div className={`p-3 rounded-full ${opt.color}`}>
                                            <span className="material-symbols-outlined text-2xl">{opt.icon}</span>
                                        </div>
                                        <span className="font-bold text-xs">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setIsVoiceOverlayOpen(false)} className="mt-8 w-16 h-16 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform hover:scale-105">
                                <span className="material-symbols-outlined text-3xl">close</span>
                            </button>
                        </div>
                    </div>,
                    document.body
                )}

                <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
            </div>

            {/* ── Chat Overlay ── rendered via Portal to escape all stacking contexts */}
            {mounted && isChatOpen && createPortal(
                <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-[220] flex flex-col bg-surface animate-in slide-in-from-bottom duration-300 shadow-2xl border-x border-outline-variant/20">

                    {/* TopAppBar */}
                    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-50 bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => { setIsChatOpen(false); setActiveChatTab('chat'); }}
                                className={`${data.themeColor.replace('bg-', 'text-')} active:scale-95 transition-transform duration-200`}
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <div className="flex flex-col">
                                <h1 className="text-on-surface font-semibold tracking-tight text-base leading-tight">{data.label} सहायक</h1>
                                <span className="text-[10px] text-on-surface-variant font-bold tracking-widest uppercase">Digital AskBox</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${data.themeColor}`}></div>
                            <span className="text-xs font-medium text-on-surface-variant">Online</span>
                        </div>
                        <div className="absolute bottom-0 left-0 bg-surface-container-low h-[1px] w-full"></div>
                    </header>

                    {/* Chat or Record Canvas */}
                    <main className="flex-1 mt-16 mb-40 px-4 py-6 overflow-y-auto no-scrollbar flex flex-col gap-6 max-w-3xl mx-auto w-full">
                        {activeChatTab === 'chat' ? (
                            <>
                                {chatMessages.map((msg, idx) =>
                                    msg.role === 'assistant' ? (
                                        <div key={idx} className="flex flex-col gap-1 max-w-[85%] self-start animate-in fade-in slide-in-from-left-2 duration-300">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-6 h-6 rounded-xl ${data.themeColor} flex items-center justify-center shadow-sm`}>
                                                    <span className="material-symbols-outlined text-[14px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                                                </div>
                                                <span className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">{data.label} Bot</span>
                                            </div>
                                            <div
                                                className="bg-secondary-container text-on-secondary-container p-4 rounded-xl leading-relaxed text-sm shadow-sm"
                                                dangerouslySetInnerHTML={{ __html: parseMessageContent(msg.content) }}
                                            />
                                            <span className="text-[10px] text-on-surface-variant ml-1">{now}</span>
                                        </div>
                                    ) : (
                                        <div key={idx} className="flex flex-col gap-1 max-w-[85%] self-end items-end animate-in fade-in slide-in-from-right-2 duration-300">
                                            <div className="bg-surface-container-lowest text-on-surface p-4 rounded-xl leading-relaxed text-sm shadow-sm border border-outline-variant/20">
                                                {msg.image && (
                                                    <img src={msg.image} alt="upload" className="w-full max-w-[200px] rounded-lg mb-2 object-cover" />
                                                )}
                                                <div dangerouslySetInnerHTML={{ __html: parseMessageContent(msg.content) }} />
                                            </div>
                                            <span className="text-[10px] text-on-surface-variant mr-1">{now}</span>
                                        </div>
                                    )
                                )}

                                {/* Suggestion Chips */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {chips.map((chip, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setInputValue(chip.label)}
                                            className="flex items-center gap-2 bg-surface-container-lowest text-on-surface text-xs font-semibold px-4 py-2.5 rounded-xl border border-outline-variant/20 hover:bg-white transition-colors active:scale-95"
                                        >
                                            <span className={`material-symbols-outlined text-[18px] ${chip.color}`}>{chip.icon}</span>
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h2 className="font-bold text-lg text-on-surface mb-2">पिछली पूछताछ (Past Logs)</h2>
                                {[
                                    { title: "फसल रोग सहायता", date: "24 मार्च 2026", desc: "गेहूं के पत्तों का पीलापन, उपचार सुझाया गया..." },
                                    { title: "सब्सिडी फॉर्म 2026", date: "23 मार्च 2026", desc: "पीएम किसान योजना के तहत आवेदन..." },
                                    { title: "मौसम संबंधी चेतावनी", date: "21 मार्च 2026", desc: "मध्य भारी वर्षा की संभावना, अलर्ट..." }
                                ].map((log, i) => (
                                    <div key={i} className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/20 hover:bg-white transition-colors cursor-pointer active:scale-[0.98]">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={`font-bold text-sm ${data.themeColor.replace('bg-', 'text-')}`}>{log.title}</h3>
                                            <span className={`text-[10px] ${data.lightThemeColor} px-2 py-1 rounded-full font-bold`}>{log.date}</span>
                                        </div>
                                        <p className="text-xs text-on-surface-variant line-clamp-2">{log.desc}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>

                    {/* Bottom Input */}
                    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-white px-4 pb-8 pt-4 flex flex-col gap-3 z-50 border-t border-outline-variant/20 shadow-[0_-4px_30px_rgba(0,0,0,0.05)] border-x">

                        {activeChatTab === 'chat' && (
                            <div className="flex flex-col gap-3 w-full animate-in fade-in duration-300">
                                {selectedImage && (
                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-outline-variant/20 self-start ml-2 mb-1 animate-in slide-in-from-bottom-2">
                                        <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                        <button onClick={() => setSelectedImage(null)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 w-full">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="अपना सवाल यहाँ लिखें..."
                                            className="w-full bg-surface-container-highest border-none text-slate-900 rounded-xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 pr-24 transition-all"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                            <button onClick={() => fileInputRef.current?.click()} className="text-on-surface-variant p-2 -my-2 rounded-full hover:bg-surface-variant hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">attach_file</span>
                                            </button>
                                        </div>
                                    </div>
                                    <button onClick={handleChatMicClick} className={`${isChatListening ? 'bg-error text-white animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.5)]' : `${data.themeColor} text-white opacity-80 hover:opacity-100 shadow-sm`} w-12 h-12 flex shrink-0 items-center justify-center rounded-xl active:scale-95 transition-all`}>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                                    </button>
                                    <button onClick={handleSendMessage} className={`${data.themeColor} text-white w-12 h-12 flex shrink-0 items-center justify-center rounded-xl shadow-md active:scale-95 transition-all hover:shadow-lg hover:scale-105`}>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Mini Bottom Nav */}
                        <div className="flex justify-around items-center pt-2 max-w-sm mx-auto w-full">
                            <button
                                onClick={() => setActiveChatTab('chat')}
                                className={`flex flex-col items-center justify-center ${activeChatTab === 'chat' ? `${data.lightThemeColor} px-8` : 'text-on-surface-variant hover:bg-surface-container'} rounded-xl py-2 transition-all cursor-pointer`}
                            >
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                                <span className="text-[11px] font-bold tracking-wide uppercase mt-1">चैट</span>
                            </button>
                            <button
                                onClick={() => setActiveChatTab('record')}
                                className={`flex flex-col items-center justify-center ${activeChatTab === 'record' ? `${data.lightThemeColor} px-8` : 'text-on-surface-variant hover:bg-surface-container'} rounded-xl py-2 transition-all cursor-pointer`}
                            >
                                <span className="material-symbols-outlined">history_edu</span>
                                <span className="text-[11px] font-bold tracking-wide uppercase mt-1">रिकॉर्ड</span>
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ── Real Mock Form Voice Overlay ── */}
            {mounted && activeVoiceForm && createPortal(
                <VoiceFormOverlay formName={activeVoiceForm} themeColor={data.themeColor} onClose={() => setActiveVoiceForm(null)} />,
                document.body
            )}
        </>
    );
}
