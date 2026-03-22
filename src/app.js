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

    // SEARCH
    search: "",
    searchOpen: false,

    get filteredItems() {
      if (!this.searchOpen) return this.items;
      if (this.search.trim() === "") return this.items;

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
            menuSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }

        this.$nextTick(() => {
          if (typeof feather !== "undefined") feather.replace();
        });
      });
    },

    // CART
    cart: [],
    cartOpen: false,

    // MODAL
    modalOpen: false,
    activeItem: {},

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

    // ADD TO CART
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

    // REMOVE CART
    remove(id) {
      const item = this.cart.find((item) => item.id === id);
      if (!item) return;

      if (item.quantity > 1) {
        item.quantity--;
        item.total = item.price * item.quantity;
      } else {
        this.cart = this.cart.filter((item) => item.id !== id);
      }
    },

    // TOTAL HARGA
    get total() {
      return this.cart.reduce((sum, item) => sum + item.total, 0);
    },

    // TOTAL ITEM
    get quantity() {
      return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    },
  }));
});
