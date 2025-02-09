document.addEventListener("DOMContentLoaded", () => {
  const nav_buttons = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll("#content > div");

  // Menambahkan event listener untuk tombol navigasi
  nav_buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-target");

      sections.forEach((section) => section.classList.add("hidden"));

      // Tampilkan section yang sesuai, jika ada
      const targetSection = document.getElementById(target);
      if (targetSection) targetSection.classList.remove("hidden");

      nav_buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Jika target adalah "changelog", panggil fungsi fetchChangelog
      if (target === "changelog") {
        fetchChangelog();
      }
    });
  });

  document.getElementById("downloadForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Mencegah reload halaman

    const urlInput = document.getElementById("urlInput").value;
    if (!urlInput) {
      alert("Masukkan URL terlebih dahulu!");
      return;
    }

    // Sembunyikan elemen awal dan tampilkan loader
    document.getElementById("startImage").classList.add("hidden");
    document.getElementById("startText").classList.add("hidden");
    const errorElement = document.getElementById("errorElement");
    const loaderja = document.getElementById("loader");
    loaderja.classList.remove("hidden");

    try {
      const resultCard = document.getElementById("resultCard");
      resultCard.innerHTML = "";
      resultCard.classList.add("hidden");
      errorElement.classList.add("hidden");

      // Mengirim request ke endpoint API
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: urlInput }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status !== 200) {
        throw new Error(`Error: ${data.message || "Response status not OK"}`);
      }

      // Mengambil data yang diperlukan
      const cover = data.thumbnail; // Thumbnail
      const title = data.title || ""; // Judul
      const musicLinks = data.music;
      const videoLinks = data.video;
      const imageLinks = data.images;

      // Membangun konten tabel untuk masing-masing jenis file
      let tableContent = "";

      // Perbaikan: Atribut data-url pada tombol download musik sebelumnya tertulis salah.
      if (musicLinks && Array.isArray(musicLinks)) {
        musicLinks.forEach((music) => {
          tableContent += `
            <tr>
              <td class="flex items-center justify-center gap-2 py-4 px-2">
                <i class="fas fa-music"></i>
              </td>
              <td>Download MP3 (${music.resolusi})</td>
              <td>
                <button class="downloadBtn btn-primary-submit py-2 px-4 rounded" data-url="${music.url}">
                  <i class="fas fa-download"></i>
                </button>
              </td>
            </tr>
          `;
        });
      }

      if (videoLinks && Array.isArray(videoLinks)) {
        videoLinks.forEach((video) => {
          tableContent += `
            <tr>
              <td class="flex items-center justify-center gap-2 py-4 px-2">
                <i class="fas fa-video"></i>
              </td>
              <td>Download MP4 (${video.resolusi})</td>
              <td>
                <button class="downloadBtn btn-primary-submit py-2 px-4 rounded hover:bg-purple-700" data-url="${video.url}">
                  <i class="fas fa-download"></i>
                </button>
              </td>
            </tr>
          `;
        });
      }

      if (imageLinks && Array.isArray(imageLinks)) {
        imageLinks.forEach((image, index) => {
          tableContent += `
            <tr>
              <td class="flex items-center justify-center gap-2">
                <i class="fas fa-image"></i> ${index + 1}
              </td>
              <td>Download Gambar</td>
              <td>
                <button class="downloadBtn btn-primary-submit py-2 px-4 rounded hover:bg-purple-700" data-url="${image}">
                  <i class="fas fa-download"></i>
                </button>
              </td>
            </tr>
          `;
        });
      }

      // Menampilkan hasil di resultCard
      resultCard.innerHTML = `
        <span class="text-xs font-semibold px-2 py-1 shadow rounded">
          <span>Hasil</span> <span class="text-purple-400">Download</span>
        </span>
        <div class="flex justify-center mb-4">
          <img src="${cover}" alt="Thumbnail" class="w-40 h-40 rounded my-4">
        </div>
        <p class="text-lg font-semibold text-center mb-4">${title}</p>
        <table class="table-auto w-full text-left border-separate border-spacing-2">
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${tableContent}
          </tbody>
        </table>
      `;

      resultCard.classList.remove("hidden");
      loaderja.classList.add("hidden");

      // Tambahkan event listener untuk setiap tombol download
      document.querySelectorAll(".downloadBtn").forEach((button) => {
        button.addEventListener("click", async () => {
          const downloadLink = button.getAttribute("data-url");
          await downloadFile(downloadLink, title);
        });
      });

      // Pastikan elemen awal tetap tersembunyi
      document.getElementById("startImage").classList.add("hidden");
      document.getElementById("startText").classList.add("hidden");

      // Fungsi untuk mengunduh file
      async function downloadFile(link, title) {
        try {
          // Jika link tidak berasal dari domain .dlapi.app, buka di tab baru
          if (!link?.includes(".dlapi.app")) {
            const linkElement = document.createElement("a");
            linkElement.href = link;
            linkElement.target = "_blank";
            linkElement.click();
          } else {
            // Jika link berasal dari .dlapi.app, lakukan HEAD request untuk mendapatkan Content-Type
            const fileResponse = await fetch(link, { method: "HEAD" });
            if (!fileResponse.ok) {
              throw new Error(`Gagal mengunduh file: ${fileResponse.statusText}`);
            }

            const contentType = fileResponse.headers.get("Content-Type");
            let fileExtension = "";
            if (contentType === "video/mp4") fileExtension = ".mp4";
            else if (contentType === "audio/mpeg") fileExtension = ".mp3";
            else if (contentType && contentType.startsWith("image")) fileExtension = ".jpg";

            // Menentukan nama file menggunakan judul (title) jika tersedia
            const fileName = (
              (title || `download_${Date.now()}`) + (fileExtension || "")
            )
              .trim()
              .replace(fileExtension + fileExtension, fileExtension);

            const linkElement = document.createElement("a");
            linkElement.href = `/download?url=${encodeURIComponent(link)}&name=${encodeURIComponent(fileName)}`;
            // Opsional: menambahkan atribut download untuk memaksa unduh dengan nama file yang sudah ditentukan
            linkElement.setAttribute("download", fileName);
            linkElement.click();
          }
        } catch (error) {
          console.error("Gagal mengunduh file:", error);
          alert("Terjadi kesalahan saat mengunduh file.\n" + error.message);
        }
      }
    } catch (error) {
      console.error("Gagal memproses URL:", error);
      document.getElementById("loader").classList.add("hidden");
      errorElement.classList.remove("hidden");
      document.getElementById("startImage").classList.add("hidden");
      document.getElementById("startText").classList.add("hidden");
    }
  });
});
