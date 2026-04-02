// 1. Inisialisasi Supabase (Paling Atas)
const SUPABASE_URL = "https://oedjjfbfndfvqkrdqepm.supabase.co".trim();
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZGpqZmJmbmRmdnFrcmRxZXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTA2NTIsImV4cCI6MjA4OTc2NjY1Mn0.iToPibvOYgJC6vvThHUQn2zYzqzIMEoXjYXwbpT6kX4".trim();

const sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("alpine:init", () => {
  // --- A. GLOBAL AUTH STORE ---
  Alpine.store("auth", {
    user: JSON.parse(localStorage.getItem("user")) || null,
    loading: false,
    isRegister: false,
    formData: { name: "", email: "", password: "" },

    init() {
      this.checkSession();
    },

    async checkSession() {
      try {
        const {
          data: { session },
        } = await sbClient.auth.getSession();
        if (session?.user) {
          this.saveUserData(session.user);
        } else {
          this.user = null;
          localStorage.removeItem("user");
        }
      } catch (e) {
        console.warn("Session check failed", e);
      }
    },

    async handleEmailAuth() {
      this.loading = true;
      try {
        if (this.isRegister) {
          const { error } = await sbClient.auth.signUp({
            email: this.formData.email,
            password: this.formData.password,
            options: { data: { full_name: this.formData.name } },
          });
          if (error) throw error;
          alert("Registrasi berhasil! Cek email konfirmasi.");
          this.isRegister = false;
        } else {
          const { data, error } = await sbClient.auth.signInWithPassword({
            email: this.formData.email,
            password: this.formData.password,
          });
          if (error) throw error;
          if (data.user) {
            this.saveUserData(data.user);
            // SARAN: Gunakan replace agar user tidak bisa 'back' ke halaman login setelah masuk
            window.location.replace("index.html");
          }
        }
      } catch (err) {
        alert("Error: " + err.message);
      } finally {
        this.loading = false;
      }
    },

    saveUserData(user) {
      const userData = {
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email.split("@")[0],
        email: user.email,
        picture: user.user_metadata?.avatar_url || null,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      this.user = userData;
    },

    async logout() {
      await sbClient.auth.signOut();
      localStorage.removeItem("user");
      this.user = null;
      window.location.href = "login.html";
    },
  });

  // --- B. DATA MENU, KERANJANG & MODAL ---
  Alpine.data("menu", () => ({
    items: [],
    search: "",
    searchOpen: false,
    cart: [],
    cartOpen: false,
    modalOpen: false,
    activeItem: {},
    loading: false,
    customer: { first_name: "", email: "", phone: "" },

    async init() {
      // 1. Ambil data produk dari Supabase
      const { data, error } = await sbClient
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Gagal mengambil menu:", error);
      } else {
        this.items = data;
      }

      // 2. Sinkronkan data customer (kodemu yang lama)
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser) {
        this.customer.first_name = savedUser.name;
        this.customer.email = savedUser.email;
      }
    },

    // Fungsi Modal
    showDetail(item) {
      this.activeItem = item;
      this.modalOpen = true;
      // Refresh ikon feather agar muncul di dalam modal
      setTimeout(() => {
        if (typeof feather !== "undefined") feather.replace();
      }, 10);
    },

    closeModal() {
      this.modalOpen = false;
      this.activeItem = {};
    },

    // Filter untuk fitur search
    get filteredItems() {
      if (this.search.trim() === "") return this.items;
      return this.items.filter((item) =>
        item.name.toLowerCase().includes(this.search.toLowerCase()),
      );
    },

    formatIDR(number) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(number);
    },

    add(newItem) {
      const existing = this.cart.find((item) => item.id === newItem.id);
      if (existing) {
        this.cart = this.cart.map((item) => {
          if (item.id !== newItem.id) return item;
          return {
            ...item,
            quantity: item.quantity + 1,
            total: (item.quantity + 1) * item.price,
          };
        });
      } else {
        this.cart.push({ ...newItem, quantity: 1, total: newItem.price });
      }
    },

    remove(id) {
      const itemIndex = this.cart.findIndex((item) => item.id === id);
      if (itemIndex !== -1) {
        if (this.cart[itemIndex].quantity > 1) {
          this.cart = this.cart.map((item) => {
            if (item.id !== id) return item;
            return {
              ...item,
              quantity: item.quantity - 1,
              total: (item.quantity - 1) * item.price,
            };
          });
        } else {
          this.cart = this.cart.filter((item) => item.id !== id);
        }
      }
    },

    get total() {
      return this.cart.reduce((sum, item) => sum + item.total, 0);
    },

    get quantity() {
      return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    },

    get isFormValid() {
      return (
        this.customer.first_name &&
        this.customer.email &&
        this.customer.phone.length >= 10
      );
    },

    async checkout() {
      this.loading = true; // Aktifkan loading saat mengecek sesi

      try {
        // 1. Cek sesi (Validasi localStorage dan Supabase)
        const savedUser = JSON.parse(localStorage.getItem("user"));
        const {
          data: { session },
          error: sessionError,
        } = await sbClient.auth.getSession();
        if (!session || sessionError || !savedUser) {
          alert(
            "Sesi Anda telah habis atau belum melakukan login. Silakan login kembali!",
          );
          localStorage.removeItem("user"); // Bersihkan sisa data lama jika ada
          window.location.href = "login.html";
          return;
        } // 2. Validasi Keranjang & Form

        if (this.cart.length === 0) {
          alert("Keranjang masih kosong!");
          return;
        }
        if (!this.isFormValid) {
          alert("Mohon lengkapi data pengiriman!");
          return;
        } // 3. Proses Checkout ke PHP (Lanjutan kodemu)

        const formData = new FormData();
        formData.append("total", this.total);
        formData.append("items", JSON.stringify(this.cart));
        formData.append("name", this.customer.first_name);
        formData.append("email", this.customer.email);
        formData.append("phoneNumber", this.customer.phone);
        // Pertimbangkan untuk mengirim session.access_token ke PHP juga untuk validasi backend

        const response = await fetch(
          "https://sohor-kopi.wuaze.com/php/placeOrder.php",
          {
            method: "POST",
            body: formData,
          },
        );

        if (!response.ok) throw new Error("Gagal menghubungi server");
        const token = await response.text();

        if (window.snap) {
          window.snap.pay(token, {
            onSuccess: () => {
              alert("Pembayaran Berhasil!");
              this.cart = [];
              this.cartOpen = false;
            },
            onPending: () => alert("Menunggu pembayaran..."),
            onError: () => alert("Pembayaran gagal!"),
            onClose: () => alert("Jendela pembayaran ditutup."),
          });
        } else {
          throw new Error("Midtrans Snap belum dimuat!");
        }
      } catch (err) {
        alert("Kesalahan: " + err.message);
      } finally {
        this.loading = false;
      }
    },
  }));
});

// 3. Efek Mouse (Tetap di luar)
document.addEventListener("mousemove", (e) => {
  const glow = document.getElementById("mouse-glow");
  if (glow) {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  }
});
