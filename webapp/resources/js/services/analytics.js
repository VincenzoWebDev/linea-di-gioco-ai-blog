let gaLoaded = false;

export function loadGA() {
    if (gaLoaded) return;
    gaLoaded = true;

    const script = document.createElement("script");
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-KQWY6P94WJ";
    script.async = true;

    script.onload = () => {
        window.dataLayer = window.dataLayer || [];

        function gtag() { window.dataLayer.push(arguments); }

        window.gtag = gtag;

        gtag("js", new Date());
        gtag("config", "G-KQWY6P94WJ");
    };

    document.head.appendChild(script);
}