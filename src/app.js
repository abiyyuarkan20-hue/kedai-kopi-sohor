document.addEventListener("alpine:init", () => {
  Alpine.data("menu", () => ({
    // DATA MENU
    items: [
      { id: 1, name: "Sanger Coffee", img: "lima.jpg", price: 30000 },
      { id: 2, name: "Coffee Latte", img: "dua.jpg", price: 14000 },
      { id: 3, name: "Palm Sugar Coffee Latte", img: "tiga.jpg", price: 16000 },
      { id: 4, name: "Lemonade Tea", img: "empat.jpg", price: 9000 },
      { id: 5, name: "Spanish Latte", img: "satu.png", price: 19000 },
      { id: 6, name: "Mocha Coffee", img: "enam.jpg", price: 17000 },
      { id: 7, name: "Kopi Susu", img: "tujuh.jpg", price: 15000 },
      { id: 8, name: "Cappucinno", img: "delapan.jpg", price: 13000 },
    ],

    // STATE & UI
    search: "",
    searchOpen: false,
    cart: [],
    cartOpen: false,
    modalOpen: false,
    activeItem: {},
    loading: false,

    // STATE FORM CUSTOMER
    customer: {
      first_name: "",
      email: "",
      phone: "",
    },

    // FILTER SEARCH
    get filteredItems() {
      if (!this.searchOpen || this.search.trim() === "") return this.items;
      return this.items.filter((item) =>
        item.name.toLowerCase().includes(this.search.toLowerCase()),
      );
    },

    // VALIDASI FORM (Tombol checkout akan memantau ini)
    get isFormValid() {
      return (
        this.customer.first_name.trim() !== "" &&
        this.customer.email.trim() !== "" &&
        this.customer.phone.trim() !== "" &&
        this.customer.email.includes("@") &&
        this.customer.phone.length >= 10
      );
    },

    // INIT
    init() {
      this.$watch("search", (value) => {
        if (value.trim() !== "") {
          const menuSection = document.getElementById("menu");
          if (menuSection) {
            menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
        this.$nextTick(() => {
          if (typeof feather !== "undefined") feather.replace();
        });
      });
    },

    // FORMAT RUPIAH
    formatIDR(number) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(number);
    },

    // KERANJANG LOGIC
    add(newItem) {
      const existing = this.cart.find((item) => item.id === newItem.id);
      if (existing) {
        existing.quantity++;
        existing.total = existing.quantity * existing.price;
      } else {
        this.cart.push({ ...newItem, quantity: 1, total: newItem.price });
      }
    },

    remove(id) {
      const itemIndex = this.cart.findIndex((item) => item.id === id);
      if (itemIndex === -1) return;

      if (this.cart[itemIndex].quantity > 1) {
        this.cart[itemIndex].quantity--;
        this.cart[itemIndex].total =
          this.cart[itemIndex].price * this.cart[itemIndex].quantity;
      } else {
        this.cart.splice(itemIndex, 1);
      }
    },

    get total() {
      return this.cart.reduce((sum, item) => sum + item.total, 0);
    },

    get quantity() {
      return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    },

    // MODAL DETAIL
    showDetail(item) {
      this.activeItem = item;
      this.modalOpen = true;
      this.$nextTick(() => {
        if (typeof feather !== "undefined") feather.replace();
      });
    },

    // FUNGSI CHECKOUT YANG BENAR
    async checkout() {
      if (this.cart.length === 0 || !this.isFormValid) return;

      this.loading = true;
      try {
        // 1. Bungkus data ke dalam FormData agar bisa dibaca oleh $_POST di PHP
        const formData = new FormData();
        formData.append("total", this.total);
        formData.append("items", JSON.stringify(this.cart)); // Cart dijadikan string JSON
        formData.append("name", this.customer.first_name);
        formData.append("email", this.customer.email);
        formData.append("phoneNumber", this.customer.phone);

        // 2. Kirim ke file PHP Midtrans kamu
        const response = await fetch("php/placeOrder.php", {
          method: "POST",
          body: formData,
        });

        // 3. Karena PHP kamu menggunakan 'echo $snapToken', hasilnya adalah text, bukan JSON
        const token = await response.text();

        // 4. Panggil pop-up Midtrans
        window.snap.pay(token, {
          onSuccess: (result) => {
            alert("Pembayaran Berhasil!");
            this.cart = [];
            // Reset state customer sesuai dengan properti awal
            this.customer = { first_name: "", email: "", phone: "" };
            this.cartOpen = false;
          },
          onPending: (result) => alert("Menunggu Pembayaran..."),
          onError: (result) => alert("Pembayaran Gagal!"),
          onClose: () => alert("Anda menutup jendela pembayaran"),
        });
      } catch (err) {
        console.error("Gagal melakukan checkout:", err);
        alert("Terjadi kesalahan sistem saat menghubungi server.");
      } finally {
        this.loading = false;
      }
    }, // <- penutup fungsi checkout()
  })); // <- penutup Alpine.data()
}); // <- penutup document.addEventListener()
