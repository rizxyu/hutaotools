document.addEventListener("DOMContentLoaded", async () => {
    const uploadInput = document.getElementById("upload");
    const uploadBox = document.getElementById("uploadBox");
    const loader = document.getElementById("loader");
    const resultCard = document.getElementById("resultCard");
    const title = document.getElementById("title");
    const subtitle = document.getElementById("subtitle");
    const resultImage = document.getElementById("resultImage");
    const downloadBtn = document.getElementById("downloadBtn");
    const shareBtn = document.getElementById("shareBtn");
    const reloadBtn = document.getElementById("reloadBtn");
    const translateDropdown = document.getElementById("translateDropdown");


    
    const TRANSLATION_URL = "/lang/tr";
    let translations = {}; // Cache untuk menyimpan terjemahan
    let currentLang = "id"; // Default bahasa

    async function checkHeaders() {
        try {
            const response = await fetch("/validate", { method: "GET" });
            if (!response.ok) throw new Error("Gagal mendapatkan token.");
            return response.headers.get("X-Auth-Token");
        } catch (error) {
            console.error(error);
            alert(translations[currentLang]?.token_error || "Gagal mendapatkan token.");
            return null;
        }
    }

    async function loadTranslations(lang) {
        try {
            if (!translations[lang]) {
                const response = await fetch(TRANSLATION_URL);
                translations = await response.json(); // Simpan di cache
            }
            currentLang = lang;
            const data = translations[lang];

            // Update teks UI
            title.textContent = data.title;
            subtitle.textContent = data.subtitle;
            uploadBox.querySelector("p").textContent = data.upload_text;
        } catch (error) {
            console.error("Gagal memuat terjemahan:", error);
        }
    }

    async function detectUserLang() {
        try {
            const response = await fetch("/get-userCountry");
            const data = await response.json();
            
            if (data.lang) {
                await loadTranslations(data.lang); // Atur bahasa otomatis
                translateDropdown.value = data.lang; // Sesuaikan dropdown
            }
        } catch (error) {
            console.error("Gagal mendeteksi bahasa:", error);
        }
    }
    
    uploadInput.addEventListener("change", async function () {
        const file = this.files[0];
        if (!file) return;

        title.textContent = translations[currentLang]?.processing || "Menjernihkan...";
        subtitle.textContent = translations[currentLang]?.processing_sub || "Sabar Ya 🥰 Lagi di Jernihin nih fotomu..";

        uploadBox.classList.add("hidden");
        loader.classList.remove("hidden");

        try {
            const buffer = await file.arrayBuffer();
            const token = await checkHeaders();
            if (!token) throw new Error("Token tidak tersedia.");

            const response = await fetch("/ai/hd", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ buffer: [...new Uint8Array(buffer)] })
            });

            if (!response.ok) throw new Error(translations[currentLang]?.error || "Gagal menjernihkan gambar.");

            const resultBuffer = await response.arrayBuffer();
            const blob = new Blob([resultBuffer], { type: "image/png" });
            resultImage.src = URL.createObjectURL(blob);

            loader.classList.add("hidden");
            resultCard.classList.remove("hidden");

            title.textContent = translations[currentLang]?.done || "Sudah selesai..";
            subtitle.textContent = translations[currentLang]?.done_sub || "Gimana? Apakah sudah bagus☺️";

        } catch (error) {
            console.error(error);
            alert(translations[currentLang]?.error || "Gagal menjernihkan foto, coba lagi nanti.");

            loader.classList.add("hidden");
            uploadBox.classList.remove("hidden");
            title.textContent = translations[currentLang]?.title || "Jernihkan Foto Mu dengan AI!";
            subtitle.textContent = translations[currentLang]?.subtitle || "Mulai upload foto dengan mengetuk form di bawah!";
        }
    });

    downloadBtn.addEventListener("click", function () {
        if (!resultImage.src) return alert("Gambar belum tersedia!");

        const link = document.createElement("a");
        link.href = resultImage.src;
        link.download = `Hasil_AI (beta.wzblueline.xyz).png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    shareBtn.addEventListener("click", function () {
        const shareData = {
            title: translations[currentLang]?.title || "Jernihkan Foto dengan AI!",
            text: "Coba jernihkan fotomu pakai AI di website ini!",
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData).catch(err => console.error("Gagal membagikan:", err));
        } else {
            alert("Browser tidak mendukung fitur berbagi!");
        }
    });

    reloadBtn.addEventListener("click", function () {
        resultCard.classList.add("hidden");
        loader.classList.add("hidden");
        uploadBox.classList.remove("hidden");

        title.textContent = translations[currentLang]?.title || "Jernihkan Foto Mu dengan AI!";
        subtitle.textContent = translations[currentLang]?.subtitle || "Mulai upload foto dengan mengetuk form di bawah!";
        
        uploadInput.value = "";
    });

    translateDropdown.addEventListener("change", function () {
        loadTranslations(this.value);
    });

    // Load terjemahan awal berdasarkan lokasi user
    detectUserLang();
});