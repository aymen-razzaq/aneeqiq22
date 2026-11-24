import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, onSnapshot, serverTimestamp, getDocFromServer, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import defaultShopLogo from './assets/images/default_shop_logo_1795530726308.jpg';
import defaultShopHero from './assets/images/default_shop_hero_1795530727876.jpg';

console.log("Aneeq: main.js execution started at " + new Date().toISOString());

// Added global error handler for debugging
window.addEventListener('error', (event) => {
    console.error("Global Error Caught:", event.error || event.message);
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = "System Error: " + (event.error?.message || event.message);
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 5000);
    }
});

// Global Exports - Define early for HTML onclick availability
window.toggleAuthMode = (...args) => toggleAuthMode(...args);
window.handleBasketAutoTrack = (...args) => handleBasketAutoTrack(...args);
window.handleLogin = (...args) => handleLogin(...args);
window.handleRegister = (...args) => handleRegister(...args);
window.saveProfileLocation = (...args) => saveProfileLocation(...args);
window.logout = (...args) => logout(...args);
window.showView = (...args) => showView(...args);
window.openShop = (...args) => openShop(...args);
window.buyFromFeed = (...args) => buyFromFeed(...args);
window.openBuyModal = (...args) => openBuyModal(...args);
window.closeModal = (...args) => closeModal(...args);
window.submitOrder = (...args) => submitOrder(...args);
window.handleSellerLogin = (...args) => handleSellerLogin(...args);
window.addNewProduct = (...args) => addNewProduct(...args);
window.deleteProduct = (...args) => deleteProduct(...args);
window.handleTrackOrder = (...args) => handleBasketAutoTrack(...args);
window.handleMasterLogin = (...args) => handleMasterLogin(...args);
window.masterLogout = (...args) => masterLogout(...args);
window.updateOrderStatus = (...args) => updateOrderStatus(...args);
window.deleteOrderByID = (...args) => deleteOrderByID(...args);
window.setLanguage = (...args) => setLanguage(...args);
window.filterByCategory = (...args) => filterByCategory(...args);
window.previewProductImage = (...args) => previewProductImage(...args);
window.previewStoreImage = (...args) => previewStoreImage(...args);
window.removeStoreImage = (...args) => removeStoreImage(...args);
window.saveStoreSettings = (...args) => saveStoreSettings(...args);
window.togglePass = (...args) => togglePass(...args);
window.refreshUserProfile = (...args) => refreshUserProfile(...args);
window.switchMasterTab = (...args) => switchMasterTab(...args);
window.updateShopCategory = (...args) => updateShopCategory(...args);
window.applyCrop = (...args) => applyCrop(...args);
window.closeCropModal = (...args) => closeCropModal(...args);
window.zoomCropper = (...args) => zoomCropper(...args);
window.rotateCropper = (...args) => rotateCropper(...args);
window.editProduct = (...args) => editProduct(...args);
window.saveProductEdit = (...args) => saveProductEdit(...args);
window.closeProductEditModal = (...args) => closeProductEditModal(...args);
window.addTagToProduct = (...args) => addTagToProduct(...args);
window.removeTagFromProduct = (...args) => removeTagFromProduct(...args);
window.openMasterShopModal = (...args) => openMasterShopModal(...args);
window.closeMasterShopModal = (...args) => closeMasterShopModal(...args);
window.previewMasterShopLogo = (...args) => previewMasterShopLogo(...args);
window.previewMasterShopHero = (...args) => previewMasterShopHero(...args);
window.saveMasterShop = (...args) => saveMasterShop(...args);
window.deleteMasterShop = (...args) => deleteMasterShop(...args);
window.deleteAllMasterShops = (...args) => deleteAllMasterShops(...args);

window.closeZoomModal = (...args) => closeZoomModal(...args);
window.zoomImage = (...args) => zoomImage(...args);
window.removeProductPreviewImage = (...args) => removeProductPreviewImage(...args);
window.setMainImage = (...args) => setMainImage(...args);
window.openContactModal = (...args) => openContactModal(...args);
window.closeContactModal = (...args) => closeContactModal(...args);
window.openTermsModal = (...args) => openTermsModal(...args);
window.closeTermsModal = (...args) => closeTermsModal(...args);
window.openCategoryFromHome = (...args) => openCategoryFromHome(...args);
window.handleMarketplaceSearch = (...args) => handleMarketplaceSearch(...args);
window.clearMarketplaceSearch = (...args) => clearMarketplaceSearch(...args);
window.setReviewRating = (...args) => setReviewRating(...args);
window.submitProductReview = (...args) => submitProductReview(...args);
window.deleteProductReview = (...args) => deleteProductReview(...args);
window.openReportModal = (...args) => openReportModal(...args);
window.closeReportModal = (...args) => closeReportModal(...args);
window.updateWhatsAppReportLink = (...args) => updateWhatsAppReportLink(...args);
window.setApprovalsFilter = (...args) => setApprovalsFilter(...args);
window.approveProductPhoto = (...args) => approveProductPhoto(...args);
window.rejectProductPhoto = (...args) => rejectProductPhoto(...args);
window.approveAllProductPhotos = (...args) => approveAllProductPhotos(...args);
window.approveShopPhoto = (...args) => approveShopPhoto(...args);
window.rejectShopPhoto = (...args) => rejectShopPhoto(...args);

const firebaseConfig = {
  "projectId": "gen-lang-client-0293781004",
  "appId": "1:1002839908496:web:52aa50ad60d3aa92603815",
  "apiKey": "AIzaSyB_mOuYbRx3IHAduhIXChdXmfPM_9R4ppo",
  "authDomain": "gen-lang-client-0293781004.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-1243ade3-2460-42a3-a0ef-abfd1118c9d3",
  "storageBucket": "gen-lang-client-0293781004.firebasestorage.app",
  "messagingSenderId": "1002839908496",
  "measurementId": ""
};

// INITIALIZATION
const loader = document.getElementById('app-loader');
const hideLoader = () => {
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.classList.add('hidden'), 500);
    }
};

let app, db, auth;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth();
} catch (e) {
    console.error("Firebase Init Error:", e);
    const loaderText = document.querySelector('#app-loader p');
    if (loaderText) loaderText.innerText = "Error initializing system. Please check your connection.";
}

let isAuthReady = false;

// Sign in anonymously
if (auth) {
    signInAnonymously(auth).catch(e => console.warn("Anonymous Auth disabled:", e.message));

    onAuthStateChanged(auth, (user) => {
        isAuthReady = true;
        console.log("Auth state changed:", user ? "Signed in" : "Signed out");
        hideLoader();
    });
} else {
    hideLoader();
}

async function testConnection() {
    if (!db) return;
    try {
        await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
            console.error("Please check your Firebase configuration.");
        }
    }
}
testConnection();

// Timeout to hide loader anyway if auth takes too long
setTimeout(hideLoader, 5000);

const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

// DATA CONSTANTS
const SHOPS = [];

const MASTER_KEY = "1111";

const TRANSLATIONS = {
    en: {
        storeSettings: "Store Settings",
        storeHero: "Store Header Image",
        saveStore: "Update Store Front",
        marketplace: "All Shops",
        trackOrder: "Track Request",
        home: "Home",
        heroTitle: "Where Style Meets ",
        heroIdentity: "Identity.",
        heroText: "Welcome to aneeq, the premium marketplace for independent creators and discerning collectors.",
        enterMarketplace: "Go to All Shops",
        basket: "My Requests",
        account: "Account",
        login: "Login",
        register: "Register",
        fullName: "Full Name",
        phone: "Phone Number",
        password: "Password",
        createAccount: "Create Account",
        myProfile: "My Profile",
        contactInfo: "Contact Info",
        shippingLocation: "Shipping Location",
        updateLocation: "Update Location",
        enterLocation: "City, Neighborhood, Street No...",
        deliveryHint: "Enter your delivery location and any notes. Our team will contact you.",
        curatedExcellence: "Curated Excellence",
        curatedText: "Every shop on our platform is hand-picked for quality and originality.",
        directConnect: "Direct Connect",
        directText: "Request pieces directly from creators through our secure portal.",
        globalVision: "Global Vision",
        globalText: "Wear pieces that aren't available anywhere else in the world.",
        promoTitle: "Own items that tell a story.",
        promoText: "Moving away from fast fashion towards intentional ownership. aneeq connects you to the makers behind the craft.",
        discoverBrands: "Discover Brands",
        independentBrands: "Independent Brands",
        curatedCollections: "Curated collections from unique creators, delivered directly to you.",
        marketplaceFeed: "All Shops",
        browseProducts: "Browse products from all independent sellers in one place.",
        trackTitle: "Track Request",
        trackText: "Enter your number to see messages from Master.",
        viewStatus: "View Status",
        requestStatus: "My Purchase Requests",
        sellerLogin: "Seller Login",
        storePasskey: "Store Passkey",
        enterDashboard: "Enter Dashboard",
        storeManager: "Store Manager",
        logout: "Logout",
        addNewProduct: "Add New Product",
        productName: "Product Name",
        category: "Category (e.g. Hoodies)",
        price: "Price (IQD)",
        imageUrl: "Image URL",
        publishProduct: "Publish Product",
        inventory: "Inventory",
        masterLogin: "aneeq Master",
        authorizedOnly: "Authorized access only.",
        verifyIdentity: "Verify Identity",
        commandCenter: "Marketplace Command Center",
        totalLabel: "Total: ",
        systemOnline: "System Online",
        purchaseRequest: "Purchase Request",
        phoneLabel: "Phone Number (e.g. 0770 000 0000)",
        confirmRequest: "Confirm Request",
        toastSent: "Request Sent to Master!",
        noProducts: "No products yet.",
        noItemsMarket: "No items in the marketplace yet.",
        buyNow: "Order Now",
        backToMarket: "Back to Unique Items",
        backToHome: "Back to Home",
        phonePlaceholder: "07XX XXX XXXX",
        noOrdersFound: "No requests found for this number.",
        waitMaster: "Wait for the Master to review your request.",
        messageSent: "Message Sent:",
        removeHistory: "Remove from History",
        masterAction: "MASTER ACTION",
        typeMessage: "Type a message for the customer...",
        acceptRequest: "Accept Request",
        refuseRequest: "Refuse Request",
        accessDenied: "ACCESS_DENIED.",
        wrongKey: "Wrong key.",
        fillFields: "Fill fields",
        delete: "Delete",
        platform: "Platform",
        support: "Support",
        contactUs: "Contact Us",
        terms: "Terms of Service",
        footerText: "Redefining independent retail for the modern age.",
        all: "All",
        men: "Men",
        women: "Women",
        kids: "Kids",
        shoes: "Shoes",
        statusAccepted: "Accepted",
        statusRefused: "Refused",
        phLabel: "PH:",
        visitShop: "Visit Shop",
        backToHome: "Back to Home",
        backToMarketplace: "All Shops",
        loginToView: "Please login to view your requests.",
        goToAccount: "Go to Account",
        basketDesc: "View and track your current purchase requests.",
        showingPieces: "Showing all unique pieces",
        curatedCollectionsTitle: "Curated Collections",
        brandName: "aneeq Specials",
        rights: "All rights reserved.",
        pending: "Pending",
        locationDetails: "Location/Details:",
        edit: "Edit",
        updateProduct: "Update Product",
        description: "Description",
        tags: "Tags (Comma separated)",
        masterTabOrders: "Incoming Requests",
        masterTabShops: "Manage Shops",
        masterTabApprovals: "Photo Approvals",
        searchPlaceholder: "Search shops, products, or tags...",
        noMatchingShops: "No shops match your search.",
        noMatchingProducts: "No products match your search.",
        clearSearch: "Clear search",
        showingResults: "Showing",
        resultsLabel: "results",
        reviewsTitle: "Ratings & Comments",
        noReviewsYet: "No reviews yet. Be the first to review.",
        reviewsCountLabel: "reviews",
        reviewCountSingle: "review",
        yourRating: "Your Rating",
        writeCommentPlaceholder: "Share your thoughts about this item...",
        postReview: "Post Review",
        loginToReview: "Sign in to rate and comment on this product.",
        signInNow: "Sign In",
        reviewPosted: "Review posted!",
        reviewDeleted: "Review removed.",
        selectStarFirst: "Please choose a star rating (1–5).",
        writeCommentFirst: "Please write a comment.",
        reportProduct: "Report Product",
        reportStore: "Report Store",
        reportIssueFooter: "Report Issue (WhatsApp)",
        reportViaWhatsapp: "Report an Issue via WhatsApp",
        reportModalTitle: "Report Issue on WhatsApp",
        reportModalSubtitle: "Your report will be sent directly to our support WhatsApp (07759530163).",
        reportReasonLabel: "Reason",
        reportPhoneLabel: "Your Phone (Optional)",
        reportDetailsLabel: "Details",
        reportDetailsPlaceholder: "Describe the issue briefly...",
        sendOnWhatsapp: "Send on WhatsApp (07759530163)",
        photoApprovalHint: "All uploaded photos are reviewed by Master before appearing on the public store.",
        pendingApprovalMsg: "Product added! Photos sent to Master for approval.",
        settingsSavedApproval: "Settings updated! New photos sent to Master for approval.",
        pendingLabel: "Pending Approval",
        approvedLabel: "Approved",
        rejectedLabel: "Rejected",
        approveBtn: "Approve",
        rejectBtn: "Reject",
        approveAllBtn: "Approve All",
        approvalsQueueTitle: "Photo Approval Queue",
        approvalsQueueDesc: "Every uploaded product, logo, and banner photo stays hidden from the public web until approved here.",
        filterPending: "Pending",
        filterAll: "All",
        noPendingApprovals: "All photos have been reviewed. No pending approvals right now.",
        noApprovalsFound: "No uploaded photos found.",
        storeLogoType: "Store Logo",
        storeHeroType: "Store Hero Banner",
        productPhotoUnavailable: "This product's photos are pending Master approval.",
        logoPendingNote: "New logo pending Master approval",
        heroPendingNote: "New hero banner pending Master approval",
        logoRejectedNote: "Last logo upload was rejected by Master",
        heroRejectedNote: "Last hero banner upload was rejected by Master",
    },
    ar: {
        storeSettings: "إعدادات المتجر",
        storeHero: "صورة غلاف المتجر",
        saveStore: "تحديث واجهة المتجر",
        marketplace: "كل المتاجر",
        trackOrder: "تتبع الطلبات",
        home: "الرئيسية",
        heroTitle: "حيث يلتقي الأسلوب بـ ",
        heroIdentity: "الهوية.",
        heroText: "مرحباً بكم في أنيق، المتجر المميز للمبدعين المستقلين وجامعي القطع الفريدة.",
        enterMarketplace: "عرض كل المتاجر",
        basket: "طلبات الشراء",
        account: "الحساب",
        login: "تسجيل الدخول",
        register: "إنشاء حساب",
        fullName: "الاسم الكامل",
        phone: "رقم الهاتف",
        password: "كلمة المرور",
        createAccount: "إنشاء الحساب",
        myProfile: "ملفي الشخصي",
        contactInfo: "معلومات الاتصال",
        shippingLocation: "موقع الشحن",
        updateLocation: "تحديث الموقع",
        enterLocation: "المدينة، الحي، رقم الشارع...",
        deliveryHint: "أدخل موقع التوصيل وأي ملاحظات إضافية. سيتصل بك فريقنا.",
        curatedExcellence: "تميز منتقى",
        curatedText: "يتم اختيار كل متجر على منصتنا يدوياً لضمان الجودة والأصالة.",
        directConnect: "اتصال مباشر",
        directText: "اطلب القطع مباشرة من المبدعين من خلال بوابتنا الآمنة.",
        globalVision: "رؤية عالمية",
        globalText: "ارتدِ قطعاً لا تتوفر في أي مكان آخر في العالم.",
        promoTitle: "امتلك قطعاً تحكي قصة.",
        promoText: "الابتعاد عن الموضة السريعة نحو الملكية المقصودة. أنيق يربطك بالمبدعين وراء الحرفة.",
        discoverBrands: "اكتشف العلامات التجارية",
        independentBrands: "العلامات التجارية المستقلة",
        curatedCollections: "مجموعات مختارة من مبدعين فريدين، تصل إليك مباشرة.",
        marketplaceFeed: "كل المتاجر",
        browseProducts: "تصفح المنتجات من جميع البائعين المستقلين في مكان واحد.",
        trackTitle: "تتبع الطلب",
        trackText: "أدخل رقمك لرؤية رسائل الماستر.",
        viewStatus: "عرض الحالة",
        requestStatus: "طلبات الشراء الخاصة بي",
        sellerLogin: "تسجيل دخول البائع",
        storePasskey: "مفتاح مرور المتجر",
        enterDashboard: "دخول لوحة التحكم",
        storeManager: "مدير المتجر",
        logout: "تسجيل الخروج",
        addNewProduct: "إضافة منتج جديد",
        productName: "اسم المنتج",
        category: "الفئة (مثل: هوديز)",
        price: "السعر (د.ع)",
        imageUrl: "رابط الصورة",
        publishProduct: "نشر المنتج",
        inventory: "المخزون",
        masterLogin: "أنيق ماستر",
        authorizedOnly: "وصول مصرح به فقط.",
        verifyIdentity: "التحقق من الهوية",
        commandCenter: "مركز قيادة المتجر",
        totalLabel: "الإجمالي: ",
        systemOnline: "النظام متصل",
        purchaseRequest: "طلب شراء",
        phoneLabel: "رقم الهاتف (مثال: 0770 000 0000)",
        confirmRequest: "تأكيد الطلب",
        toastSent: "تم إرسال الطلب إلى الماستر!",
        noProducts: "لا توجد منتجات بعد.",
        noItemsMarket: "لا توجد عناصر في المتجر بعد.",
        buyNow: "اطلب الآن",
        backToMarket: "العودة للقطع الفريدة",
        backToHome: "العودة للرئيسية",
        phonePlaceholder: "07XX XXX XXXX",
        noOrdersFound: "لم يتم العثور على طلبات لهذا الرقم.",
        waitMaster: "يرجى انتظار مراجعة الماستر لطلبك.",
        messageSent: "الرسالة المرسلة:",
        removeHistory: "إزالة من السجل",
        masterAction: "إجراء الماستر",
        typeMessage: "اكتب رسالة للزبون...",
        acceptRequest: "قبول الطلب",
        refuseRequest: "رفض الطلب",
        accessDenied: "تم رفض الوصول.",
        wrongKey: "مفتاح خاطئ.",
        fillFields: "املأ الحقول",
        delete: "حذف",
        platform: "المنصة",
        support: "الدعم",
        contactUs: "اتصل بنا",
        terms: "شروط الخدمة",
        footerText: "إعادة تعريف التجزئة المستقلة للعصر الحديث.",
        all: "الكل",
        men: "رجالي",
        women: "نسائي",
        kids: "أطفال",
        shoes: "أحذية",
        statusAccepted: "مقبول",
        statusRefused: "مرفوض",
        phLabel: "هاتف:",
        visitShop: "عرض المتجر",
        backToHome: "العودة للرئيسية",
        backToMarketplace: "العودة لكل المتاجر",
        loginToView: "يرجى تسجيل الدخول لعرض طلبات الشراء الخاصة بك.",
        goToAccount: "الانتقال للحساب",
        basketDesc: "عرض وتتبع طلبات الشراء الحالية الخاصة بك.",
        showingPieces: "عرض جميع القطع الفريدة",
        curatedCollectionsTitle: "مجموعات مختارة",
        brandName: "عروض أنيق",
        rights: "جميع الحقوق محفوظة.",
        pending: "قيد الانتظار",
        locationDetails: "الموقع/التفاصيل:",
        edit: "تعديل",
        updateProduct: "تحديث المنتج",
        description: "الوصف",
        tags: "الوسوم (مفصولة بفاصلة)",
        masterTabOrders: "الطلبّات الواردة",
        masterTabShops: "إدارة المتاجر",
        masterTabApprovals: "موافقات الصور",
        searchPlaceholder: "ابحث عن متجر أو منتج أو وسم...",
        noMatchingShops: "لا توجد متاجر مطابقة لبحثك.",
        noMatchingProducts: "لا توجد منتجات مطابقة لبحثك.",
        clearSearch: "مسح البحث",
        showingResults: "عرض",
        resultsLabel: "نتائج",
        reviewsTitle: "التقييمات والتعليقات",
        noReviewsYet: "لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج.",
        reviewsCountLabel: "تقييمات",
        reviewCountSingle: "تقييم",
        yourRating: "تقييمك",
        writeCommentPlaceholder: "اكتب تعليقك عن هذا المنتج...",
        postReview: "نشر التقييم",
        loginToReview: "سجّل الدخول لتتمكن من تقييم المنتج وكتابة تعليق.",
        signInNow: "تسجيل الدخول",
        reviewPosted: "تم نشر تقييمك بنجاح!",
        reviewDeleted: "تم حذف التقييم.",
        selectStarFirst: "يرجى اختيار عدد النجوم (1–5).",
        writeCommentFirst: "يرجى كتابة تعليق.",
        reportProduct: "إبلاغ عن المنتج",
        reportStore: "إبلاغ عن المتجر",
        reportIssueFooter: "إبلاغ عن مشكلة (واتساب)",
        reportViaWhatsapp: "الإبلاغ عن مشكلة عبر واتساب",
        reportModalTitle: "إبلاغ عبر واتساب",
        reportModalSubtitle: "سيتم إرسال البلاغ مباشرة إلى فريق الدعم على واتساب (07759530163).",
        reportReasonLabel: "سبب البلاغ",
        reportPhoneLabel: "رقم هاتفك (اختياري)",
        reportDetailsLabel: "التفاصيل",
        reportDetailsPlaceholder: "اشرح المشكلة باختصار...",
        sendOnWhatsapp: "إرسال عبر واتساب (07759530163)",
        photoApprovalHint: "تخضع جميع الصور المرفوعة لمراجعة الماستر قبل ظهورها للعامة.",
        pendingApprovalMsg: "تمت إضافة المنتج! أُرسلت الصور إلى الماستر للموافقة.",
        settingsSavedApproval: "تم الحفظ! أُرسلت الصور الجديدة إلى الماستر للموافقة.",
        pendingLabel: "بانتظار الموافقة",
        approvedLabel: "تمت الموافقة",
        rejectedLabel: "مرفوض",
        approveBtn: "موافقة",
        rejectBtn: "رفض",
        approveAllBtn: "موافقة على الكل",
        approvalsQueueTitle: "قائمة موافقات الصور",
        approvalsQueueDesc: "تبقى كل صورة منتج أو شعار أو غلاف متجر مخفية عن الموقع العام حتى تتم الموافقة عليها هنا.",
        filterPending: "قيد الانتظار",
        filterAll: "الكل",
        noPendingApprovals: "تمت مراجعة جميع الصور. لا توجد صور بانتظار الموافقة حالياً.",
        noApprovalsFound: "لا توجد صور مرفوعة.",
        storeLogoType: "شعار المتجر",
        storeHeroType: "غلاف المتجر",
        productPhotoUnavailable: "صور هذا المنتج بانتظار موافقة الماستر.",
        logoPendingNote: "الشعار الجديد بانتظار موافقة الماستر",
        heroPendingNote: "الغلاف الجديد بانتظار موافقة الماستر",
        logoRejectedNote: "تم رفض الشعار الأخير من قبل الماستر",
        heroRejectedNote: "تم رفض الغلاف الأخير من قبل الماستر",
    }

};

// STATE
let currentView = "home";
let activeShop = null;
let loggedInShopId = localStorage.getItem('aneeq_seller_id');
let loggedInUser = null;
try {
    const savedUser = localStorage.getItem('aneeq_user');
    if (savedUser && savedUser !== 'undefined') {
        loggedInUser = JSON.parse(savedUser);
    }
} catch (e) {
    console.error("Error parsing loggedInUser from localStorage:", e);
    localStorage.removeItem('aneeq_user');
}
let trackOrdersUnsubscribe = null;
let isMasterLoggedIn = localStorage.getItem('aneeq_master_session') === 'true';
let currentProductToBuy = null;
let currentLang = localStorage.getItem('aneeq_lang') || 'ar';
let currentCategory = 'all';
let currentSearchQuery = '';
let MARKET_PRODUCTS = [];
let ALL_REVIEWS = [];
const PRODUCT_RATINGS = {};
let selectedReviewRating = 5;
let currentApprovalsFilter = 'pending';
let currentMasterTab = 'orders';
let reportContext = { type: 'general', targetName: '', targetId: '' };
let reviewsUnsubscribe = null;
const shopSettingsOverrides = {};
const PRODUCT_CACHE = {};
const WHATSAPP_REPORT_NUMBER = '9647759530163';

// INIT
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM Content Loaded. Initializing app...");
    try {
        // 1. Initialize real-time listeners
        initSettingsListener();
        ensureProductFeedListener();
        initReviewsListener();
        
        // 2. Set language
        setLanguage(currentLang);
        
        // 3. Recovery of states
        if (loggedInUser) {
            updateProfileUI();
            refreshUserProfile();
        }

        if (loggedInShopId) {
            // Do not delete loggedInShopId immediately here because SHOPS has not finished loading asynchronously from Firestore
            const sellerTools = document.getElementById('seller-tools');
            if (sellerTools) sellerTools.classList.remove('hidden');
            renderAdminInventory();
        }

        if (isMasterLoggedIn) {
            console.log("Master is logged in, showing dashboard");
            const masterLogin = document.getElementById('master-login');
            const masterDashboard = document.getElementById('master-dashboard');
            if (masterLogin) masterLogin.classList.add('hidden');
            if (masterDashboard) masterDashboard.classList.remove('hidden');
            renderMasterOrders();
            updateApprovalsBadge();
        }
        
        // Check URL path on load
        const path = window.location.pathname.substring(1);
        const validViews = ['home', 'marketplace', 'basket', 'account', 'master'];
        if (path && validViews.includes(path)) {
            showView(path, true);
        } else {
            showView('home', true);
        }
        
        if (typeof setupAdminSelect === 'function') {
            setupAdminSelect();
        }

        // Live Master Shop Inputs Optimization
        const mShopIdInput = document.getElementById('m-shop-id');
        const mShopIdHelper = document.getElementById('m-shop-id-helper');
        if (mShopIdInput) {
            const updateIdHelper = () => {
                let val = mShopIdInput.value.toLowerCase();
                // Squeeze out invalid characters live
                val = val.replace(/\s+/g, '-');
                val = val.replace(/[^a-z0-9_-]/g, '');
                val = val.replace(/-+/g, '-');
                
                if (mShopIdInput.value !== val) {
                    mShopIdInput.value = val;
                }
                
                if (mShopIdHelper) {
                    if (val) {
                        mShopIdHelper.innerHTML = currentLang === 'ar' 
                            ? `رابط المتجر: <strong style="color: #4cd137;">${val}</strong>`
                            : `Store link path: <strong style="color: #4cd137;">${val}</strong>`;
                    } else {
                        mShopIdHelper.innerHTML = currentLang === 'ar' 
                            ? '<span style="color: #ea8685;">يرجى كتابة معرف فريد للرابط</span>'
                            : '<span style="color: #ea8685;">Please type a unique identifier for the URL</span>';
                    }
                }
            };
            mShopIdInput.addEventListener('input', updateIdHelper);
            mShopIdInput.style.fontFamily = 'monospace';
            
            // Initial call to set placeholder/state
            setTimeout(updateIdHelper, 100);
        }

        // Add Enter key listeners to master shop dialog inputs to save easily
        ['m-shop-id', 'm-shop-name', 'm-shop-phone', 'm-shop-pass'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        saveMasterShop();
                    }
                });
            }
        });
    } catch (e) {
        console.error("Error during app initialization:", e);
    } finally {
        // Ensure loader is hidden even if init has issues
        setTimeout(hideLoader, 1000);
    }
});

// LANGUAGE
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('aneeq_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Update static strings
    updateStaticTranslations();
    
    // Re-render current view components if needed
    if(currentView === 'marketplace') {
        initMarketplace();
        renderProductFeed();
    }
    if(currentView === 'shop' && activeShop) {
        openShop(activeShop.id);
    }
    if(currentView === 'basket') handleBasketAutoTrack();
    if(currentView === 'master') {
        renderMasterOrders();
        renderMasterShops();
        renderMasterApprovals();
    }
    if(loggedInShopId) renderAdminInventory();
    if(currentProductToBuy && !document.getElementById('buy-modal')?.classList.contains('hidden')) {
        renderProductReviews(currentProductToBuy.id);
    }
}

function updateStaticTranslations() {
    try {
        const t = TRANSLATIONS[currentLang];
        if (!t) return;
        
        // Nav
        const navButtons = document.querySelectorAll('.navbar nav button');
        if(navButtons.length >= 3) {
            navButtons[0].innerText = t.marketplace;
            navButtons[1].innerText = t.basket;
            navButtons[2].innerText = t.account;
        }
        
        // Account View
        const authCard = document.getElementById('account-auth');
        if(authCard) {
            const tLogin = document.getElementById('tab-login');
            const tRegister = document.getElementById('tab-register');
            if (tLogin) tLogin.innerText = t.login;
            if (tRegister) tRegister.innerText = t.register;
            
            const lp = document.getElementById('login-phone');
            const lps = document.getElementById('login-pass');
            if (lp) lp.placeholder = t.phone;
            if (lps) lps.placeholder = t.password;
            
            const loginBtn = authCard.querySelector('#form-login .btn-primary');
            if(loginBtn) loginBtn.innerText = t.login;
            
            const rn = document.getElementById('reg-name');
            const rp = document.getElementById('reg-phone');
            const rps = document.getElementById('reg-pass');
            if (rn) rn.placeholder = t.fullName;
            if (rp) rp.placeholder = t.phone;
            if (rps) rps.placeholder = t.password;
            
            const regBtn = authCard.querySelector('#form-register .btn-primary');
            if(regBtn) regBtn.innerText = t.createAccount;
        }
        
        const profileView = document.getElementById('account-profile');
        if(profileView) {
           const udn = document.getElementById('user-display-name');
           if (udn) udn.innerText = loggedInUser ? loggedInUser.name : t.myProfile;
           
           const h3s = profileView.querySelectorAll('h3');
           if (h3s.length >= 1) h3s[0].innerText = t.contactInfo;
           if (h3s.length >= 2) h3s[1].innerText = t.shippingLocation;
           
           const pl = document.getElementById('profile-location');
           if (pl) pl.placeholder = t.enterLocation;
           
           const updateLocBtn = profileView.querySelector('button[onclick="saveProfileLocation()"]');
           if(updateLocBtn) updateLocBtn.innerText = t.updateLocation;
        }

        // Basket View
        const basketView = document.getElementById('view-basket');
        if(basketView) {
            const basketTitle = document.getElementById('basket-title');
            if(basketTitle) basketTitle.innerHTML = currentLang === 'ar' ? `طلبات <span class="accent-text">الشراء</span>` : `Purchase <span class="accent-text">Requests</span>`;
            const bst = document.getElementById('basket-status-title');
            if (bst) bst.innerText = t.requestStatus;
            
            const bdesc = document.getElementById('basket-desc');
            if (bdesc) bdesc.innerText = t.basketDesc;
            
            const bat = document.getElementById('basket-auth-text');
            if (bat) bat.innerText = t.loginToView;
            
            const bab = document.getElementById('basket-auth-btn');
            if (bab) bab.innerText = t.goToAccount;
        }

        // Marketplace View Hero
        const mpHeroTag = document.getElementById('mp-hero-tag');
        const mpHeroTitle = document.getElementById('mp-hero-title');
        const mpHeroDesc = document.getElementById('mp-hero-desc');
        if (mpHeroTag) mpHeroTag.innerText = t.curatedCollectionsTitle;
        if (mpHeroTitle) mpHeroTitle.innerText = t.independentBrands;
        if (mpHeroDesc) mpHeroDesc.innerText = t.curatedCollections;
        
        const mpFeedTitle = document.getElementById('mp-feed-title');
        const mpFeedMeta = document.getElementById('mp-feed-meta');
        const mpSearchInput = document.getElementById('marketplace-search');
        const mpSearchClear = document.getElementById('marketplace-search-clear');
        if (mpFeedTitle) mpFeedTitle.innerText = t.marketplaceFeed;
        if (mpFeedMeta && !currentSearchQuery.trim()) mpFeedMeta.innerText = t.showingPieces;
        if (mpSearchInput) mpSearchInput.placeholder = t.searchPlaceholder;
        if (mpSearchClear) mpSearchClear.setAttribute('aria-label', t.clearSearch);

        // Back Buttons
        document.querySelectorAll('.btn-back span').forEach(span => {
            const btn = span.parentElement;
            const onclick = btn.getAttribute('onclick');
            if (onclick === "showView('home')") span.innerText = t.backToHome;
            if (onclick === "showView('marketplace')") span.innerText = t.backToMarketplace;
        });

        // Modal
        const buyModal = document.getElementById('buy-modal');
        if(buyModal) {
            const bmt = document.getElementById('buy-modal-title');
            const bmh = document.getElementById('buy-modal-hint');
            const cl = document.getElementById('customer-location');
            const bconfirm = document.getElementById('buy-confirm-btn');
            const revTitle = document.getElementById('reviews-section-title');
            if (bmt) bmt.innerText = t.purchaseRequest;
            if (bmh) bmh.innerText = t.deliveryHint;
            if (cl) cl.placeholder = t.enterLocation;
            if (bconfirm) bconfirm.innerText = t.confirmRequest;
            if (revTitle) revTitle.innerText = t.reviewsTitle;
        }
        
        // Home
        const homeKicker = document.getElementById('home-kicker');
        if (homeKicker) {
            homeKicker.innerText = currentLang === 'ar'
                ? 'أنيق ستور • السوق العراقي للأزياء'
                : 'ANEEQ MARKETPLACE • CURATED INDEPENDENT FASHION';
        }
        const homeCatsTitle = document.getElementById('home-cats-title');
        if (homeCatsTitle) {
            homeCatsTitle.innerText = currentLang === 'ar' ? 'تصفح حسب الفئة' : 'Shop by Category';
        }
        document.querySelectorAll('[data-home-cat]').forEach(el => {
            const cat = el.dataset.homeCat;
            if (cat === 'Men') el.innerText = t.men;
            if (cat === 'Women') el.innerText = t.women;
            if (cat === 'Kids') el.innerText = t.kids;
            if (cat === 'Shoes') el.innerText = t.shoes;
        });

        const homeHero = document.querySelector('.home-hero');
        if(homeHero) {
            const h1 = homeHero.querySelector('h1');
            const p = homeHero.querySelector('p');
            const mpBtn = homeHero.querySelector('button[onclick="showView(\'marketplace\')"]');
            const bkBtn = document.getElementById('home-basket-btn');
            
            if (h1) h1.innerHTML = `${t.heroTitle} <span class="accent-text">${t.heroIdentity}</span>`;
            if (p) p.innerText = t.heroText;
            if (mpBtn) mpBtn.innerText = t.enterMarketplace;
            if (bkBtn) bkBtn.innerText = t.basket;
        }
        
        const features = document.querySelectorAll('.feature-card');
        if(features.length >= 3) {
            const f1h = features[0].querySelector('h3');
            const f1p = features[0].querySelector('p');
            if (f1h) f1h.innerText = t.curatedExcellence;
            if (f1p) f1p.innerText = t.curatedText;
            
            const f2h = features[1].querySelector('h3');
            const f2p = features[1].querySelector('p');
            if (f2h) f2h.innerText = t.directConnect;
            if (f2p) f2p.innerText = t.directText;
            
            const f3h = features[2].querySelector('h3');
            const f3p = features[2].querySelector('p');
            if (f3h) f3h.innerText = t.globalVision;
            if (f3p) f3p.innerText = t.globalText;
        }

        const promo = document.querySelector('.home-promo');
        if(promo) {
            const h2 = promo.querySelector('h2');
            const p = promo.querySelector('p');
            const btn = promo.querySelector('button');
            if (h2) h2.innerText = t.promoTitle;
            if (p) p.innerText = t.promoText;
            if (btn) btn.innerText = t.discoverBrands;
        }
        
        // Categories
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const cat = btn.dataset.category;
            if (cat === 'all') btn.innerText = t.all;
            if (cat === 'Men') btn.innerText = t.men;
            if (cat === 'Women') btn.innerText = t.women;
            if (cat === 'Kids') btn.innerText = t.kids;
            if (cat === 'Shoes') btn.innerText = t.shoes;
        });

        // Marketplace
        const marketplaceView = document.getElementById('view-marketplace');
        if(marketplaceView) {
            const mpHero = marketplaceView.querySelector('.hero');
            if(mpHero) {
                const h1 = mpHero.querySelector('h1');
                const p = mpHero.querySelector('p');
                if (h1) h1.innerText = t.independentBrands;
                if (p) p.innerText = t.curatedCollections;
            }
            const mpFeedHeader = marketplaceView.querySelector('.feed-header');
            if(mpFeedHeader) {
                const h2 = mpFeedHeader.querySelector('h2');
                if (h2) h2.innerText = t.marketplaceFeed;
            }
        }
        
        // Seller Admin
        const adminLogin = document.getElementById('admin-login');
        if(adminLogin) {
            const h2 = adminLogin.querySelector('h2');
            const p = adminLogin.querySelector('p');
            const passInput = document.getElementById('admin-pass');
            const btn = adminLogin.querySelector('button');
            if (h2) h2.innerText = t.sellerLogin;
            if (passInput) passInput.placeholder = t.storePasskey;
            if (btn) btn.innerText = t.enterDashboard;
        }
        const adminDashboard = document.getElementById('seller-tools');
        if(adminDashboard) {
            const logoutBtn = adminDashboard.querySelector('.btn-outline');
            if (logoutBtn) logoutBtn.innerText = t.logout;
            
            const settingsCard = adminDashboard.querySelector('.admin-settings-card');
            if(settingsCard) {
                const h3 = settingsCard.querySelector('h3');
                if (h3) h3.innerText = t.storeSettings;
                const labels = settingsCard.querySelectorAll('label');
                if (labels.length >= 1) labels[0].innerText = currentLang === 'ar' ? 'اسم المتجر' : 'Store Display Name';
                const sni = document.getElementById('store-name-input');
                if (sni) sni.placeholder = currentLang === 'ar' ? 'أدخل اسم المتجر' : 'Enter Store Name';
                const ut = settingsCard.querySelector('.upload-text');
                if (ut) ut.innerText = t.storeHero;
                const saveBtn = settingsCard.querySelector('.btn-primary');
                if (saveBtn) saveBtn.innerText = t.saveStore;

                // Pre-fill current name from memory or SHOPS
                const shop = SHOPS.find(s => s.id === loggedInShopId);
                const currentName = shopSettingsOverrides[loggedInShopId]?.name || shop?.name || "";
                if (sni) sni.value = currentName;
            }

            const addCard = document.getElementById('seller-add-product-card');
            if (addCard) {
                const h3Add = addCard.querySelector('h3');
                if (h3Add) h3Add.innerText = t.addNewProduct;
                const hn = document.getElementById('p-name');
                const hp = document.getElementById('p-price');
                if (hn) hn.placeholder = t.productName;
                if (hp) hp.placeholder = t.price;
                const pubBtn = addCard.querySelector('button[onclick="addNewProduct()"]');
                if (pubBtn) pubBtn.innerText = t.publishProduct;
            }

            const invCard = document.getElementById('seller-inventory-card');
            if (invCard) {
                const h3Inv = invCard.querySelector('h3');
                if (h3Inv) h3Inv.innerText = t.inventory;
            }

            const catSelect = document.getElementById('p-cat');
            if (catSelect && catSelect.options.length >= 5) {
                catSelect.options[0].text = currentLang === 'ar' ? 'اختر الفئة' : 'Select Category';
                catSelect.options[1].text = t.men;
                catSelect.options[2].text = t.women;
                catSelect.options[3].text = t.kids;
                catSelect.options[4].text = t.shoes;
            }
        }
        
        // Master Admin
        const masterLogin = document.getElementById('master-login');
        if(masterLogin) {
            const formContainer = masterLogin.querySelector('.auth-form-container');
            const h2 = formContainer ? formContainer.querySelector('h2') : masterLogin.querySelector('h2');
            const p = formContainer ? formContainer.querySelector('p') : masterLogin.querySelector('p');
            const btn = masterLogin.querySelector('button');
            const mpk = document.getElementById('master-pass');
            if (h2) h2.innerText = t.masterLogin;
            if (p) p.innerText = t.authorizedOnly;
            if (mpk) mpk.placeholder = t.verifyIdentity;
            if (btn) btn.innerText = t.verifyIdentity;
        }
        const masterDashboard = document.getElementById('master-dashboard');
        if(masterDashboard) {
            const h2 = masterDashboard.querySelector('h2');
            if (h2) h2.innerText = t.commandCenter;
            
            const tabOrders = document.getElementById('master-tab-orders');
            const tabShops = document.getElementById('master-tab-shops');
            const tabApprovalsText = document.getElementById('master-tab-approvals-text');
            if (tabOrders) tabOrders.innerText = t.masterTabOrders;
            if (tabShops) tabShops.innerText = t.masterTabShops;
            if (tabApprovalsText) tabApprovalsText.innerText = t.masterTabApprovals;

            const appTitle = document.getElementById('lbl-master-approvals-title');
            const appDesc = document.getElementById('lbl-master-approvals-desc');
            const fPending = document.getElementById('approvals-filter-pending');
            const fAll = document.getElementById('approvals-filter-all');
            if (appTitle) appTitle.innerText = t.approvalsQueueTitle;
            if (appDesc) appDesc.innerText = t.approvalsQueueDesc;
            if (fPending) fPending.innerText = t.filterPending;
            if (fAll) fAll.innerText = t.filterAll;
            
            const logoutBtn = masterDashboard.querySelector('.logout-btn');
            if (logoutBtn) logoutBtn.innerText = t.logout;
        }

        const photoHint = document.getElementById('seller-photo-approval-hint');
        if (photoHint) photoHint.innerText = t.photoApprovalHint;
        updateReportModalTranslations();
        
        // Toast
        const toast = document.getElementById('toast');
        if (toast) toast.innerText = t.toastSent;

        // Edit Modal
        const editModal = document.getElementById('product-edit-modal');
        if (editModal) {
            const title = document.getElementById('edit-product-title');
            if (title) title.innerText = t.updateProduct;
            const labels = editModal.querySelectorAll('label');
            if (labels.length >= 4) {
                labels[0].innerText = t.productName;
                labels[1].innerText = t.category;
                labels[2].innerText = t.price;
                labels[3].innerText = t.description;
                labels[4].innerText = t.tags;
            }
            const updateBtn = editModal.querySelector('.btn-primary');
            if (updateBtn) updateBtn.innerText = t.updateProduct;
        }
        
        // Footer
        const footer = document.querySelector('footer');
        if(footer) {
            const fp = footer.querySelector('.footer-brand p');
            const fhl = footer.querySelectorAll('.footer-links h4');
            const flButtons = footer.querySelectorAll('.footer-links button');
            const flh = footer.querySelector('.footer-legal h4');
            const flp = footer.querySelectorAll('.footer-legal p');
            const fb = footer.querySelector('.footer-bottom');

            if (fp) fp.innerText = t.footerText;
            if (fhl.length >= 1) fhl[0].innerText = t.platform;
            
            // Map buttons to their translations based on their onclick handlers
            flButtons.forEach(btn => {
                const handler = btn.getAttribute('onclick');
                if (handler === "showView('home')") btn.innerText = t.home;
                else if (handler === "showView('marketplace')") btn.innerText = t.marketplace;
                else if (handler === "showView('account')") btn.innerText = t.account;
                else if (handler === "showView('basket')") btn.innerText = t.basket;
            });

            if (flh) flh.innerText = t.support;
            if (flp.length >= 2) {
                flp[0].innerText = t.contactUs;
                flp[1].innerText = t.terms;
            }
            const footerReport = document.getElementById('footer-report-link');
            if (footerReport) footerReport.innerText = t.reportIssueFooter;
            if (fb) fb.innerText = `© 2026 ${t.brandName}. ${t.rights}`;
            
            updateContactModalTranslations();
            updateTermsModalTranslations();
        }
    } catch (e) {
        console.error("Error in updateStaticTranslations:", e);
    }
}


// Listen for back/forward navigation
window.addEventListener('popstate', (event) => {
    const viewId = event.state?.viewId || 'home';
    showView(viewId, true);
});

// ROUTING
function showView(viewId, skipState = false) {
    currentView = viewId;
    
    if (!skipState) {
        const url = viewId === 'home' ? '/' : '/' + viewId;
        history.pushState({ viewId }, '', url);
    }
    
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(`view-${viewId}`);
    if(target) target.classList.remove('hidden');

    // Sync active nav tab highlight
    document.querySelectorAll('.navbar nav button').forEach(b => b.classList.remove('nav-active'));
    if (viewId === 'marketplace' || viewId === 'shop') {
        document.getElementById('nav-marketplace-btn')?.classList.add('nav-active');
    } else if (viewId === 'basket') {
        document.getElementById('nav-basket-btn')?.classList.add('nav-active');
    } else if (viewId === 'account') {
        document.getElementById('nav-account-btn')?.classList.add('nav-active');
    }
    
    if(viewId === 'account') {
        refreshUserProfile();
    }
    
    if(viewId === 'basket') {
        handleBasketAutoTrack();
    }
    
    if(viewId === 'marketplace') {
        initMarketplace();
        renderProductFeed();
    }
    if(viewId === 'master') {
        renderMasterOrders();
        updateApprovalsBadge();
        if (currentMasterTab === 'approvals') renderMasterApprovals();
    }
    
    window.scrollTo(0,0);
}

function openCategoryFromHome(cat) {
    showView('marketplace');
    filterByCategory(cat);
}

// UTILITIES
function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getProductAllImages(p) {
    if (!p) return [];
    if (Array.isArray(p.images) && p.images.length > 0) return p.images;
    if (p.image) return [p.image];
    return [];
}

function getProductPhotoStatuses(p) {
    const imgs = getProductAllImages(p);
    if (Array.isArray(p.photoStatuses) && p.photoStatuses.length === imgs.length) {
        return p.photoStatuses;
    }
    if (p.photoStatus === 'pending' || p.photoStatus === 'rejected') {
        return imgs.map(() => p.photoStatus);
    }
    return imgs.map(() => 'approved');
}

function getApprovedProductImages(p) {
    if (!p) return [];
    const imgs = getProductAllImages(p);
    if (imgs.length === 0) return [];
    const statuses = getProductPhotoStatuses(p);
    return imgs.filter((_, idx) => statuses[idx] === 'approved');
}

function getProductRatingSummary(productId) {
    return PRODUCT_RATINGS[productId] || { avg: 0, count: 0 };
}

function renderStarIcons(rating, size = 14) {
    const rounded = Math.round(Number(rating) || 0);
    let html = '';
    for (let i = 1; i <= 5; i++) {
        const fill = i <= rounded ? '#F59E0B' : 'none';
        const stroke = i <= rounded ? '#F59E0B' : '#CBD5E1';
        html += `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
    return html;
}

function initSettingsListener() {
    if (!db) return;
    onSnapshot(collection(db, "shop_settings"), (snapshot) => {
        // Clear old settings overrides to prevent deleted shops lingering in memory cache
        for (const key in shopSettingsOverrides) {
            delete shopSettingsOverrides[key];
        }

        const tempShops = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const sId = data.shopId || docSnap.id;
            if (sId) {
                // Keep overrides structure up-to-date
                shopSettingsOverrides[sId] = {
                    ...data,
                    shopId: sId
                };
                tempShops.push({
                    id: sId,
                    name: data.name || "Unnamed Shop",
                    phone: data.phone || "",
                    pass: data.pass || data.password || "",
                    category: data.category || "",
                    logo: data.logo || defaultShopLogo,
                    hero: data.hero || defaultShopHero,
                });
            }
        });
        
        // Mutate SHOPS global array
        SHOPS.length = 0;
        SHOPS.push(...tempShops);
        
        // Update UI dynamically
        if (loggedInShopId) {
            const shop = SHOPS.find(s => s.id === loggedInShopId);
            if (shop) {
                const sellerTools = document.getElementById('seller-tools');
                if (sellerTools) sellerTools.classList.remove('hidden');
                renderAdminInventory();
                
                const displayName = shopSettingsOverrides[loggedInShopId]?.name || shop?.name;
                const el = document.getElementById('admin-store-name');
                if (el) el.innerText = displayName;
                updateProfileUI();
            } else {
                // Only clear if tempShops list actually has elements (safeguarding empty state loads)
                if (tempShops.length > 0) {
                    console.log("Logged in shop not found in active shops, logging out...");
                    loggedInShopId = null;
                    localStorage.removeItem('aneeq_seller_id');
                    const sellerTools = document.getElementById('seller-tools');
                    if (sellerTools) sellerTools.classList.add('hidden');
                }
            }
        }

        // Always render updated shops to both views to ensure immediate dynamic removal/syncing
        initMarketplace();
        renderFilteredProducts();
        renderMasterShops();
        updateApprovalsBadge();
        if (isMasterLoggedIn && currentMasterTab === 'approvals') {
            renderMasterApprovals();
        }

        if (currentView === 'shop' && activeShop) {
            const existsInShops = SHOPS.find(s => s.id === activeShop.id);
            const shopCat = existsInShops ? (shopSettingsOverrides[activeShop.id]?.category || existsInShops.category) : null;
            
            // If the store is deleted or uncategorized (hidden), boot the user back to marketplace safely
            if (!existsInShops || !shopCat) {
                activeShop = null;
                showView('marketplace');
            } else {
                const heroImage = shopSettingsOverrides[activeShop.id]?.hero || activeShop.hero || defaultShopHero;
                const shopLogo = shopSettingsOverrides[activeShop.id]?.logo || activeShop.logo || defaultShopLogo;
                const shopName = shopSettingsOverrides[activeShop.id]?.name || activeShop.name;
                
                const heroImgEl = document.querySelector('#view-shop .shop-hero-img');
                const heroBgBlurEl = document.querySelector('#view-shop .shop-hero-bg-blur');
                const logoImgEl = document.querySelector('#view-shop .shop-logo-img');
                const nameEl = document.querySelector('#view-shop .shop-name-p');
                
                if (heroImgEl) heroImgEl.src = heroImage;
                if (heroBgBlurEl) heroBgBlurEl.src = heroImage;
                if (logoImgEl) logoImgEl.src = shopLogo;
                if (nameEl) nameEl.innerText = shopName;
            }
        }
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "shop_settings");
    });
}

function matchesSearchQuery(textOrList, q) {
    if (!q) return true;
    if (Array.isArray(textOrList)) {
        return textOrList.some(item => String(item || '').toLowerCase().includes(q));
    }
    return String(textOrList || '').toLowerCase().includes(q);
}

function handleMarketplaceSearch(val) {
    currentSearchQuery = (val || '').trim();
    const clearBtn = document.getElementById('marketplace-search-clear');
    if (clearBtn) {
        clearBtn.classList.toggle('hidden', currentSearchQuery.length === 0);
    }
    initMarketplace();
    renderFilteredProducts();
}

function clearMarketplaceSearch() {
    currentSearchQuery = '';
    const input = document.getElementById('marketplace-search');
    const clearBtn = document.getElementById('marketplace-search-clear');
    if (input) {
        input.value = '';
        input.focus();
    }
    if (clearBtn) clearBtn.classList.add('hidden');
    initMarketplace();
    renderFilteredProducts();
}

function initMarketplace() {
    const list = document.getElementById('shops-list');
    if (!list) return;
    const t = TRANSLATIONS[currentLang];
    const q = currentSearchQuery.trim().toLowerCase();

    const filteredShops = SHOPS.filter(shop => {
        const settings = shopSettingsOverrides[shop.id] || {};
        const shopCat = settings.category || shop.category;
        if (!shopCat) return false; // Hide uncategorized stores
        if (currentCategory !== 'all' && shopCat !== currentCategory) return false;

        if (!q) return true;

        const shopName = settings.name || shop.name || '';
        const shopTags = Array.isArray(settings.tags) ? settings.tags : (Array.isArray(shop.tags) ? shop.tags : []);
        const directMatch =
            matchesSearchQuery(shopName, q) ||
            matchesSearchQuery(shopCat, q) ||
            matchesSearchQuery(shopTags, q);
        if (directMatch) return true;

        // Also match shop if any of its approved products match by name or tags
        const shopProducts = MARKET_PRODUCTS.length ? MARKET_PRODUCTS : Object.values(PRODUCT_CACHE);
        return shopProducts.some(p =>
            p.shopId === shop.id &&
            getApprovedProductImages(p).length > 0 &&
            (currentCategory === 'all' || p.category === currentCategory) &&
            (matchesSearchQuery(p.name, q) || matchesSearchQuery(p.tags, q))
        );
    });

    if (filteredShops.length === 0 && q) {
        list.innerHTML = `<div class="mp-empty-state">${t.noMatchingShops}</div>`;
        return;
    }

    list.innerHTML = filteredShops.map(shop => {
        const shopName = shopSettingsOverrides[shop.id]?.name || shop.name;
        const shopLogo = shopSettingsOverrides[shop.id]?.logo || shop.logo || defaultShopLogo;
        return `
            <div class="shop-card" onclick="openShop('${shop.id}')">
                <div class="shop-frame">
                    <div class="shop-card-content">
                        <img src="${shopLogo}" class="shop-logo" alt="${shopName} logo" onerror="this.src='${defaultShopLogo}'">
                        <div class="shop-info">
                            <h3>${shopName}</h3>
                            <div class="shop-hint">${t.visitShop}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterByCategory(cat) {
    currentCategory = cat;
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.dataset.category === cat) {
            btn.classList.add('active');
        }
    });
    initMarketplace();
    if (productFeedUnsubscribe) {
        renderFilteredProducts();
    } else {
        renderProductFeed();
    }
}

let productFeedUnsubscribe = null;

function renderProductRatingInline(productId) {
    const summary = getProductRatingSummary(productId);
    if (!summary.count) return '';
    return `
        <div class="product-rating-line">
            <span class="product-rating-star">★</span>
            <span>${summary.avg.toFixed(1)}</span>
            <span class="product-rating-count">(${summary.count})</span>
        </div>
    `;
}

function renderFilteredProducts() {
    const t = TRANSLATIONS[currentLang];
    const feedContainer = document.getElementById('marketplace-feed');
    const mpFeedMeta = document.getElementById('mp-feed-meta');
    if (!feedContainer) return;

    const q = currentSearchQuery.trim().toLowerCase();
    const filteredProducts = [];

    MARKET_PRODUCTS.forEach(p => {
        if (currentCategory !== 'all' && p.category !== currentCategory) return;
        const approvedImgs = getApprovedProductImages(p);
        if (approvedImgs.length === 0) return; // Require Master approval before showing on public web

        const shop = SHOPS.find(s => s.id === p.shopId);
        const shopCat = shop ? (shopSettingsOverrides[p.shopId]?.category || shop.category) : null;
        if (!shop || !shopCat) return;

        const shopName = shopSettingsOverrides[p.shopId]?.name || shop.name;
        const shopLogo = shopSettingsOverrides[p.shopId]?.logo || shop.logo;

        if (q) {
            const matched =
                matchesSearchQuery(p.name, q) ||
                matchesSearchQuery(p.tags, q) ||
                matchesSearchQuery(shopName, q) ||
                matchesSearchQuery(p.category, q);
            if (!matched) return;
        }

        filteredProducts.push({ ...p, shopName, shopLogo, approvedCover: approvedImgs[0] });
    });

    if (mpFeedMeta) {
        mpFeedMeta.innerText = q
            ? `${t.showingResults} ${filteredProducts.length} ${t.resultsLabel}`
            : t.showingPieces;
    }

    if (filteredProducts.length === 0) {
        feedContainer.innerHTML = q
            ? `<div class="mp-empty-state">
                    <p style="margin: 0 0 12px;">${t.noMatchingProducts}</p>
                    <button type="button" class="btn-outline" onclick="clearMarketplaceSearch()" style="min-height: 38px; padding: 8px 16px; font-size: 13px;">${t.clearSearch}</button>
               </div>`
            : `<p style="text-align:center; color:#64748B; padding:40px; grid-column: 1/-1;">${t.noItemsMarket}</p>`;
        return;
    }

    feedContainer.innerHTML = filteredProducts.map(p => `
        <div class="product-card" onclick="openBuyModal('${p.id}')">
            <div class="product-img-wrapper">
                <img src="${p.approvedCover || defaultShopHero}" alt="${escapeHtml(p.name)}" onerror="this.src='${defaultShopHero}'">
            </div>
            <div class="product-info-top">
                <div class="product-meta">
                    <span class="product-shop-tag" onclick="event.stopPropagation(); openShop('${p.shopId}')">
                        ${escapeHtml(p.shopName)}
                    </span>
                </div>
                <h3>${escapeHtml(p.name)}</h3>
                ${renderProductRatingInline(p.id)}
            </div>
            <div class="product-info-bottom">
                <div>
                    ${p.description ? `<p class="product-desc-line">${escapeHtml(p.description)}</p>` : ''}
                    ${(p.tags && p.tags.length) ? `<div class="product-tags-inline">${p.tags.map(tag => escapeHtml(tag)).join(' · ')}</div>` : ''}
                </div>
                <div class="product-card-footer">
                    <div class="product-price">${Number(p.price || 0).toLocaleString()} د.ع</div>
                    <button class="btn-buy-icon" aria-label="${t.buyNow}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function ensureProductFeedListener() {
    if (!db || productFeedUnsubscribe) return;
    const q = query(collection(db, "inventory"));
    productFeedUnsubscribe = onSnapshot(q, (snapshot) => {
        const items = [];
        snapshot.forEach(docSnap => {
            const p = { ...docSnap.data(), id: docSnap.id };
            PRODUCT_CACHE[p.id] = p;
            items.push(p);
        });
        MARKET_PRODUCTS = items;
        initMarketplace();
        renderFilteredProducts();
        updateApprovalsBadge();
        if (isMasterLoggedIn && currentMasterTab === 'approvals') {
            renderMasterApprovals();
        }
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "inventory");
    });
}

function renderProductFeed() {
    if (!db) return;
    if (productFeedUnsubscribe) {
        renderFilteredProducts();
        return;
    }
    ensureProductFeedListener();
}

function buyFromFeed(shopId, pId) {
    openBuyModal(pId);
}

// SHOP DETAIL
function openShop(shopId) {
    const shop = SHOPS.find(s => s.id === shopId);
    activeShop = shop;
    showView('shop');
    const t = TRANSLATIONS[currentLang];
    
    const heroImage = shopSettingsOverrides[shopId]?.hero || shop?.hero || defaultShopHero;
    const shopLogo = shopSettingsOverrides[shopId]?.logo || shop?.logo || defaultShopLogo;
    const shopName = shopSettingsOverrides[shopId]?.name || shop?.name || '';
    const safeShopName = escapeHtml(shopName);
    
    document.getElementById('shop-header-container').innerHTML = `
        <div class="shop-profile-header">
            <div class="shop-hero-banner">
                <img class="shop-hero-bg-blur" src="${heroImage}" alt="" onerror="this.src='${defaultShopHero}'">
                <img class="shop-hero-img" src="${heroImage}" alt="${safeShopName} Hero Banner" onerror="this.src='${defaultShopHero}'">
                <div class="shop-hero-overlay"></div>
            </div>
            
            <div class="shop-info-bar">
                <div class="shop-logo-container">
                    <img class="shop-logo-img" src="${shopLogo}" alt="${safeShopName} Logo" onerror="this.src='${defaultShopLogo}'">
                </div>
                
                <div class="shop-title-details">
                    <h1 class="shop-name-p">${safeShopName}</h1>
                </div>

                <div class="shop-report-wrap">
                    <button type="button" class="btn-report-inline" onclick="openReportModal('shop', '${safeShopName}', '${shopId}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
                        <span>${t.reportStore}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    renderProducts(shopId);
}

let shopProductsUnsubscribe = null;

function renderProducts(shopId) {
    if (!db) return;
    if (shopProductsUnsubscribe) shopProductsUnsubscribe();
    const t = TRANSLATIONS[currentLang];
    const container = document.getElementById('shop-products-container');
    
    // Back to Market text
    const backBtnText = document.querySelector('#view-shop .btn-back span');
    if(backBtnText) backBtnText.innerText = t.backToMarket;

    // Marketplace and basket back buttons
    const mBack = document.querySelector('#view-marketplace .btn-back span');
    if(mBack) mBack.innerText = t.backToHome;
    const bBack = document.querySelector('#view-basket .btn-back span');
    if(bBack) bBack.innerText = t.backToHome;

    const q = query(collection(db, "inventory"), where("shopId", "==", shopId));
    shopProductsUnsubscribe = onSnapshot(q, (snapshot) => {
        let shopProducts = [];
        snapshot.forEach(docSnap => {
            const p = { ...docSnap.data(), id: docSnap.id };
            PRODUCT_CACHE[p.id] = p;
            const approvedImgs = getApprovedProductImages(p);
            if (approvedImgs.length > 0) {
                shopProducts.push({ ...p, approvedCover: approvedImgs[0] });
            }
        });

        if(shopProducts.length === 0) {
            container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">${t.noProducts}</p>`;
            return;
        }

        container.innerHTML = shopProducts.map(p => `
            <div class="product-card" onclick="openBuyModal('${p.id}')">
                <div class="product-img-wrapper">
                    <img src="${p.approvedCover || defaultShopHero}" alt="${escapeHtml(p.name)}" onerror="this.src='${defaultShopHero}'">
                </div>
                <div class="product-info-top">
                    <h3>${escapeHtml(p.name)}</h3>
                    ${renderProductRatingInline(p.id)}
                </div>
                <div class="product-info-bottom">
                    <div>
                        ${p.description ? `<p class="product-desc-line">${escapeHtml(p.description)}</p>` : ''}
                        ${(p.tags && p.tags.length) ? `<div class="product-tags-inline">${p.tags.map(tag => escapeHtml(tag)).join(' · ')}</div>` : ''}
                    </div>
                    <div class="product-card-footer">
                        <div class="product-price">${Number(p.price || 0).toLocaleString()} د.ع</div>
                        <button class="btn-buy-icon" aria-label="${t.buyNow}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "inventory");
    });
}

// BUY MODAL & PRODUCT DETAIL
function openBuyModal(productId, allowUnapproved = false) {
    const p = PRODUCT_CACHE[productId];
    if (!p) return;
    const t = TRANSLATIONS[currentLang];

    const approvedImages = getApprovedProductImages(p);
    const images = allowUnapproved
        ? (getProductAllImages(p).length ? getProductAllImages(p) : [defaultShopHero])
        : approvedImages;

    if (images.length === 0) {
        showToast(t.productPhotoUnavailable);
        return;
    }

    currentProductToBuy = p;
    selectedReviewRating = 5;
    const ratingSummary = getProductRatingSummary(p.id);
    const safeName = escapeHtml(p.name);
    
    document.getElementById('modal-product-info').innerHTML = `
        <div style="margin-bottom:18px;">
            <div style="margin-bottom:14px;">
                <div id="modal-gallery" style="width: 100%; position: relative; border-radius: 16px; overflow: hidden; background: #F7F9FC; border: 1px solid #E5EBF3; aspect-ratio: 1/1; display: flex; align-items: center; justify-content: center; cursor: zoom-in;" onclick="zoomImage(currentGalleryImage || '${images[0]}')">
                    <img id="main-modal-img" src="${images[0]}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='${defaultShopHero}'">
                </div>
                ${images.length > 1 ? `
                    <div style="display: flex; gap: 8px; margin-top: 10px; overflow-x: auto; padding-bottom: 4px;">
                        ${images.map((img, i) => `
                            <img src="${img}" onclick="event.stopPropagation(); updateModalGallery('${img}')" style="width: 52px; height: 52px; border-radius: 10px; object-fit: cover; border: 2px solid ${i === 0 ? '#2563EB' : '#E5EBF3'}; cursor: pointer;" onerror="this.src='${defaultShopHero}'">
                        `).join('')}
                    </div>
                ` : ''}
                <div class="modal-product-head-row">
                    <div>
                        <h3 style="margin:0; font-size:22px; font-weight: 800; color:#1E293B;">${safeName}</h3>
                        <div style="color:#2563EB; font-weight:800; font-size:20px; margin-top: 4px; font-variant-numeric:tabular-nums;">${Number(p.price || 0).toLocaleString()} د.ع</div>
                        ${ratingSummary.count > 0 ? `
                            <div class="product-rating-line" style="margin-top:6px;">
                                <span class="stars-row">${renderStarIcons(ratingSummary.avg, 14)}</span>
                                <span>${ratingSummary.avg.toFixed(1)}</span>
                                <span class="product-rating-count">(${ratingSummary.count})</span>
                            </div>
                        ` : ''}
                    </div>
                    <button type="button" class="btn-report-inline" onclick="openReportModal('product', '${safeName}', '${p.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
                        <span>${t.reportProduct}</span>
                    </button>
                </div>
            </div>
            ${p.description ? `<p style="font-size:14px; color:#64748B; line-height:1.6; margin:0 0 12px;">${escapeHtml(p.description)}</p>` : ''}
            ${(p.tags && p.tags.length) ? `<div style="font-size:12px; font-weight:600; color:#64748B;">${p.tags.map(tag => escapeHtml(tag)).join(' · ')}</div>` : ''}
        </div>
    `;
    
    window.currentGalleryImage = images[0];
    window.updateModalGallery = (src) => {
        const main = document.getElementById('main-modal-img');
        if (main) main.src = src;
        window.currentGalleryImage = src;
        document.querySelectorAll('#modal-gallery + div img').forEach(img => {
            img.style.borderColor = (img.src === src || img.getAttribute('src') === src) ? '#2563EB' : '#E5EBF3';
        });
    };
    
    // Pre-fill location if user is logged in
    if(loggedInUser && loggedInUser.location) {
        document.getElementById('customer-location').value = loggedInUser.location;
    }

    renderProductReviews(p.id);
    document.getElementById('buy-modal').classList.remove('hidden');
}

function openContactModal() {
    updateContactModalTranslations();
    document.getElementById('contact-modal').classList.remove('hidden');
}

function closeContactModal() {
    document.getElementById('contact-modal').classList.add('hidden');
}

function openTermsModal() {
    updateTermsModalTranslations();
    document.getElementById('terms-modal').classList.remove('hidden');
}

function closeTermsModal() {
    document.getElementById('terms-modal').classList.add('hidden');
}

function updateContactModalTranslations() {
    const title = document.getElementById('contact-modal-title');
    const phoneLabel = document.getElementById('contact-phone-label');
    const emailLabel = document.getElementById('contact-email-label');
    const closeBtn = document.getElementById('contact-close-btn');
    const reportText = document.getElementById('contact-report-text');
    const t = TRANSLATIONS[currentLang];
    
    if (window.currentLang === 'ar') {
        if (title) title.innerText = "اتصل بنا";
        if (phoneLabel) phoneLabel.innerText = "رقم الهاتف";
        if (emailLabel) emailLabel.innerText = "البريد الإلكتروني";
        if (closeBtn) closeBtn.innerText = "إغلاق";
    } else {
        if (title) title.innerText = "Contact Us";
        if (phoneLabel) phoneLabel.innerText = "Phone Number";
        if (emailLabel) emailLabel.innerText = "Email Address";
        if (closeBtn) closeBtn.innerText = "Close";
    }
    if (reportText && t) reportText.innerText = t.reportViaWhatsapp;
}

// REVIEWS & STAR RATINGS
function initReviewsListener() {
    if (!db || reviewsUnsubscribe) return;
    reviewsUnsubscribe = onSnapshot(collection(db, "reviews"), (snapshot) => {
        const list = [];
        const ratingMap = {};
        snapshot.forEach(docSnap => {
            const r = { ...docSnap.data(), id: docSnap.id };
            list.push(r);
            if (r.productId) {
                if (!ratingMap[r.productId]) ratingMap[r.productId] = { sum: 0, count: 0 };
                ratingMap[r.productId].sum += Number(r.rating) || 0;
                ratingMap[r.productId].count += 1;
            }
        });
        ALL_REVIEWS = list;
        for (const k in PRODUCT_RATINGS) delete PRODUCT_RATINGS[k];
        Object.keys(ratingMap).forEach(pid => {
            const entry = ratingMap[pid];
            PRODUCT_RATINGS[pid] = {
                avg: entry.count ? entry.sum / entry.count : 0,
                count: entry.count
            };
        });

        renderFilteredProducts();
        if (currentView === 'shop' && activeShop) {
            renderProducts(activeShop.id);
        }
        if (currentProductToBuy && !document.getElementById('buy-modal')?.classList.contains('hidden')) {
            renderProductReviews(currentProductToBuy.id);
        }
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "reviews");
    });
}

function setReviewRating(val) {
    selectedReviewRating = Math.min(5, Math.max(1, Number(val) || 5));
    document.querySelectorAll('#review-star-picker .star-picker-btn').forEach((btn, idx) => {
        const isActive = idx + 1 <= selectedReviewRating;
        btn.classList.toggle('active', isActive);
        const poly = btn.querySelector('polygon');
        if (poly) {
            poly.setAttribute('fill', isActive ? '#F59E0B' : 'none');
            poly.setAttribute('stroke', isActive ? '#F59E0B' : '#CBD5E1');
        }
    });
}

function renderProductReviews(productId) {
    const t = TRANSLATIONS[currentLang];
    const titleEl = document.getElementById('reviews-section-title');
    const summaryEl = document.getElementById('reviews-summary-line');
    const composerEl = document.getElementById('review-composer-container');
    const listEl = document.getElementById('product-reviews-list');
    if (!composerEl || !listEl) return;

    if (titleEl) titleEl.innerText = t.reviewsTitle;

    const productReviews = ALL_REVIEWS
        .filter(r => r.productId === productId)
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    const summary = getProductRatingSummary(productId);
    if (summaryEl) {
        if (summary.count > 0) {
            const countWord = summary.count === 1 ? t.reviewCountSingle : t.reviewsCountLabel;
            summaryEl.innerHTML = `
                <span class="reviews-avg-score">${summary.avg.toFixed(1)}</span>
                <span class="stars-row">${renderStarIcons(summary.avg, 15)}</span>
                <span>(${summary.count} ${countWord})</span>
            `;
        } else {
            summaryEl.innerHTML = `<span>${t.noReviewsYet}</span>`;
        }
    }

    if (!loggedInUser) {
        composerEl.innerHTML = `
            <div class="review-login-prompt">
                <p>${t.loginToReview}</p>
                <button type="button" class="btn-outline" style="min-height: 36px; padding: 7px 14px; font-size: 13px;" onclick="closeModal(); showView('account');">${t.signInNow}</button>
            </div>
        `;
    } else {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            const active = i <= selectedReviewRating;
            starsHtml += `
                <button type="button" class="star-picker-btn ${active ? 'active' : ''}" onclick="setReviewRating(${i})" aria-label="${i} stars">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${active ? '#F59E0B' : 'none'}" stroke="${active ? '#F59E0B' : '#CBD5E1'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </button>
            `;
        }
        composerEl.innerHTML = `
            <div class="review-composer">
                <div class="review-composer-top">
                    <span class="review-composer-label">${t.yourRating}: <strong>${escapeHtml(loggedInUser.name || '')}</strong></span>
                    <div id="review-star-picker" class="star-picker">${starsHtml}</div>
                </div>
                <textarea id="review-comment-input" placeholder="${t.writeCommentPlaceholder}" style="min-height: 68px; margin-bottom: 10px;"></textarea>
                <button type="button" onclick="submitProductReview()" class="btn-primary" style="min-height: 40px; padding: 10px 18px;">${t.postReview}</button>
            </div>
        `;
    }

    if (productReviews.length === 0) {
        listEl.innerHTML = '';
        return;
    }

    listEl.innerHTML = productReviews.map(r => {
        const canDelete = (loggedInUser && loggedInUser.phone === r.userId) || isMasterLoggedIn;
        const dateStr = r.createdAt?.seconds
            ? new Date(r.createdAt.seconds * 1000).toLocaleDateString(currentLang === 'ar' ? 'ar-IQ' : 'en-US')
            : (r.displayDate || '');
        return `
            <div class="review-item">
                <div class="review-item-head">
                    <div>
                        <span class="review-author">${escapeHtml(r.userName || 'User')}</span>
                        ${dateStr ? `<span class="review-date"> · ${escapeHtml(dateStr)}</span>` : ''}
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="stars-row">${renderStarIcons(r.rating, 13)}</span>
                        ${canDelete ? `<button type="button" class="review-delete-btn" onclick="deleteProductReview('${r.id}')">${t.delete}</button>` : ''}
                    </div>
                </div>
                <p class="review-comment-text">${escapeHtml(r.comment || '')}</p>
            </div>
        `;
    }).join('');
}

async function submitProductReview() {
    if (!db || !currentProductToBuy) return;
    const t = TRANSLATIONS[currentLang];
    if (!loggedInUser) {
        showToast(t.loginToReview);
        closeModal();
        showView('account');
        return;
    }
    const commentEl = document.getElementById('review-comment-input');
    const comment = commentEl ? commentEl.value.trim() : '';
    if (!selectedReviewRating || selectedReviewRating < 1 || selectedReviewRating > 5) {
        showToast(t.selectStarFirst);
        return;
    }
    if (!comment) {
        showToast(t.writeCommentFirst);
        return;
    }

    const reviewData = {
        productId: currentProductToBuy.id,
        shopId: currentProductToBuy.shopId || '',
        userId: loggedInUser.phone,
        userName: loggedInUser.name || loggedInUser.phone,
        rating: Number(selectedReviewRating),
        comment: comment.slice(0, 600),
        displayDate: new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-IQ' : 'en-US'),
        createdAt: serverTimestamp()
    };

    try {
        await addDoc(collection(db, "reviews"), reviewData);
        if (commentEl) commentEl.value = '';
        selectedReviewRating = 5;
        showToast(t.reviewPosted);
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "reviews");
    }
}

async function deleteProductReview(reviewId) {
    if (!db) return;
    const t = TRANSLATIONS[currentLang];
    try {
        await deleteDoc(doc(db, "reviews", reviewId));
        showToast(t.reviewDeleted);
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `reviews/${reviewId}`);
    }
}

// WHATSAPP REPORT SYSTEM (07759530163)
function updateReportModalTranslations() {
    const t = TRANSLATIONS[currentLang];
    if (!t) return;
    const title = document.getElementById('report-modal-title');
    const sub = document.getElementById('report-modal-subtitle');
    const lblReason = document.getElementById('lbl-report-reason');
    const lblPhone = document.getElementById('lbl-report-phone');
    const lblDetails = document.getElementById('lbl-report-details');
    const detailsInput = document.getElementById('report-details');
    const btnText = document.getElementById('whatsapp-report-btn-text');
    const reasonSel = document.getElementById('report-reason');

    if (title) title.innerText = t.reportModalTitle;
    if (sub) sub.innerText = t.reportModalSubtitle;
    if (lblReason) lblReason.innerText = t.reportReasonLabel;
    if (lblPhone) lblPhone.innerText = t.reportPhoneLabel;
    if (lblDetails) lblDetails.innerText = t.reportDetailsLabel;
    if (detailsInput) detailsInput.placeholder = t.reportDetailsPlaceholder;
    if (btnText) btnText.innerText = t.sendOnWhatsapp;

    if (reasonSel && reasonSel.options.length >= 5) {
        if (currentLang === 'ar') {
            reasonSel.options[0].text = 'جودة المنتج أو عدم مطابقته';
            reasonSel.options[1].text = 'سعر خاطئ أو معلومات مضللة';
            reasonSel.options[2].text = 'صورة أو محتوى غير مناسب';
            reasonSel.options[3].text = 'مشكلة في الطلب أو التوصيل';
            reasonSel.options[4].text = 'مشكلة أخرى';
        } else {
            reasonSel.options[0].text = 'Product quality or mismatch';
            reasonSel.options[1].text = 'Wrong price or misleading info';
            reasonSel.options[2].text = 'Inappropriate photo or listing';
            reasonSel.options[3].text = 'Order or delivery issue';
            reasonSel.options[4].text = 'Other issue';
        }
    }
}

function openReportModal(type = 'general', targetName = '', targetId = '') {
    reportContext = { type, targetName, targetId };
    updateReportModalTranslations();

    const targetBox = document.getElementById('report-target-box');
    const phoneInput = document.getElementById('report-customer-phone');
    const detailsInput = document.getElementById('report-details');

    if (phoneInput && !phoneInput.value && loggedInUser?.phone) {
        phoneInput.value = loggedInUser.phone;
    }
    if (detailsInput) detailsInput.value = '';

    if (targetBox) {
        if (targetName) {
            const label = type === 'product'
                ? (currentLang === 'ar' ? 'الإبلاغ عن منتج:' : 'Reporting Product:')
                : (currentLang === 'ar' ? 'الإبلاغ عن متجر:' : 'Reporting Store:');
            targetBox.innerText = `${label} ${targetName}`;
            targetBox.classList.remove('hidden');
        } else {
            targetBox.innerText = '';
            targetBox.classList.add('hidden');
        }
    }

    updateWhatsAppReportLink();
    document.getElementById('report-modal')?.classList.remove('hidden');
}

function closeReportModal() {
    document.getElementById('report-modal')?.classList.add('hidden');
}

function updateWhatsAppReportLink() {
    const linkEl = document.getElementById('whatsapp-report-link');
    if (!linkEl) return;

    const reasonSel = document.getElementById('report-reason');
    const reasonText = reasonSel?.options[reasonSel.selectedIndex]?.text || reasonSel?.value || '';
    const phone = document.getElementById('report-customer-phone')?.value.trim() || loggedInUser?.phone || 'Not provided';
    const details = document.getElementById('report-details')?.value.trim() || 'No additional details';

    const lines = [
        'aneeq Customer Report',
        `Type: ${reportContext.type}`,
    ];
    if (reportContext.targetName) lines.push(`Target: ${reportContext.targetName} (${reportContext.targetId})`);
    lines.push(`Reason: ${reasonText}`);
    lines.push(`Customer Phone: ${phone}`);
    if (loggedInUser?.name) lines.push(`Customer Name: ${loggedInUser.name}`);
    lines.push(`Details: ${details}`);

    linkEl.href = `https://wa.me/${WHATSAPP_REPORT_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function updateTermsModalTranslations() {
    const title = document.getElementById('terms-modal-title');
    const content = document.getElementById('terms-content-area');
    const agreeBtn = document.getElementById('terms-agree-btn');
    
    if (window.currentLang === 'ar') {
        if (title) title.innerText = "شروط الخدمة";
        if (agreeBtn) agreeBtn.innerText = "موافق";
        if (content) {
            content.innerHTML = `
                <p style="margin-bottom: 12px; text-align: right; direction: rtl;">مرحباً بكم في <strong>أنيق</strong>. باستخدامك لمنصتنا، فإنك توافق على الالتزام بشروط الخدمة التالية.</p>
                <h4 style="font-weight: 700; margin-top: 15px; margin-bottom: 5px; color: #000; text-align: right; direction: rtl;">1. استخدام المنصة العام</h4>
                <p style="margin-bottom: 12px; text-align: right; direction: rtl;">يوفر أنيق سوقًا للمتاجر المستقلة لربط العلامات التجارية المستقلة والبائعين مباشرة مع الزبائن. تدار جميع المنتجات والعناصر والصفقات من قبل المتاجر المعنية بها.</p>
                <h4 style="font-weight: 700; margin-top: 15px; margin-bottom: 5px; color: #000; text-align: right; direction: rtl;">2. المعاملات المستقلة</h4>
                <p style="margin-bottom: 12px; text-align: right; direction: rtl;">يرسل الزبائن طلبات الشراء إلى المتاجر مباشرة. تقع مسؤولية تجهيز الطلبات، التوصيل، وجودة المنتجات على عاتق المتجر البائع بشكل كامل، حيث يمثل أنيق وسيطاً اتصالياً ميسراً وموثوقاً.</p>
                <h4 style="font-weight: 700; margin-top: 15px; margin-bottom: 5px; color: #000; text-align: right; direction: rtl;">3. مسؤولية الحساب</h4>
                <p style="margin-bottom: 12px; text-align: right; direction: rtl;">يجب على البائعين والزبائن تقديم معلومات دقيقة تشمل رقم هاتف حقيقي وموقع توصيل افتراضي. تقع على عاتقكم المسؤولية الكاملة في الحفاظ على سرية بيانات حساباتكم.</p>
                <h4 style="font-weight: 700; margin-top: 15px; margin-bottom: 5px; color: #000; text-align: right; direction: rtl;">4. السلوك المقبول والمنتجات</h4>
                <p style="margin-bottom: 12px; text-align: right; direction: rtl;">يتعهد البائعون بنشر منتجات أصلية، متوافقة مع القوانين، ومنتقاة بعناية. المنتجات المقلدة أو الاحتيالية قد يتم إلغاء تفعيلها من قبل إدارة النظام.</p>
                <h4 style="font-weight: 700; margin-top: 15px; margin-bottom: 5px; color: #000; text-align: right; direction: rtl;">5. الاتصال والاستفسارات</h4>
                <p style="margin-bottom: 12px; text-align: right; direction: rtl;">إذا كانت لديك أي استفسارات بخصوص هذه الشروط أو تحتاج للدعم، يمكنك التواصل مع منسق المنصة عبر الهاتف على الرقم <a href="tel:07759530163">07759530163</a> أو البريد الإلكتروني <a href="mailto:nsshshststs@gmail.com">nsshshststs@gmail.com</a>.</p>
            `;
            content.style.textAlign = 'right';
            content.style.direction = 'rtl';
        }
    } else {
        if (title) title.innerText = "Terms of Service";
        if (agreeBtn) agreeBtn.innerText = "I Agree";
        if (content) {
            content.innerHTML = `
                <p style="margin-bottom: 12px;">Welcome to <strong>aneeq</strong>. By accessing our platform, you agree to comply with and be bound by the following Terms of Service.</p>
                <h4 style="font-weight: 700; margin-top: 15px; margin-bottom: 5px; color: #000;">1. General Platform Usage</h4>
                <p style="margin-bottom: 12px;">aneeq provides an independent boutique marketplace connecting independent brands and sellers directly with customers. All listings, items, and transactions are managed by their respective stores.</p>
                <h4 style="font-weight: 700; margin-top: 15px; margin-bottom: 5px; color: #000;">2. Independent Transactions</h4>
                <p style="margin-bottom: 12px;">Customers request purchase orders directly from individual stores. The fulfillment, delivery, and quality of items are the sole responsibility of the selling store. aneeq acts as a connecting facilitator.</p>
                <h4 style="font-weight: 700; margin-top: 15px; margin-bottom: 5px; color: #000;">3. Account Responsibility</h4>
                <p style="margin-bottom: 12px;">Sellers and customers must provide accurate information, including their real phone number and default delivery location. You are solely responsible for maintaining the confidentiality of your account credentials.</p>
                <h4 style="font-weight: 700; margin-top: 15px; margin-bottom: 5px; color: #000;">4. Acceptable Behavior & Listings</h4>
                <p style="margin-bottom: 12px;">Sellers agree to only list authentic, legally compliant, and carefully curated fashion/athletic unique items. Copied, fraudulent, or general mass-market listings that violate copyright may be deactivated by the system administrators.</p>
                <h4 style="font-weight: 700; margin-top: 15px; margin-bottom: 5px; color: #000;">5. Contact and Enquiries</h4>
                <p style="margin-bottom: 12px;">If you have any questions about these terms or need dispute support, please reach out to our platform coordinator via phone at <a href="tel:07759530163">07759530163</a> or email at <a href="mailto:nsshshststs@gmail.com">nsshshststs@gmail.com</a>.</p>
            `;
            content.style.textAlign = 'left';
            content.style.direction = 'ltr';
        }
    }
}

function closeModal() {
    document.getElementById('buy-modal').classList.add('hidden');
}

async function submitOrder() {
    if (!db) return;
    const t = TRANSLATIONS[currentLang];
    const location = document.getElementById('customer-location').value;
    if(!location) return showToast(currentLang === 'ar' ? "يرجى إدخال الموقع" : "Please enter location");
    
    // Check if logged in to get user details
    if(!loggedInUser) {
        showToast(currentLang === 'ar' ? "يرجى تسجيل الدخول أولاً" : "Please login to place an order");
        showView('account');
        closeModal();
        return;
    }

    const shop = SHOPS.find(s => s.id === currentProductToBuy.shopId);
    const shopDisplayName = shopSettingsOverrides[currentProductToBuy.shopId]?.name || shop?.name || 'Unknown Store';
    
    const orderData = {
        productName: currentProductToBuy.name,
        price: Number(currentProductToBuy.price),
        shopName: shopDisplayName,
        shopId: currentProductToBuy.shopId,
        phone: loggedInUser.phone,
        customerName: loggedInUser.name,
        location: location,
        userId: loggedInUser.phone, // using phone as ID for simplicity in this demo logic
        time: new Date().toLocaleString(),
        status: 'pending',
        masterMessage: '',
        createdAt: serverTimestamp()
    };
    
    try {
        await addDoc(collection(db, "orders"), orderData);
        closeModal();
        showToast(TRANSLATIONS[currentLang].toastSent);
        
        // Update user location if it was empty
        if(!loggedInUser.location) {
            loggedInUser.location = location;
            saveProfileLocation(true);
        }

        // Redirect to Basket (Purchase Requests) to see the order
        setTimeout(() => showView('basket'), 1500);
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "orders");
    }
}

let toastHideTimer = null;
function showToast(message) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.innerText = message || TRANSLATIONS[currentLang]?.toastSent || "Request Sent to Master!";
    el.classList.remove('hidden');
    if (toastHideTimer) clearTimeout(toastHideTimer);
    toastHideTimer = setTimeout(() => {
        el.classList.add('hidden');
    }, 4000);
}

const EYE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`;

function togglePass(id) {
    const input = document.getElementById(id);
    if (!input) return;
    
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    
    const btn = input.nextElementSibling;
    if (btn && btn.tagName === 'BUTTON') {
        btn.innerHTML = isPassword ? EYE_OFF_ICON : EYE_ICON;
    }
}

// ACCOUNT & AUTH
function toggleAuthMode(mode) {
    console.log("Toggling auth mode to:", mode);
    const loginTab = document.getElementById('tab-login');
    const regTab = document.getElementById('tab-register');
    const loginForm = document.getElementById('form-login');
    const regForm = document.getElementById('form-register');
    
    if(mode === 'login') {
        if (loginTab) {
            loginTab.style.fontWeight = '700';
            loginTab.style.borderBottom = '2px solid #2563EB';
            loginTab.style.color = '#1E293B';
        }
        if (regTab) {
            regTab.style.fontWeight = '500';
            regTab.style.borderBottom = 'none';
            regTab.style.color = '#64748B';
        }
        if (loginForm) loginForm.classList.remove('hidden');
        if (regForm) regForm.classList.add('hidden');
    } else {
        if (regTab) {
            regTab.style.fontWeight = '700';
            regTab.style.borderBottom = '2px solid #2563EB';
            regTab.style.color = '#1E293B';
        }
        if (loginTab) {
            loginTab.style.fontWeight = '500';
            loginTab.style.borderBottom = 'none';
            loginTab.style.color = '#64748B';
        }
        if (regForm) regForm.classList.remove('hidden');
        if (loginForm) loginForm.classList.add('hidden');
    }
}

async function handleRegister() {
    console.log("handleRegister started");
    if (!db) {
        showToast(currentLang === 'ar' ? "خطأ في النظام: قاعدة البيانات غير متصلة. يرجى التحديث." : "System error: Database not connected. Please refresh.");
        return;
    }
    
    // We don't block on isAuthReady anymore as Firestore handles its own readiness,
    // but we log status for debugging.
    console.log("Current auth ready state:", isAuthReady);

    const name = document.getElementById('reg-name').value.trim();
    const phoneInput = document.getElementById('reg-phone').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();
    
    if(!name || !phoneInput || !pass) {
        showToast(currentLang === 'ar' ? 'يرجى ملء جميع الحقول' : "Please fill all fields");
        return;
    }
    
    let phone = normalizePhone(phoneInput);
    if (phone.length < 10) {
        showToast(currentLang === 'ar' ? 'رقم هاتف غير صالح' : "Invalid phone number.");
        return;
    }
    
    console.log("Attempting to register user with phone:", phone);
    
    try {
        const userRef = doc(db, "users", phone);
        console.log("Checking if user exists...");
        const userDoc = await getDoc(userRef);
        
        if(userDoc.exists()) {
            console.log("User already exists");
            showToast(currentLang === 'ar' ? 'رقم الهاتف مسجل بالفعل' : "Phone number already registered.");
            return;
        }
        
        const userData = {
            name,
            phone,
            password: pass,
            location: "",
            createdAt: serverTimestamp()
        };
        
        console.log("Creating user doc...");
        await setDoc(userRef, userData);
        console.log("User registered successfully");
        showToast(currentLang === 'ar' ? 'تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول' : "Account created successfully! Please login.");
        
        // Reset fields
        document.getElementById('reg-name').value = '';
        document.getElementById('reg-phone').value = '';
        document.getElementById('reg-pass').value = '';
        
        setTimeout(() => toggleAuthMode('login'), 2000);
    } catch (e) {
        console.error("Critical registration error:", e);
        handleFirestoreError(e, OperationType.WRITE, 'users');
        showToast("Error: " + (e.code || e.message));
    }
}

async function handleLogin() {
    console.log("handleLogin started");
    if (!db) {
        showToast(currentLang === 'ar' ? "خطأ في النظام: قاعدة البيانات غير متصلة. يرجى التحديث." : "System error: Database not connected. Please refresh.");
        return;
    }
    
    // Non-blocking log
    console.log("Auth ready during login:", isAuthReady);

    const phoneInput = document.getElementById('login-phone').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    
    if(!phoneInput || !pass) {
        showToast(currentLang === 'ar' ? 'يرجى إدخال الهاتف وكلمة المرور' : "Please enter phone and password");
        return;
    }
    
    let phone = normalizePhone(phoneInput);
    console.log("Attempting login for:", phone);
    
    try {
        const userDoc = await getDoc(doc(db, "users", phone));
        if(userDoc.exists()) {
            const data = userDoc.data();
            if(data.password === pass) {
                console.log("Password match for user");
                loggedInUser = data;
                localStorage.setItem('aneeq_user', JSON.stringify(data));
                
                // Also check if this user is a seller
                if (data.shopId) {
                    loggedInShopId = data.shopId;
                } else {
                    const sellerShop = SHOPS.find(s => s.pass === pass && s.phone === phone);
                    if(sellerShop) {
                        loggedInShopId = sellerShop.id;
                        // Persist link to user doc for future logins
                        updateDoc(doc(db, "users", phone), { shopId: loggedInShopId }).catch(console.error);
                        loggedInUser.shopId = loggedInShopId;
                    }
                }
                
                if (loggedInShopId) {
                    localStorage.setItem('aneeq_seller_id', loggedInShopId);
                }
                
                loginSuccess();
                return;
            } else {
                console.log("Password mismatch");
            }
        } else {
            console.log("User not found in Firestore users coll");
        }
        
        const legacyShop = SHOPS.find(s => s.pass === pass && s.phone === phone);
        if(legacyShop) {
             console.log("Login matched legacy shop pass and phone");
             loggedInShopId = legacyShop.id;
             loggedInUser = { name: legacyShop.name, phone: phone, location: "", shopId: loggedInShopId };
             localStorage.setItem('aneeq_user', JSON.stringify(loggedInUser));
             localStorage.setItem('aneeq_seller_id', loggedInShopId);
             
             // Create user doc so phone/pass persist
             setDoc(doc(db, "users", phone), {
                 name: legacyShop.name,
                 phone: phone,
                 password: pass,
                 location: "",
                 shopId: loggedInShopId,
                 createdAt: serverTimestamp()
             }).catch(console.error);

             loginSuccess();
             return;
        }

        showToast(currentLang === 'ar' ? 'هاتف أو كلمة مرور غير صالحة' : "Invalid phone or password.");
    } catch (e) {
        console.error("Critical login error:", e);
        handleFirestoreError(e, OperationType.GET, 'users');
        showToast("Login Error: " + (e.code || e.message));
    }
}

function normalizePhone(phone) {
    // Remove all non-numeric characters except +
    let clean = phone.replace(/[^\d+]/g, '');
    
    // If it starts with 0 and isn't + prefixed, replace with 964
    if(clean.startsWith('0')) {
        clean = '964' + clean.substring(1);
    }
    
    // Ensure it has 964 prefix if it doesn't have + or 964
    if(!clean.startsWith('+') && !clean.startsWith('964')) {
        clean = '964' + clean;
    }
    
    // Ensure + prefix
    if(!clean.startsWith('+')) {
        clean = '+' + clean;
    }
    
    return clean;
}

function loginSuccess() {
    document.getElementById('account-auth').classList.add('hidden');
    document.getElementById('account-profile').classList.remove('hidden');
    updateProfileUI();
    
    if(loggedInShopId) {
        const sellerTools = document.getElementById('seller-tools');
        if (sellerTools) {
            sellerTools.classList.remove('hidden');
        }
        renderAdminInventory();
    }
    
    // Refresh basket tracking if view is active
    if (currentView === 'basket') {
        handleBasketAutoTrack();
    }
    
    showToast(currentLang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Logged in successfully!');
}

function updateProfileUI() {
    if(!loggedInUser) return;
    document.getElementById('account-auth').classList.add('hidden');
    document.getElementById('account-profile').classList.remove('hidden');
    
    document.getElementById('user-display-name').innerText = loggedInUser.name;
    document.getElementById('profile-info-display').innerHTML = `
        <p style="margin-bottom: 5px;"><strong>Phone:</strong> ${loggedInUser.phone}</p>
        <p style="font-size: 13px; color: #666;">Account active.</p>
    `;
    if(loggedInUser.location) {
        document.getElementById('profile-location').value = loggedInUser.location;
    }

    const sellerTools = document.getElementById('seller-tools');
    if (loggedInShopId) {
        if (sellerTools) sellerTools.classList.remove('hidden');
        renderAdminInventory();

        const settings = shopSettingsOverrides[loggedInShopId] || {};
        const shop = SHOPS.find(s => s.id === loggedInShopId);
        
        const currentName = settings.name || shop?.name || "My Shop";
        const logo = settings.pendingLogo || settings.logo || shop?.logo || defaultShopLogo;
        const hero = settings.pendingHero || settings.hero || shop?.hero || defaultShopHero;
        
        document.getElementById('store-name-input').value = currentName;
        document.getElementById('store-phone-input').value = loggedInUser.phone;
        document.getElementById('store-pass-input').value = loggedInUser.password || '';
        
        const lpc = document.getElementById('logo-preview-container');
        const hpc = document.getElementById('hero-preview-container');
        if (lpc) lpc.innerHTML = `<img src="${logo}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        if (hpc) hpc.innerHTML = `<img src="${hero}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">`;

        const t = TRANSLATIONS[currentLang];
        const logoStatusEl = document.getElementById('logo-approval-status');
        if (logoStatusEl) {
            if (settings.logoStatus === 'pending' && settings.pendingLogo) {
                logoStatusEl.innerText = t.logoPendingNote;
                logoStatusEl.className = 'upload-approval-note is-pending';
            } else if (settings.logoStatus === 'rejected') {
                logoStatusEl.innerText = t.logoRejectedNote;
                logoStatusEl.className = 'upload-approval-note is-rejected';
            } else {
                logoStatusEl.innerText = '';
                logoStatusEl.className = 'upload-approval-note hidden';
            }
        }

        const heroStatusEl = document.getElementById('hero-approval-status');
        if (heroStatusEl) {
            if (settings.heroStatus === 'pending' && settings.pendingHero) {
                heroStatusEl.innerText = t.heroPendingNote;
                heroStatusEl.className = 'upload-approval-note is-pending';
            } else if (settings.heroStatus === 'rejected') {
                heroStatusEl.innerText = t.heroRejectedNote;
                heroStatusEl.className = 'upload-approval-note is-rejected';
            } else {
                heroStatusEl.innerText = '';
                heroStatusEl.className = 'upload-approval-note hidden';
            }
        }

        const removeLogoBtn = document.getElementById('remove-logo-btn');
        const removeHeroBtn = document.getElementById('remove-hero-btn');
        if (removeLogoBtn) {
            if (settings.logo || settings.pendingLogo) removeLogoBtn.classList.remove('hidden');
            else removeLogoBtn.classList.add('hidden');
        }
        if (removeHeroBtn) {
            if (settings.hero || settings.pendingHero) removeHeroBtn.classList.remove('hidden');
            else removeHeroBtn.classList.add('hidden');
        }
    } else {
        if (sellerTools) sellerTools.classList.add('hidden');
    }
}

async function refreshUserProfile() {
    if (!db || !loggedInUser || !loggedInUser.phone) return;
    try {
        const userDoc = await getDoc(doc(db, "users", loggedInUser.phone));
        if (userDoc.exists()) {
            const data = userDoc.data();
            console.log("Profile auto-refreshed from DB:", data);
            
            // Sync loggedInUser and localStorage
            loggedInUser = { ...loggedInUser, ...data };
            localStorage.setItem('aneeq_user', JSON.stringify(loggedInUser));
            
            // Check if they are now a seller or if shopId was updated/added
            if (data.shopId) {
                loggedInShopId = data.shopId;
                localStorage.setItem('aneeq_seller_id', loggedInShopId);
            } else {
                // Also double check if SHOPS has them
                const sellerShop = SHOPS.find(s => s.phone === loggedInUser.phone);
                if (sellerShop) {
                    loggedInShopId = sellerShop.id;
                    localStorage.setItem('aneeq_seller_id', loggedInShopId);
                    // Update user doc in Firebase too
                    updateDoc(doc(db, "users", loggedInUser.phone), { shopId: loggedInShopId }).catch(console.error);
                }
            }
            
            // Render the updated profile
            updateProfileUI();
        }
    } catch (e) {
        console.error("Error refreshing user profile:", e);
    }
}

async function saveProfileLocation(silent = false) {
    if(!db || !loggedInUser) return;
    const loc = document.getElementById('profile-location').value.trim();
    
    try {
        await updateDoc(doc(db, "users", loggedInUser.phone), { location: loc });
        loggedInUser.location = loc;
        localStorage.setItem('aneeq_user', JSON.stringify(loggedInUser));
        if(!silent) showToast(currentLang === 'ar' ? "تم تحديث الموقع!" : "Location updated!");
    } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, 'users');
        showToast("Error updating location");
    }
}

// SELLER ADMIN
function setupAdminSelect() {
    const sel = document.getElementById('admin-shop-select');
    if(sel) sel.style.display = 'none';
}

function handleSellerLogin() {
    showView('account');
    if (loggedInUser && !loggedInShopId) {
        showToast(currentLang === 'ar' ? 'أنت مسجل دخول كمستخدم. للوصول للبوابة، استخدم مفتاح المتجر.' : "Logged in as user. To access portal, use store key as password.");
    }
}

function logout() {
    loggedInShopId = null;
    loggedInUser = null;
    localStorage.removeItem('aneeq_seller_id');
    localStorage.removeItem('aneeq_user');
    document.getElementById('account-auth').classList.remove('hidden');
    document.getElementById('account-profile').classList.add('hidden');
    document.getElementById('seller-tools').classList.add('hidden');
    
    document.getElementById('login-phone').value = '';
    document.getElementById('login-pass').value = '';
}

let adminInventoryUnsubscribe = null;

function renderAdminInventory() {
    if (!db) return;
    if (adminInventoryUnsubscribe) adminInventoryUnsubscribe();
    const t = TRANSLATIONS[currentLang];
    const list = document.getElementById('admin-inventory-list');
    
    const q = query(collection(db, "inventory"), where("shopId", "==", loggedInShopId));
    adminInventoryUnsubscribe = onSnapshot(q, (snapshot) => {
        let products = [];
        snapshot.forEach(docSnap => {
            const item = { ...docSnap.data(), id: docSnap.id };
            PRODUCT_CACHE[item.id] = item;
            products.push(item);
        });

        list.innerHTML = products.map((p) => {
            const statuses = getProductPhotoStatuses(p);
            const approvedCount = statuses.filter(s => s === 'approved').length;
            const pendingCount = statuses.filter(s => s === 'pending').length;
            let statusCls = 'is-approved';
            let statusText = t.approvedLabel;
            if (pendingCount > 0 && approvedCount === 0) {
                statusCls = 'is-pending';
                statusText = `${t.pendingLabel} (${pendingCount})`;
            } else if (pendingCount > 0 && approvedCount > 0) {
                statusCls = 'is-pending';
                statusText = `${approvedCount}/${statuses.length} ${t.approvedLabel} · ${pendingCount} ${t.pendingLabel}`;
            } else if (approvedCount === 0) {
                statusCls = 'is-rejected';
                statusText = t.rejectedLabel;
            }
            return `
            <div style="display:flex; align-items:center; gap: 14px; padding:14px 0; border-bottom:1px solid #E5EBF3;">
                <img src="${p.image || defaultShopHero}" onclick="openBuyModal('${p.id}', true)" style="width:48px; height:48px; border-radius:12px; object-fit:cover; border: 1px solid #E5EBF3; cursor:pointer;" onerror="this.src='${defaultShopHero}'">
                <div style="flex:1; min-width:0;">
                    <div style="font-weight:700; font-size:14px; color:#1E293B; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(p.name)}</div>
                    <div style="font-size:13px; color:#2563EB; font-weight:700; font-variant-numeric:tabular-nums;">${Number(p.price || 0).toLocaleString()} د.ع</div>
                    <div class="inv-approval-status ${statusCls}">${statusText}</div>
                    ${(p.tags && p.tags.length) ? `<div style="font-size:11px; color:#64748B; margin-top:2px;">${p.tags.map(tag => escapeHtml(tag)).join(' · ')}</div>` : ''}
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="editProduct('${p.id}')" style="color:#1D4ED8; border:1px solid #BFDBFE; background:#EFF6FF; border-radius:8px; cursor:pointer; font-weight:700; font-size:12px; padding: 6px 12px;">${t.edit}</button>
                    <button onclick="deleteProduct('${p.id}')" style="color:#EF4444; border:1px solid #FEE2E2; background:#FEF2F2; border-radius:8px; cursor:pointer; font-weight:700; font-size:12px; padding: 6px 12px;">${t.delete}</button>
                </div>
            </div>
        `}).join('') || `<p style="color:#64748B; text-align:center; padding:36px;">${t.noProducts}</p>`;
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "inventory");
    });
}

// UTILITIES
async function compressImage(base64Str, maxWidth = 1024, quality = 0.6) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Fill white background for JPEGs (transparency fix)
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, width, height);
            
            ctx.drawImage(img, 0, 0, width, height);
            // Using image/jpeg for smaller file sizes compared to png
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(base64Str);
    });
}

let currentBase64Images = []; // Array for multiple photos
let currentProductTags = []; // Interactive tags for new product
let currentEditProductTags = []; // Interactive tags for editing product
let imageCropQueue = []; // Queue for multiple image cropping
let currentStoreLogo = null;
let currentStoreHero = null;
let currentMasterShopLogo = null;
let currentMasterHero = null;

let cropperInstance = null;
let cropperType = null; // 'product', 'logo', 'hero'

function openCropper(imageSrc, type) {
    cropperType = type;
    const modal = document.getElementById('crop-modal');
    const image = document.getElementById('cropper-image');
    image.src = imageSrc;
    
    modal.classList.remove('hidden');
    modal.style.display = 'flex'; // Explicit flex for showing
    
    if (cropperInstance) {
        cropperInstance.destroy();
        cropperInstance = null;
    }
    
    // Set aspect ratio based on type
    let aspectRatio = 1; // Default square (logo/product/masterLogo)
    if (type === 'hero' || type === 'masterHero') {
        aspectRatio = 16 / 7; // Enhanced wide ratio for high-end wide headers
    }
    
    cropperInstance = new Cropper(image, {
        aspectRatio: aspectRatio,
        viewMode: 1, // Focuses cropped box constraint on the image bounds beautifully
        autoCropArea: 0.9,
        background: false,
        responsive: true,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false
    });
}

function closeCropModal() {
    const modal = document.getElementById('crop-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
    if (cropperInstance) {
        cropperInstance.destroy();
        cropperInstance = null;
    }
}

function zoomCropper(ratio) {
    if (cropperInstance) {
        cropperInstance.zoom(ratio);
    }
}

function rotateCropper(degree) {
    if (cropperInstance) {
        cropperInstance.rotate(degree);
    }
}

async function applyCrop() {
    if (!cropperInstance) return;
    
    const canvas = cropperInstance.getCroppedCanvas();
    const croppedImage = canvas.toDataURL('image/jpeg', 0.8);
    
    if (cropperType === 'product') {
        currentBase64Images.push(croppedImage);
        renderProductPreviews();
        closeCropModal();
        // Check if more images in queue
        processNextCrop();
    } else if (cropperType === 'logo') {
        currentStoreLogo = croppedImage;
        const preview = document.getElementById('logo-preview-container');
        if (preview) {
            preview.innerHTML = `<img src="${croppedImage}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        }
        const removeBtn = document.getElementById('remove-logo-btn');
        if (removeBtn) removeBtn.classList.remove('hidden');
    } else if (cropperType === 'hero') {
        currentStoreHero = croppedImage;
        const preview = document.getElementById('hero-preview-container');
        if (preview) {
            preview.innerHTML = `<img src="${croppedImage}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">`;
        }
        const removeBtn = document.getElementById('remove-hero-btn');
        if (removeBtn) removeBtn.classList.remove('hidden');
    } else if (cropperType === 'masterLogo') {
        currentMasterShopLogo = croppedImage;
        const img = document.getElementById('m-shop-logo-img');
        if (img) img.src = croppedImage;
    } else if (cropperType === 'masterHero') {
        currentMasterHero = croppedImage;
        const img = document.getElementById('m-shop-hero-img');
        if (img) img.src = croppedImage;
    }
    
    closeCropModal();
}

function removeStoreImage(type) {
    if (type === 'logo') {
        currentStoreLogo = ""; // Signal removal/reset in save
        const preview = document.getElementById('logo-preview-container');
        const shop = SHOPS.find(s => s.id === loggedInShopId);
        const fallbackLogo = shop?.logo || defaultShopLogo;
        if (preview) preview.innerHTML = `<img src="${fallbackLogo}" style="width:100%; height:100%; object-fit:cover; border-radius:50%; opacity: 0.5;">`;
        const btn = document.getElementById('remove-logo-btn');
        if (btn) btn.classList.add('hidden');
    } else if (type === 'hero') {
        currentStoreHero = ""; // Signal removal/reset in save
        const preview = document.getElementById('hero-preview-container');
        const shop = SHOPS.find(s => s.id === loggedInShopId);
        const fallbackHero = shop?.hero || defaultShopHero;
        if (preview) preview.innerHTML = `<img src="${fallbackHero}" style="width:100%; height:100%; object-fit:cover; border-radius:12px; opacity: 0.5;">`;
        const btn = document.getElementById('remove-hero-btn');
        if (btn) btn.classList.add('hidden');
    }
}

async function previewStoreImage(input, type) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            openCropper(e.target.result, type);
        };
        reader.readAsDataURL(file);
    }
}

async function saveStoreSettings() {
    const newName = document.getElementById('store-name-input').value.trim();
    const newPhone = normalizePhone(document.getElementById('store-phone-input').value.trim());
    const newPass = document.getElementById('store-pass-input').value.trim();
    
    if (!loggedInShopId || !loggedInUser) return;

    const btn = document.querySelector('.admin-settings-card .btn-primary');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = currentLang === 'ar' ? 'جاري الحفظ...' : 'Saving...';

    try {
        const updateData = {
            shopId: loggedInShopId,
            updatedAt: serverTimestamp()
        };
        if (newName) updateData.name = newName;
        let hasPendingPhotoUpload = false;

        if (currentStoreLogo === "") {
            updateData.logo = "";
            updateData.pendingLogo = "";
            updateData.logoStatus = "approved";
        } else if (currentStoreLogo) {
            updateData.pendingLogo = currentStoreLogo;
            updateData.logoStatus = "pending";
            hasPendingPhotoUpload = true;
        }

        if (currentStoreHero === "") {
            updateData.hero = "";
            updateData.pendingHero = "";
            updateData.heroStatus = "approved";
        } else if (currentStoreHero) {
            updateData.pendingHero = currentStoreHero;
            updateData.heroStatus = "pending";
            hasPendingPhotoUpload = true;
        }
        
        // Update user profile in Firestore
        const oldPhone = loggedInUser.phone;
        const userUpdates = {
            name: newName || loggedInUser.name,
            password: newPass || loggedInUser.password,
            shopId: loggedInShopId
        };
        
        // If phone changed, it's a bit more complex since ID is the phone
        if (newPhone !== oldPhone && newPhone.length >= 10) {
             const newUserRef = doc(db, "users", newPhone);
             const newUserDoc = await getDoc(newUserRef);
             if (newUserDoc.exists()) {
                 showToast(currentLang === 'ar' ? "رقم الهاتف الجديد مستخدم بالفعل" : "New phone number is already in use.");
                 throw new Error("Phone occupied");
             }
             
             // Transfer data to new phone doc
             const fullNewUserData = { ...loggedInUser, ...userUpdates, phone: newPhone };
             await setDoc(newUserRef, fullNewUserData);
             await deleteDoc(doc(db, "users", oldPhone));
             loggedInUser = fullNewUserData;
        } else {
             await updateDoc(doc(db, "users", oldPhone), userUpdates);
             loggedInUser = { ...loggedInUser, ...userUpdates };
        }
        
        localStorage.setItem('aneeq_user', JSON.stringify(loggedInUser));

        await setDoc(doc(db, "shop_settings", loggedInShopId), updateData, { merge: true });
        
        // Update local cache immediately for responsiveness
        shopSettingsOverrides[loggedInShopId] = {
            ...shopSettingsOverrides[loggedInShopId],
            ...updateData
        };

        // Update in-memory SHOPS for current session
        const shopIdx = SHOPS.findIndex(s => s.id === loggedInShopId);
        if (shopIdx !== -1) {
            SHOPS[shopIdx].name = newName || SHOPS[shopIdx].name;
            if (currentStoreLogo === "") SHOPS[shopIdx].logo = defaultShopLogo;
            if (currentStoreHero === "") SHOPS[shopIdx].hero = defaultShopHero;
            SHOPS[shopIdx].phone = loggedInUser.phone;
            SHOPS[shopIdx].pass = loggedInUser.password;
        }

        const t = TRANSLATIONS[currentLang];
        showToast(hasPendingPhotoUpload
            ? t.settingsSavedApproval
            : (currentLang === 'ar' ? 'تم تحديث الإعدادات!' : "Store settings updated!"));
        currentStoreLogo = null;
        currentStoreHero = null;
        
        updateProfileUI();
    } catch (e) {
        if (e.message !== "Phone occupied") {
            handleFirestoreError(e, OperationType.WRITE, 'shop_settings');
            showToast("Error saving settings");
        }
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
}

async function previewProductImage(input) {
    const files = Array.from(input.files);
    
    if (files.length > 0) {
        for (const file of files) {
            if (currentBase64Images.length + imageCropQueue.length >= 5) break; 
            imageCropQueue.push(file);
        }
        
        if (imageCropQueue.length > 0 && !document.getElementById('crop-modal').classList.contains('hidden') === false) {
            processNextCrop();
        }
    }
    input.value = ''; // Reset input so same file can be selected again
}

function processNextCrop() {
    if (imageCropQueue.length === 0) return;
    
    const file = imageCropQueue.shift();
    const reader = new FileReader();
    reader.onload = function(e) {
        openCropper(e.target.result, 'product');
    };
    reader.readAsDataURL(file);
}

function renderProductPreviews() {
    const preview = document.getElementById('product-preview');
    if (!preview) return;
    preview.innerHTML = currentBase64Images.map((img, idx) => `
        <div style="position: relative; width: 80px; height: 80px;">
            <img src="${img}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;">
            <button onclick="removeProductPreviewImage(${idx})" style="position: absolute; top: -5px; right: -5px; background: #ff4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">&times;</button>
            ${idx === 0 ? '<span style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; font-size: 8px; text-align: center; border-radius: 0 0 8px 8px;">Main</span>' : ''}
        </div>
    `).join('');
}

function removeProductPreviewImage(index) {
    currentBase64Images.splice(index, 1);
    renderProductPreviews();
}

function addTagToProduct(type) {
    const inputId = type === 'new' ? 'p-tag-input' : 'edit-p-tag-input';
    const input = document.getElementById(inputId);
    const val = input.value.trim();
    if (!val) return;
    
    if (type === 'new') {
        if (!currentProductTags.includes(val)) currentProductTags.push(val);
    } else {
        if (!currentEditProductTags.includes(val)) currentEditProductTags.push(val);
    }
    
    input.value = '';
    renderTagPills(type);
}

function removeTagFromProduct(type, index) {
    if (type === 'new') {
        currentProductTags.splice(index, 1);
    } else {
        currentEditProductTags.splice(index, 1);
    }
    renderTagPills(type);
}

function renderTagPills(type) {
    const containerId = type === 'new' ? 'p-tags-container' : 'edit-p-tags-container';
    const tags = type === 'new' ? currentProductTags : currentEditProductTags;
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = tags.map((t, idx) => `
        <span class="product-tag" style="display: inline-flex; align-items: center; gap: 8px; cursor: default;">
            ${t}
            <span onclick="removeTagFromProduct('${type}', ${idx})" style="cursor: pointer; font-size: 16px; font-weight: 600; line-height: 1; border-inline-start: 1px solid #BFDBFE; padding-inline-start: 6px;">&times;</span>
        </span>
    `).join('');
}

async function addNewProduct() {
    if (!db) return;
    const t = TRANSLATIONS[currentLang];
    const name = document.getElementById('p-name').value;
    const cat = document.getElementById('p-cat').value;
    const price = document.getElementById('p-price').value;
    const desc = document.getElementById('p-desc').value;
    const imgs = currentBase64Images;
    
    if(!name || !price || imgs.length === 0) return showToast(t.fillFields);
    
    const productData = {
        name,
        category: cat || 'General',
        price: Number(price),
        description: desc || "",
        tags: currentProductTags,
        image: imgs[0], // primary image
        images: imgs,   // full gallery
        photoStatuses: imgs.map(() => 'pending'),
        photoStatus: 'pending',
        shopId: loggedInShopId,
        createdAt: serverTimestamp()
    };
    try {
        await addDoc(collection(db, "inventory"), productData);
        document.getElementById('p-name').value = '';
        document.getElementById('p-cat').value = '';
        document.getElementById('p-price').value = '';
        document.getElementById('p-desc').value = '';
        document.getElementById('p-tag-input').value = '';
        currentProductTags = [];
        renderTagPills('new');
        document.getElementById('product-preview').innerHTML = '';
        currentBase64Images = [];
        showToast(t.pendingApprovalMsg);
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "inventory");
    }
}

async function deleteProduct(productId) {
    const t = TRANSLATIONS[currentLang];
    if(!confirm(currentLang === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : "Are you sure you want to delete this product?")) return;
    try {
        await deleteDoc(doc(db, "inventory", productId));
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `inventory/${productId}`);
    }
}

async function editProduct(productId) {
    try {
        const productSnap = await getDoc(doc(db, "inventory", productId));
        if (productSnap.exists()) {
            const p = productSnap.data();
            document.getElementById('edit-p-id').value = productId;
            document.getElementById('edit-p-name').value = p.name || '';
            document.getElementById('edit-p-cat').value = p.category || 'General';
            document.getElementById('edit-p-price').value = p.price || '';
            document.getElementById('edit-p-desc').value = p.description || '';
            currentEditProductTags = p.tags || [];
            renderTagPills('edit');
            
            document.getElementById('product-edit-modal').classList.remove('hidden');
        }
    } catch (error) {
        handleFirestoreError(error, OperationType.GET, `inventory/${productId}`);
    }
}

function closeProductEditModal() {
    document.getElementById('product-edit-modal').classList.add('hidden');
}

async function saveProductEdit() {
    if (!db) return;
    const id = document.getElementById('edit-p-id').value;
    const name = document.getElementById('edit-p-name').value.trim();
    const cat = document.getElementById('edit-p-cat').value;
    const price = document.getElementById('edit-p-price').value;
    const desc = document.getElementById('edit-p-desc').value.trim();
    
    if(!name || !price) return showToast(TRANSLATIONS[currentLang].fillFields);
    
    try {
        const updateData = {
            name,
            category: cat,
            price: Number(price),
            description: desc,
            tags: currentEditProductTags,
            updatedAt: serverTimestamp()
        };
        await updateDoc(doc(db, "inventory", id), updateData);
        closeProductEditModal();
        showToast(currentLang === 'ar' ? "تم تحديث المنتج!" : "Product Updated!");
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `inventory/${id}`);
        showToast("Error updating product");
    }
}

function zoomImage(src) {
    const modal = document.getElementById('zoom-modal');
    const img = document.getElementById('zoom-image');
    if (modal && img) {
        img.src = src;
        modal.classList.remove('hidden');
    }
}

function closeZoomModal() {
    const modal = document.getElementById('zoom-modal');
    if (modal) modal.classList.add('hidden');
}

function masterLogout() {
    isMasterLoggedIn = false;
    localStorage.removeItem('aneeq_master_session');
    document.getElementById('master-login').classList.remove('hidden');
    document.getElementById('master-dashboard').classList.add('hidden');
    document.getElementById('master-pass').value = '';
}

// BASKET & TRACKING
function handleBasketAutoTrack() {
    if (!db) return;
    const t = TRANSLATIONS[currentLang];
    const authPrompt = document.getElementById('basket-auth-prompt');
    const resultsDiv = document.getElementById('basket-results');
    const desc = document.getElementById('basket-desc');

    if (!loggedInUser) {
        authPrompt.classList.remove('hidden');
        resultsDiv.classList.add('hidden');
        desc.innerText = currentLang === 'ar' ? 'يرجى تسجيل الدخول لعرض طلبات الشراء.' : 'Please login to view your purchase requests.';
        return;
    }

    authPrompt.classList.add('hidden');
    resultsDiv.classList.remove('hidden');
    desc.innerText = currentLang === 'ar' ? 'عرض وتتبع طلبات الشراء الحالية.' : 'View and track your current purchase requests.';

    if (trackOrdersUnsubscribe) trackOrdersUnsubscribe();
    
    const phone = loggedInUser.phone;
    const listDiv = document.getElementById('customer-orders-list');
    
    const q = query(collection(db, "orders"), where("phone", "==", phone));
    trackOrdersUnsubscribe = onSnapshot(q, (snapshot) => {
        let customerOrders = [];
        snapshot.forEach(doc => customerOrders.push({ ...doc.data(), id: doc.id }));

        if(customerOrders.length === 0) {
            listDiv.innerHTML = `<p style="text-align:center; padding:40px; color:#999; background:white; border-radius:15px; border: 1px solid #eee;">${t.noOrdersFound}</p>`;
        } else {
            customerOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            listDiv.innerHTML = customerOrders.map(o => {
                const statusColor = o.status === 'Accepted' ? '#1D4ED8' : (o.status === 'Refused' ? '#EF4444' : '#D97706');
                const statusBg = o.status === 'Accepted' ? '#EFF6FF' : (o.status === 'Refused' ? '#FEF2F2' : '#FFFBEB');
                let displayStatus = (o.status === 'pending' || !o.status) ? t.pending : o.status;
                if(o.status === 'Accepted') displayStatus = t.statusAccepted;
                if(o.status === 'Refused') displayStatus = t.statusRefused;

                return `
                    <div class="order-item" style="flex-direction: column; align-items: stretch; gap: 12px; border: 1px solid #E5EBF3; border-radius: 18px; padding: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                            <div>
                                <strong style="font-size: 16px; color: #1E293B;">${o.productName}</strong><br>
                                <small style="color: #64748B;">${o.shopName} · ${o.time}</small>
                            </div>
                            <span style="background: ${statusBg}; color: ${statusColor}; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700;">${displayStatus}</span>
                        </div>
                        
                        ${o.masterMessage ? `
                            <div style="background: #F7F9FC; padding: 14px; border-radius: 12px; border: 1px solid #E5EBF3;">
                                <p style="font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: 700; margin: 0 0 4px;">aneeq Master</p>
                                <p style="color: #1E293B; line-height: 1.5; font-size: 14px; margin: 0;">"${o.masterMessage}"</p>
                            </div>
                        ` : `
                            <p style="font-size: 13px; color: #64748B; margin: 0;">${t.waitMaster}</p>
                        `}
                    </div>
                `;
            }).join('');
        }
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "orders");
    });
}

function handleMasterLogin() {
    const t = TRANSLATIONS[currentLang];
    const pass = document.getElementById('master-pass').value;
    if(pass === MASTER_KEY) {
        isMasterLoggedIn = true;
        localStorage.setItem('aneeq_master_session', 'true');
        document.getElementById('master-login').classList.add('hidden');
        document.getElementById('master-dashboard').classList.remove('hidden');
        renderMasterOrders();
    } else {
        showToast(t.accessDenied);
    }
}

let masterOrdersUnsubscribe = null;
function renderMasterOrders() {
    if (!db) return;
    if (masterOrdersUnsubscribe) masterOrdersUnsubscribe();
    const t = TRANSLATIONS[currentLang];
    const container = document.getElementById('master-orders-list');
    const q = query(collection(db, "orders"));
    let isInitial = true;
    masterOrdersUnsubscribe = onSnapshot(q, (snapshot) => {
        let orders = [];
        snapshot.forEach(doc => orders.push({ ...doc.data(), id: doc.id }));
        
        if (typeof window.updateMasterChart === 'function') {
            window.updateMasterChart(orders, currentLang);
        }

        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' && !isInitial) {
                const docData = change.doc.data();
                showOrderToast(docData);
            }
        });
        isInitial = false;

        document.getElementById('master-stats').innerHTML = `
            <div style="display:flex; gap:18px; margin-top:14px; font-size:14px; font-weight:600;">
                <div style="font-variant-numeric:tabular-nums;">${t.totalLabel}${orders.length}</div>
                <div style="color:#60A5FA;">${t.systemOnline}</div>
            </div>
        `;
        orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        container.innerHTML = orders.map((o) => {
            const statusColor = o.status === 'Accepted' ? '#1D4ED8' : (o.status === 'Refused' ? '#EF4444' : '#D97706');
            const statusBg = o.status === 'Accepted' ? '#EFF6FF' : (o.status === 'Refused' ? '#FEF2F2' : '#FFFBEB');
            let displayStatus = (o.status === 'pending' || !o.status) ? (currentLang === 'ar' ? 'قيد الانتظار' : 'Pending') : o.status;
            if(o.status === 'Accepted') displayStatus = t.statusAccepted;
            if(o.status === 'Refused') displayStatus = t.statusRefused;
            return `
            <div class="order-item" style="flex-direction: column; align-items: stretch; gap: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap;">
                    <div>
                        <strong style="font-size: 16px; color:#1E293B;">${o.productName}</strong><br>
                        <small style="color:#64748B;">${o.shopName} · ${o.time}</small><br>
                        <span style="color:#2563EB; font-weight:800; font-variant-numeric:tabular-nums; display:inline-block; margin-top:4px;">${Number(o.price || 0).toLocaleString()} د.ع</span>
                        <div style="background:#F7F9FC; padding: 10px 12px; border-radius: 10px; margin-top: 10px; font-size: 13px; border: 1px solid #E5EBF3; color:#1E293B;">
                            <strong>${t.locationDetails}</strong> ${o.location}
                        </div>
                    </div>
                    <div style="text-align: end;">
                        <span style="background: ${statusBg}; color: ${statusColor}; padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; display:inline-block;">${displayStatus}</span><br>
                        <span style="color:#64748B; font-size:12px; display: block; margin-top: 6px; font-variant-numeric:tabular-nums;">${t.phLabel} ${o.phone}</span>
                    </div>
                </div>
                ${(o.status === 'pending' || !o.status) ? `<div style="border-top: 1px solid #E5EBF3; padding-top: 14px;">
                        <p style="font-size: 12px; font-weight: 700; margin: 0 0 8px; color: #334155;">${t.masterAction}</p>
                        <textarea id="msg-${o.id}" placeholder="${t.typeMessage}" style="margin-bottom: 10px; min-height: 60px;"></textarea>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="updateOrderStatus('${o.id}', 'Accepted')" style="flex: 1; background: #2563EB; color: white; border: none; padding: 11px; border-radius: 10px; cursor: pointer; font-weight: 700;">${t.acceptRequest}</button>
                            <button onclick="updateOrderStatus('${o.id}', 'Refused')" style="flex: 1; background: #EF4444; color: white; border: none; padding: 11px; border-radius: 10px; cursor: pointer; font-weight: 700;">${t.refuseRequest}</button>
                        </div>
                    </div>` : `<div style="border-top: 1px solid #E5EBF3; padding-top: 12px; font-size: 13px;">
                        <strong>${t.messageSent}</strong> <span style="color: #64748B;">${o.masterMessage || 'No message provided.'}</span>
                        <button onclick="deleteOrderByID('${o.id}')" style="display: block; margin-top: 10px; background: none; border: none; color: #64748B; cursor: pointer; font-size: 12px; text-decoration: underline; padding: 0;">${t.removeHistory}</button>
                    </div>`}
            </div>
        `}).join('') || `<p style="color:#64748B; text-align:center; padding:32px;">${t.noItemsMarket}</p>`;
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "orders");
    });
}

// MASTER ACTIONS
function switchMasterTab(tab) {
    currentMasterTab = tab;
    const ordersTab = document.getElementById('master-tab-orders');
    const shopsTab = document.getElementById('master-tab-shops');
    const approvalsTab = document.getElementById('master-tab-approvals');
    const ordersView = document.getElementById('master-orders-view');
    const shopsView = document.getElementById('master-shops-view');
    const approvalsView = document.getElementById('master-approvals-view');

    const tabs = [
        { key: 'orders', btn: ordersTab, view: ordersView },
        { key: 'shops', btn: shopsTab, view: shopsView },
        { key: 'approvals', btn: approvalsTab, view: approvalsView },
    ];

    tabs.forEach(({ key, btn, view }) => {
        const isActive = key === tab;
        if (btn) {
            btn.style.fontWeight = isActive ? '700' : '500';
            btn.style.borderBottom = isActive ? '2px solid #2563EB' : 'none';
            btn.style.color = isActive ? '#FFFFFF' : '#94A3B8';
        }
        if (view) {
            view.classList.toggle('hidden', !isActive);
        }
    });

    if (tab === 'orders') renderMasterOrders();
    else if (tab === 'shops') renderMasterShops();
    else if (tab === 'approvals') renderMasterApprovals();
}

function setApprovalsFilter(filter) {
    currentApprovalsFilter = filter;
    document.getElementById('approvals-filter-pending')?.classList.toggle('active', filter === 'pending');
    document.getElementById('approvals-filter-all')?.classList.toggle('active', filter === 'all');
    renderMasterApprovals();
}

function getPendingApprovalCount() {
    let count = 0;
    Object.values(shopSettingsOverrides).forEach(s => {
        if (s.pendingLogo && s.logoStatus === 'pending') count += 1;
        if (s.pendingHero && s.heroStatus === 'pending') count += 1;
    });
    MARKET_PRODUCTS.forEach(p => {
        const statuses = getProductPhotoStatuses(p);
        count += statuses.filter(st => st === 'pending').length;
    });
    return count;
}

function updateApprovalsBadge() {
    const badge = document.getElementById('approvals-pending-badge');
    if (!badge) return;
    const count = getPendingApprovalCount();
    badge.innerText = String(count);
    badge.classList.toggle('hidden', count === 0);
}

function renderMasterApprovals() {
    const list = document.getElementById('master-approvals-list');
    if (!list) return;
    const t = TRANSLATIONS[currentLang];
    updateApprovalsBadge();

    const cards = [];

    // 1. Store Logo & Hero Banner uploads
    Object.values(shopSettingsOverrides).forEach(s => {
        const shopId = s.shopId;
        const shopName = s.name || SHOPS.find(sh => sh.id === shopId)?.name || shopId;
        const storePhotos = [];

        if (s.pendingLogo && s.logoStatus === 'pending') {
            storePhotos.push({ kind: 'logo', label: t.storeLogoType, src: s.pendingLogo, status: 'pending' });
        } else if (currentApprovalsFilter === 'all' && (s.logo || s.logoStatus === 'rejected')) {
            if (s.logo) storePhotos.push({ kind: 'logo', label: t.storeLogoType, src: s.logo, status: s.logoStatus || 'approved' });
        }

        if (s.pendingHero && s.heroStatus === 'pending') {
            storePhotos.push({ kind: 'hero', label: t.storeHeroType, src: s.pendingHero, status: 'pending' });
        } else if (currentApprovalsFilter === 'all' && (s.hero || s.heroStatus === 'rejected')) {
            if (s.hero) storePhotos.push({ kind: 'hero', label: t.storeHeroType, src: s.hero, status: s.heroStatus || 'approved' });
        }

        if (storePhotos.length > 0) {
            cards.push(`
                <div class="approval-card">
                    <div class="approval-card-header">
                        <div>
                            <h4 style="margin:0; font-size:16px; font-weight:800; color:#1E293B;">${escapeHtml(shopName)}</h4>
                            <div style="font-size:12px; color:#64748B; margin-top:2px;">ID: ${escapeHtml(shopId)}</div>
                        </div>
                    </div>
                    <div class="approval-photos-grid">
                        ${storePhotos.map(item => `
                            <div class="approval-photo-tile">
                                <div class="approval-photo-thumb ${item.kind === 'hero' ? 'is-hero' : ''}" onclick="zoomImage('${item.src}')">
                                    <img src="${item.src}" alt="${escapeHtml(item.label)}">
                                </div>
                                <div class="approval-photo-meta">
                                    <div style="font-size:12px; font-weight:700; color:#1E293B;">${item.label}</div>
                                    <div class="approval-status-text is-${item.status}">${item.status === 'pending' ? t.pendingLabel : (item.status === 'approved' ? t.approvedLabel : t.rejectedLabel)}</div>
                                    <div class="approval-photo-actions">
                                        ${item.status !== 'approved' ? `<button type="button" class="btn-approve-photo" onclick="approveShopPhoto('${shopId}', '${item.kind}')">${t.approveBtn}</button>` : ''}
                                        ${item.status !== 'rejected' ? `<button type="button" class="btn-reject-photo" onclick="rejectShopPhoto('${shopId}', '${item.kind}')">${t.rejectBtn}</button>` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `);
        }
    });

    // 2. Product photos
    MARKET_PRODUCTS.forEach(p => {
        const imgs = getProductAllImages(p);
        if (imgs.length === 0) return;
        const statuses = getProductPhotoStatuses(p);
        const hasPending = statuses.some(st => st === 'pending');

        if (currentApprovalsFilter === 'pending' && !hasPending) return;

        const shopName = shopSettingsOverrides[p.shopId]?.name || SHOPS.find(s => s.id === p.shopId)?.name || p.shopId;
        const tilesToRender = imgs.map((img, idx) => ({ img, idx, status: statuses[idx] }))
            .filter(item => currentApprovalsFilter === 'all' || item.status === 'pending');

        if (tilesToRender.length === 0) return;

        cards.push(`
            <div class="approval-card">
                <div class="approval-card-header">
                    <div>
                        <h4 style="margin:0; font-size:16px; font-weight:800; color:#1E293B;">${escapeHtml(p.name)}</h4>
                        <div style="font-size:12px; color:#64748B; margin-top:3px;">${escapeHtml(shopName)} · ${Number(p.price || 0).toLocaleString()} د.ع</div>
                    </div>
                    ${hasPending ? `<button type="button" class="btn-approve-photo" style="flex:none; padding:8px 14px;" onclick="approveAllProductPhotos('${p.id}')">${t.approveAllBtn}</button>` : ''}
                </div>
                <div class="approval-photos-grid">
                    ${tilesToRender.map(item => `
                        <div class="approval-photo-tile">
                            <div class="approval-photo-thumb" onclick="zoomImage('${item.img}')">
                                <img src="${item.img}" alt="${escapeHtml(p.name)}">
                            </div>
                            <div class="approval-photo-meta">
                                <div class="approval-status-text is-${item.status}">${item.status === 'pending' ? t.pendingLabel : (item.status === 'approved' ? t.approvedLabel : t.rejectedLabel)}</div>
                                <div class="approval-photo-actions">
                                    ${item.status !== 'approved' ? `<button type="button" class="btn-approve-photo" onclick="approveProductPhoto('${p.id}', ${item.idx})">${t.approveBtn}</button>` : ''}
                                    ${item.status !== 'rejected' ? `<button type="button" class="btn-reject-photo" onclick="rejectProductPhoto('${p.id}', ${item.idx})">${t.rejectBtn}</button>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `);
    });

    if (cards.length === 0) {
        list.innerHTML = `<div style="text-align: center; color: #64748B; padding: 40px; background:#FFFFFF; border:1px solid #E5EBF3; border-radius:18px;">${currentApprovalsFilter === 'pending' ? t.noPendingApprovals : t.noApprovalsFound}</div>`;
        return;
    }

    list.innerHTML = cards.join('');
}

async function setProductPhotoDecision(productId, photoIdx, decision) {
    if (!db) return;
    const p = PRODUCT_CACHE[productId] || MARKET_PRODUCTS.find(item => item.id === productId);
    if (!p) return;

    const imgs = getProductAllImages(p);
    const statuses = [...getProductPhotoStatuses(p)];
    statuses[photoIdx] = decision;

    const approvedIdx = statuses.findIndex(st => st === 'approved');
    const overallStatus = approvedIdx !== -1
        ? 'approved'
        : (statuses.some(st => st === 'pending') ? 'pending' : 'rejected');

    const updatePayload = {
        photoStatuses: statuses,
        photoStatus: overallStatus,
        updatedAt: serverTimestamp()
    };
    if (approvedIdx !== -1 && imgs[approvedIdx]) {
        updatePayload.image = imgs[approvedIdx];
    }

    try {
        await updateDoc(doc(db, "inventory", productId), updatePayload);
        showToast(decision === 'approved'
            ? (currentLang === 'ar' ? 'تمت الموافقة على الصورة!' : 'Photo approved & published!')
            : (currentLang === 'ar' ? 'تم رفض الصورة.' : 'Photo rejected.'));
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `inventory/${productId}`);
    }
}

function approveProductPhoto(productId, photoIdx) {
    return setProductPhotoDecision(productId, photoIdx, 'approved');
}

function rejectProductPhoto(productId, photoIdx) {
    return setProductPhotoDecision(productId, photoIdx, 'rejected');
}

async function approveAllProductPhotos(productId) {
    if (!db) return;
    const p = PRODUCT_CACHE[productId] || MARKET_PRODUCTS.find(item => item.id === productId);
    if (!p) return;
    const imgs = getProductAllImages(p);
    const statuses = imgs.map(() => 'approved');
    try {
        await updateDoc(doc(db, "inventory", productId), {
            photoStatuses: statuses,
            photoStatus: 'approved',
            image: imgs[0] || p.image || '',
            updatedAt: serverTimestamp()
        });
        showToast(currentLang === 'ar' ? 'تمت الموافقة على جميع الصور!' : 'All photos approved & published!');
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `inventory/${productId}`);
    }
}

async function approveShopPhoto(shopId, kind) {
    if (!db) return;
    const settings = shopSettingsOverrides[shopId];
    if (!settings) return;
    const updatePayload = { updatedAt: serverTimestamp() };
    if (kind === 'logo' && settings.pendingLogo) {
        updatePayload.logo = settings.pendingLogo;
        updatePayload.pendingLogo = '';
        updatePayload.logoStatus = 'approved';
    } else if (kind === 'hero' && settings.pendingHero) {
        updatePayload.hero = settings.pendingHero;
        updatePayload.pendingHero = '';
        updatePayload.heroStatus = 'approved';
    }
    try {
        await setDoc(doc(db, "shop_settings", shopId), updatePayload, { merge: true });
        showToast(currentLang === 'ar' ? 'تمت الموافقة على صورة المتجر!' : 'Store photo approved & published!');
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `shop_settings/${shopId}`);
    }
}

async function rejectShopPhoto(shopId, kind) {
    if (!db) return;
    const updatePayload = { updatedAt: serverTimestamp() };
    if (kind === 'logo') {
        updatePayload.pendingLogo = '';
        updatePayload.logoStatus = 'rejected';
    } else if (kind === 'hero') {
        updatePayload.pendingHero = '';
        updatePayload.heroStatus = 'rejected';
    }
    try {
        await setDoc(doc(db, "shop_settings", shopId), updatePayload, { merge: true });
        showToast(currentLang === 'ar' ? 'تم رفض صورة المتجر.' : 'Store photo rejected.');
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `shop_settings/${shopId}`);
    }
}

function renderMasterShops() {
    const list = document.getElementById('master-shops-list');
    if (!list) return;

    if (SHOPS.length === 0) {
        list.innerHTML = `<div style="text-align: center; color: #64748B; padding: 40px; background:#FFFFFF; border:1px solid #E5EBF3; border-radius:18px;">No registered stores found / لا يوجد متاجر مسجلة</div>`;
        return;
    }

    list.innerHTML = SHOPS.map(shop => {
        const settings = shopSettingsOverrides[shop.id] || {};
        const shopName = settings.name || shop.name;
        const currentCat = settings.category || "";
        const shopLogo = settings.logo || shop.logo || defaultShopLogo;
        const shopPhone = settings.phone || shop.phone || "";
        const shopPass = settings.pass || settings.password || shop.pass || "";
        
        return `
            <div class="order-item" style="display: flex; align-items: center; justify-content: space-between; gap: 15px; border: 1px solid #E5EBF3; padding: 18px 20px; background: #FFFFFF; border-radius: 18px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <img src="${shopLogo}" style="width: 52px; height: 52px; border-radius: 14px; object-fit: cover; border: 1px solid #E5EBF3;" alt="logo" onerror="this.src='${defaultShopLogo}'">
                    <div>
                        <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1E293B;">${shopName}</h3>
                        <p style="font-size: 12px; color: #64748B; margin: 4px 0 0 0;">
                            ID: <strong style="color: #1E293B;">${shop.id}</strong> · 
                            Phone: <strong style="color: #1E293B;">${shopPhone}</strong> · 
                            Pass: <strong style="color: #1E293B;">${shopPass}</strong>
                        </p>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    <select id="cat-select-${shop.id}" style="width:auto; padding: 8px 12px; border-radius: 10px; font-size: 13px;">
                        <option value="" ${!currentCat ? 'selected' : ''}>Uncategorized (Hidden) / غير مصنف</option>
                        <option value="Men" ${currentCat === 'Men' ? 'selected' : ''}>Men / رجالي</option>
                        <option value="Women" ${currentCat === 'Women' ? 'selected' : ''}>Women / نسائي</option>
                        <option value="Kids" ${currentCat === 'Kids' ? 'selected' : ''}>Kids / أطفال</option>
                        <option value="Shoes" ${currentCat === 'Shoes' ? 'selected' : ''}>Shoes / أحذية</option>
                    </select>
                    <button class="btn-outline" onclick="updateShopCategory('${shop.id}')" style="padding: 8px 14px; font-size: 12px;">Save Cat</button>
                    <button class="btn-primary" onclick="openMasterShopModal('edit', '${shop.id}')" style="width:auto; min-height:38px; padding: 8px 14px; font-size: 12px;">Edit / Photos</button>
                    <button class="btn-primary" onclick="deleteMasterShop('${shop.id}')" style="width:auto; min-height:38px; padding: 8px 14px; font-size: 12px; background: #EF4444;">Delete / حذف</button>
                </div>
            </div>
        `;
    }).join('');
}

async function updateShopCategory(shopId) {
    const select = document.getElementById(`cat-select-${shopId}`);
    const newCat = select.value;
    
    try {
        await setDoc(doc(db, "shop_settings", shopId), {
            shopId: shopId,
            category: newCat,
            updatedAt: serverTimestamp()
        }, { merge: true });
        showToast("Category Updated!");
        renderMasterShops();
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `shop_settings/${shopId}`);
        showToast("Error updating category");
    }
}

async function openMasterShopModal(mode, shopId = '') {
    const modal = document.getElementById('master-shop-modal');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.classList.remove('hidden');

    const titleEl = document.getElementById('master-shop-modal-title');
    const modeInput = document.getElementById('m-shop-mode');
    const idInput = document.getElementById('m-shop-id');
    const nameInput = document.getElementById('m-shop-name');
    const phoneInput = document.getElementById('m-shop-phone');
    const passInput = document.getElementById('m-shop-pass');
    const catSelect = document.getElementById('m-shop-cat');
    const logoImg = document.getElementById('m-shop-logo-img');
    const heroImg = document.getElementById('m-shop-hero-img');

    currentMasterShopLogo = null;
    currentMasterHero = null;

    if (mode === 'add') {
        if (titleEl) titleEl.innerText = currentLang === 'ar' ? 'إضافة متجر جديد' : 'Add New Store';
        if (modeInput) modeInput.value = 'add';
        if (idInput) {
            idInput.value = '';
            idInput.disabled = false;
        }
        if (nameInput) nameInput.value = '';
        if (phoneInput) phoneInput.value = '';
        if (passInput) passInput.value = '';
        if (catSelect) catSelect.value = '';
        if (logoImg) logoImg.src = defaultShopLogo;
        if (heroImg) heroImg.src = defaultShopHero;
    } else {
        if (titleEl) titleEl.innerText = currentLang === 'ar' ? 'تعديل بيانات المتجر' : 'Edit Store Details / Photos';
        if (modeInput) modeInput.value = 'edit';
        
        const shop = SHOPS.find(s => s.id === shopId);
        if (shop) {
            const settings = shopSettingsOverrides[shop.id] || {};
            if (idInput) {
                idInput.value = shop.id;
                idInput.disabled = true;
            }
            if (nameInput) nameInput.value = settings.name || shop.name || '';
            if (phoneInput) phoneInput.value = settings.phone || shop.phone || '';
            if (passInput) passInput.value = settings.pass || settings.password || shop.pass || '';
            if (catSelect) catSelect.value = settings.category || shop.category || '';
            
            const currentLogo = settings.logo || shop.logo || defaultShopLogo;
            const currentHero = settings.hero || shop.hero || defaultShopHero;
            
            if (logoImg) logoImg.src = currentLogo;
            if (heroImg) heroImg.src = currentHero;
            
            currentMasterShopLogo = currentLogo;
            currentMasterHero = currentHero;
        }
    }

    if (idInput) {
        idInput.dispatchEvent(new Event('input'));
    }
}

function closeMasterShopModal() {
    const modal = document.getElementById('master-shop-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
}

async function previewMasterShopLogo(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            openCropper(e.target.result, 'masterLogo');
        };
        reader.readAsDataURL(file);
    }
}

async function previewMasterShopHero(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            openCropper(e.target.result, 'masterHero');
        };
        reader.readAsDataURL(file);
    }
}

async function saveMasterShop() {
    const mode = document.getElementById('m-shop-mode').value;
    const shopId = document.getElementById('m-shop-id').value.trim().toLowerCase();
    const name = document.getElementById('m-shop-name').value.trim();
    const phone = normalizePhone(document.getElementById('m-shop-phone').value.trim());
    const pass = document.getElementById('m-shop-pass').value.trim();
    const category = document.getElementById('m-shop-cat').value;

    if (!shopId || !name || !phone || !pass) {
        showToast(currentLang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields.');
        return;
    }

    // Since normalizePhone returns 964... if it is empty or invalid, let's make sure they entered a real number.
    // Normalized prefix 964 + at least 9 digits (total 12 minimum for Iraqi number)
    if (phone.length < 10) {
        showToast(currentLang === 'ar' ? 'يرجى إدخال رقم هاتف صالح (مثال: 07701234567)' : 'Please enter a valid phone number (e.g. 07701234567).');
        return;
    }

    const isIdValid = /^[a-z0-9_-]+$/.test(shopId);
    if (!isIdValid) {
        showToast(currentLang === 'ar' ? 'معرف غير صالح' : 'Invalid ID. Use lowercase letters, numbers, and dashes only.');
        return;
    }

    const btn = document.getElementById('btn-m-save-shop');
    if (!btn) return;
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = currentLang === 'ar' ? 'جاري الحفظ...' : 'Saving...';

    try {
        const shopSettingsData = {
            shopId: shopId,
            name: name,
            phone: phone,
            pass: pass,
            password: pass,
            category: category,
            updatedAt: serverTimestamp()
        };

        if (mode === 'add') {
            shopSettingsData.logo = currentMasterShopLogo || defaultShopLogo;
            shopSettingsData.hero = currentMasterHero || defaultShopHero;
            shopSettingsData.logoStatus = 'approved';
            shopSettingsData.heroStatus = 'approved';
            shopSettingsData.pendingLogo = '';
            shopSettingsData.pendingHero = '';
        } else {
            if (currentMasterShopLogo) {
                shopSettingsData.logo = currentMasterShopLogo;
                shopSettingsData.logoStatus = 'approved';
                shopSettingsData.pendingLogo = '';
            }
            if (currentMasterHero) {
                shopSettingsData.hero = currentMasterHero;
                shopSettingsData.heroStatus = 'approved';
                shopSettingsData.pendingHero = '';
            }
        }

        // Save shop settings
        await setDoc(doc(db, "shop_settings", shopId), shopSettingsData, { merge: true });

        // Save user doc for login
        const userRef = doc(db, "users", phone);
        await setDoc(userRef, {
            name: name,
            phone: phone,
            password: pass,
            shopId: shopId,
            location: "",
            updatedAt: serverTimestamp()
        }, { merge: true });

        // Update local object overrides cache
        shopSettingsOverrides[shopId] = {
            ...shopSettingsOverrides[shopId],
            ...shopSettingsData
        };

        showToast(currentLang === 'ar' ? 'تم حفظ المتجر بنجاح!' : 'Store saved successfully!');
        closeMasterShopModal();
        renderMasterShops();
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `shop_settings/master/${shopId}`);
        showToast(currentLang === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving store information.');
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
}

async function updateOrderStatus(orderId, newStatus) {
    const msgInput = document.getElementById(`msg-${orderId}`);
    const msg = msgInput ? msgInput.value : "";
    try {
        await updateDoc(doc(db, "orders", orderId), {
            status: newStatus,
            masterMessage: msg
        });
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
}

async function deleteOrderByID(orderId) {
    try {
        await deleteDoc(doc(db, "orders", orderId));
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `orders/${orderId}`);
    }
}

async function deleteMasterShop(shopId) {
    if (!db) return;
    
    const shop = SHOPS.find(s => s.id === shopId);
    
    const confirmMsg = currentLang === 'ar' 
        ? `هل أنت متأكد تمامًا من رغبتك في حذف متجر "${shop?.name || shopId}" وكل المنتجات المرتبطة به وحساب البائع الخاص به؟ لا يمكن التراجع عن هذا الإجراء!`
        : `Are you absolutely sure you want to delete the store "${shop?.name || shopId}", all of its associated products, and its seller account? This action cannot be undone!`;
        
    if (!confirm(confirmMsg)) return;
    
    // 1. Instantly update the user interface by removing the store from the local states
    const idx = SHOPS.findIndex(s => s.id === shopId);
    if (idx !== -1) {
        SHOPS.splice(idx, 1);
    }
    if (shopSettingsOverrides[shopId]) {
        delete shopSettingsOverrides[shopId];
    }
    
    // Immediately redirect & logout if currently viewing the deleted shop or logged into it
    if (activeShop && activeShop.id === shopId) {
        activeShop = null;
        if (currentView === 'shop') {
            showView('marketplace');
        }
    }
    if (loggedInShopId === shopId) {
        logout();
    }
    
    // Render immediate UI feedback
    renderMasterShops();
    initMarketplace();
    
    try {
        showToast(currentLang === 'ar' ? 'جاري حذف المتجر من قاعدة البيانات...' : 'Deleting store from database...');
        
        // 2. Perform the actual Firestore deletion requests asynchronously
        await deleteDoc(doc(db, "shop_settings", shopId));
        
        // Delete the associated user account if we have a phone
        const phone = shop?.phone || shopSettingsOverrides[shopId]?.phone;
        if (phone) {
            await deleteDoc(doc(db, "users", phone));
        }
        
        // Delete any products under the inventory matching the shopId
        const q = query(collection(db, "inventory"), where("shopId", "==", shopId));
        const pSnapshot = await getDocs(q);
        const deletePromises = [];
        pSnapshot.forEach(docSnap => {
            deletePromises.push(deleteDoc(docSnap.ref));
        });
        if (deletePromises.length > 0) {
            await Promise.all(deletePromises);
        }
        
        showToast(currentLang === 'ar' ? 'تم حذف المتجر وجميع المنتجات المرتبطة به بنجاح.' : 'Store and all associated products deleted successfully.');
        
        // Ensure final UI is synced with any late-arriving snapshots
        renderMasterShops();
        initMarketplace();
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `shop_settings/${shopId}`);
        showToast(currentLang === 'ar' ? 'حدث خطأ أثناء حذف المتجر من الخادم.' : 'Error fully deleting store from server.');
    }
}

async function deleteAllMasterShops() {
    if (!db) return;

    if (SHOPS.length === 0) {
        showToast(currentLang === 'ar' ? 'لا يوجد متاجر مسجلة لحذفها.' : 'No registered stores found to delete.');
        return;
    }

    const firstConfirmMsg = currentLang === 'ar'
        ? `🚨 تحذير خطير: هل أنت متأكد تمامًا من رغبتك في حذف جميع المتاجر المسجلة (${SHOPS.length}) وكل المنتجات التابعة لها وحسابات البائعين مجتمعة؟ لا يمكن التراجع عن هذا الإجراء الإطلاقي!`
        : `🚨 CRITICAL WARNING: Are you sure you want to delete ALL registered stores (${SHOPS.length}), all of their associated products, and all seller accounts? This action cannot be undone!`;

    if (!confirm(firstConfirmMsg)) return;

    const secondConfirmInput = prompt(
        currentLang === 'ar'
            ? `لتأكيد الحذف الكامل والنهائي، يرجى كتابة "DELETE ALL":`
            : `To confirm total permanent deletion, please type "DELETE ALL":`
    );

    if (secondConfirmInput !== "DELETE ALL") {
        showToast(currentLang === 'ar' ? 'تم إلغاء العملية. لم يتم مطابقة رمز التأكيد.' : 'Operation cancelled. Confirmation phrase did not match.');
        return;
    }

    // 1. Instantly empty SHOPS locally to update the user interface immediately
    const shopsToDelete = [...SHOPS];
    SHOPS.length = 0;
    for (const key in shopSettingsOverrides) {
        delete shopSettingsOverrides[key];
    }

    // Reset customer shop view & seller session safely
    activeShop = null;
    if (currentView === 'shop') {
        showView('marketplace');
    }
    if (loggedInShopId) {
        logout();
    }

    // Render immediate UI feedback
    renderMasterShops();
    initMarketplace();

    try {
        showToast(currentLang === 'ar' ? 'جاري حذف جميع المتاجر من قاعدة البيانات...' : 'Deleting all stores from database...');

        const promises = shopsToDelete.map(async (shop) => {
            const shopId = shop.id;

            // Delete the shop_settings document
            await deleteDoc(doc(db, "shop_settings", shopId)).catch(console.error);

            // Delete the associated user account if we have a phone
            const phone = shop.phone || shopSettingsOverrides[shopId]?.phone;
            if (phone) {
                await deleteDoc(doc(db, "users", phone)).catch(console.error);
            }

            // Delete any products under the inventory matching the shopId
            const q = query(collection(db, "inventory"), where("shopId", "==", shopId));
            const pSnapshot = await getDocs(q).catch(() => null);
            if (pSnapshot) {
                const deletePromises = [];
                pSnapshot.forEach(docSnap => {
                    deletePromises.push(deleteDoc(docSnap.ref));
                });
                if (deletePromises.length > 0) {
                    await Promise.all(deletePromises).catch(console.error);
                }
            }
        });

        await Promise.all(promises);

        showToast(currentLang === 'ar' ? 'تم حذف جميع المتاجر والمنتجات بنجاح.' : 'All stores and associated products deleted successfully.');
        
        // Ensure final interface matches
        renderMasterShops();
        initMarketplace();
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `shop_settings/all`);
        showToast(currentLang === 'ar' ? 'حدث خطأ أثناء حذف المتاجر.' : 'Error deleting all stores.');
    }
}

function showOrderToast(order) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    
    const isAr = currentLang === 'ar';
    const title = isAr ? 'طلب جديد وارد!' : 'New Order Received!';
    const bodyText = isAr 
        ? `طلب جديد لـ <strong>${order.productName || 'منتج'}</strong> من متجر <strong>${order.shopName || 'غير معروف'}</strong>`
        : `New request for <strong>${order.productName || 'product'}</strong> from <strong>${order.shopName || 'unknown store'}</strong>`;

    // SVG icon for shopping bag
    const iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
            <path d="M3 6h18"></path>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
    `;

    // SVG icon for close
    const closeSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `;

    toast.innerHTML = `
        <div class="toast-icon">
            ${iconSvg}
        </div>
        <div class="toast-content">
            <div class="toast-title">
                <span>${title}</span>
                <button class="toast-close" aria-label="Close">
                    ${closeSvg}
                </button>
            </div>
            <p class="toast-body">${bodyText}</p>
        </div>
        <div class="toast-progress" style="animation-duration: 5000ms;"></div>
    `;

    container.appendChild(toast);

    // Force reflow and show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);

    // Auto dismiss
    const dismissTimeout = setTimeout(() => {
        dismissToast();
    }, 5000);

    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            clearTimeout(dismissTimeout);
            dismissToast();
        });
    }

    function dismissToast() {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
            }
        }, 500); // Wait for transition out
    }
}

// Global Exports - For direct access from HTML onclick
// Assignments moved to top for availability

