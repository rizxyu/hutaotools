document.addEventListener("DOMContentLoaded", () => {


  const openModalHutao = document.getElementById('open-modal-hutao');

  // Fungsi untuk membuat modal
  function createModal() {
    // Buat elemen modal
    const modal = document.createElement('div');
    modal.id = 'modal-hutao';
    modal.className = 'modal-overlay';

    // Isi konten modal
    modal.innerHTML = `
      <div class="modal-content">
        <!-- Tombol Close -->
        <button id="close-modal-hutao" class="modal-close">&times;</button>

        <!-- Konten Modal -->
        <h2 class="modal-title">Apa itu Hutao Tools?</h2>
        <p class="modal-text">
          Hutao Tools 
        </p>

        <!-- Tombol Tutup di Bawah -->
        <button id="close-modal-btn" class="modal-button">Tutup</button>
      </div>
    `;

    // Tambahkan modal ke body
    document.body.appendChild(modal);

    // Event listener untuk tombol close (X)
    document.getElementById('close-modal-hutao').addEventListener('click', () => {
      modal.remove();
    });

    // Event listener untuk tombol "Tutup"
    document.getElementById('close-modal-btn').addEventListener('click', () => {
      modal.remove();
    });

    // Tutup modal saat klik di luar konten
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // Event listener saat teks diklik
  openModalHutao.addEventListener('click', createModal);
});