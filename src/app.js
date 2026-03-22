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
    loading: false, // Tambahkan loading state di sini

    // FILTER SEARCH
    get filteredItems() {
      if (!this.searchOpen || this.search.trim() === "") return this.items;
      return this.items.filter((item) =>
        item.name.toLowerCase().includes(this.search.toLowerCase()),
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

    // MODAL DETAIL
    showDetail(item) {
      this.activeItem = item;
      this.modalOpen = true;
      this.$nextTick(() => {
        if (typeof feather !== "undefined") feather.replace();
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

    // KERANJANG: TAMBAH
    add(newItem) {
      const existing = this.cart.find((item) => item.id === newItem.id);

      if (existing) {
        existing.quantity++;
        existing.total = existing.quantity * existing.price;
      } else {
        this.cart.push({
          ...newItem,
          quantity: 1,
          total: newItem.price,
        });
      }
    },

    // KERANJANG: KURANG/HAPUS
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

    // COMPUTED TOTALS
    get total() {
      return this.cart.reduce((sum, item) => sum + item.total, 0);
    },

    get quantity() {
      return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    },

    // FUNGSI CHECKOUT (Sudah di dalam objek Alpine)
    async checkout() {
      if (this.cart.length === 0) return;

      this.loading = true;
      try {
        const response = await fetch("http://localhost:3000/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            total: this.total,
            items: this.cart,
          }),
        });

        const data = await response.json();

        window.snap.pay(data.token, {
          onSuccess: (result) => {
            alert("Pembayaran Berhasil!");
            this.cart = [];
            this.cartOpen = false;
          },
          onPending: (result) => alert("Menunggu Pembayaran..."),
          onError: (result) => alert("Pembayaran Gagal!"),
          onClose: () => alert("Anda menutup jendela pembayaran"),
        });
      } catch (err) {
        console.error("Gagal melakukan checkout:", err);
        alert("Terjadi kesalahan sistem.");
      } finally {
        this.loading = false;
      }
    },
  }));
});
