document.addEventListener("DOMContentLoaded", () => {
  const nav_buttons = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll("#content > div");

  // Menambahkan event listener untuk tombol navigasi
  for(const button of nav_buttons) {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-target");

      sections.forEach((section) => {
        section.classList.add("hidden");
      });

      // Hanya tampilkan section yang sesuai
      const targetSection = document.getElementById(target);
      targetSection.classList.remove("hidden");

      nav_buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Jika target adalah "changelog", pastikan changelog dimuat
      if(target === "changelog") {
        fetchChangelog(); // Panggil fetchChangelog hanya saat changelog dipilih
      }
    });
  };

  document.getElementById("downloadForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Mencegah reload halaman

    const urlInput = document.getElementById("urlInput").value;
    if(!urlInput) {
      alert("Masukkan URL terlebih dahulu!");
      return;
    }
    document.getElementById("startImage").classList.add("hidden");
    document.getElementById("startText").classList.add("hidden");
    let errorElement = document.getElementById("errorElement");
    let loaderja = document.getElementById("loader");
    loaderja.classList.remove("hidden");
    try {
      const resultCard = document.getElementById("resultCard");

      resultCard.innerHTML = ""; // Bersihkan konten resultCard
      resultCard.classList.add("hidden");

      //errorElement.innerHTML = ""; // Bersihkan konten resultCard
      errorElement.classList.add("hidden");

      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: urlInput
        }),
      });

      if(!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      document.getElementById("startImage").classList.add("hidden");
      document.getElementById("startText").classList.add("hidden");


      const data = await response.json();

      if(data.status !== 200) throw new Error(`Error: ${data.message || "Response status not OK"}`);

      //errorElement.innerHTML = "";
      errorElement.classList.add("hidden");

      const cover = data.thumbnail // cover
      const title = data.title || ""; // title
      const musicLinks = data.music;
      const videoLinks = data.video;
      const imageLinks = data.images;

      // Render tabel sesuai tipe result
      let tableContent = "";

      if(musicLinks) {
        musicLinks.forEach((music) => {
          tableContent += `
          <tr>
            <td class="flex items-center justify-center gap-2 py-4 px-2">
              <i class="fas fa-music"></i>
            </td>
            <td>Download MP3 (${music.resolusi})</td>
            <td>
              <button class="downloadBtn bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700" data-url="${music.url}">
                <i class="fas fa-download"></i>
              </button>
            </td>
          </tr>
        `;
        });
      }

      if(videoLinks) {
        videoLinks.forEach((video) => {
          tableContent += `
          <tr>
            <td class="flex items-center justify-center gap-2 py-4 px-2">
              <i class="fas fa-video"></i>
            </td>
            <td>Download MP4 (${video.resolusi})</td>
            <td>
              <button class="downloadBtn bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700" data-url="${video.url}">
                <i class="fas fa-download"></i>
              </button>
            </td>
          </tr>
        `;
        });
      }
      // Jika ada gambar
      if(imageLinks) {
        imageLinks.forEach((image, index) => {
          tableContent += `
          <tr>
            <td class="flex items-center justify-center gap-2">
              <i class="fas fa-image"></i> ${index + 1}
            </td>
            <td>Download Gambar</td>
            <td>
              <button class="downloadBtn bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700" data-url="${image}">
                <i class="fas fa-download"></i>
              </button>
            </td>
          </tr>
        `;
        });
      }

      resultCard.innerHTML = `
        <span class="text-xs font-semibold text-white bg-gray-700 px-2 py-1 rounded">
          <span class="text-white">Hasil</span> <span class="text-purple-400">Download</span>
        </span>

        <div class="flex justify-center mb-4">
          <img src="${cover}" alt="Thumbnail" class="w-40 h-40 rounded my-4">
        </div>

        <p class="text-lg font-semibold text-center mb-4">${title}</p>

        <!-- Tabel Download -->
        <table class="table-auto w-full text-left text-gray-200 border-separate border-spacing-2">
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
      // hide gambar sama teks yg hutao
      document.getElementById("startImage").classList.add("hidden");
      document.getElementById("startText").classList.add("hidden");

      // Event listener untuk tombol download
      document.querySelectorAll(".downloadBtn").forEach((button) => {
        button.addEventListener("click", async () => {
          const downloadLink = button.getAttribute("data-url");
          await downloadFile(downloadLink);
        });
      });


      // Fungsi untuk mengunduh file
      async function downloadFile(link) {
        try {
          if(
            !link.includes(".dlapi.app")
          ) {
            const fileResponse = await fetch(link, {
              method: "HEAD",
              headers: {
                //"Content-Type": "application/force-download"
              }
            });
            if(!fileResponse.ok) {
              throw new Error(`Gagal mengunduh file: ${fileResponse.statusText}`);
            }

            const contentType = fileResponse.headers.get("Content-Type");
            let fileExtension = "";

            // Tentukan ekstensi berdasarkan MIME type
            if(contentType === "video/mp4") fileExtension = ".mp4";
            else if(contentType === "audio/mpeg") fileExtension = ".mp3";
            else if(contentType.startsWith("image")) fileExtension = ".jpg"; // asumsi gambar jpg

            //const fileBlob = await fileResponse.blob();
            const fileName = (
              (
                title ||
                `beta.wzblueline.xyz_${Date.now()}`
              ) +
              (
                fileExtension ||
                ""
              )
            )
              .trim()
              .replace(fileExtension + fileExtension, fileExtension); // Terkadang double kayak gini : filename.mp3.mp3

            //const url = window.URL.createObjectURL(fileBlob);
            //const linkElement = document.createElement("a");
            //linkElement.href = url;
            //linkElement.download = fileName;
            //linkElement.click();
            //window.URL.revokeObjectURL(url);
            const linkElement = document.createElement("a");
            linkElement.href = `/download?url=${encodeURIComponent(link)}&name=${encodeURIComponent(fileName)}`;
            linkElement.click();
          } else {
            const linkElement = document.createElement("a");
            linkElement.href = link;
            linkElement.target = "_blank";
            linkElement.click();
          }
        } catch (error) {
          console.log("Gagal mengunduh file:", error);
          alert("Terjadi kesalahan saat mengunduh file.\n" + error);
        }
      }
    } catch (error) {
      console.log("Gagal memproses URL:", error);
      document.getElementById("loader").classList.add("hidden");
      errorElement.classList.remove("hidden");
      document.getElementById("startImage").classList.add("hidden");
      document.getElementById("startText").classList.add("hidden");
    }
  });
});
