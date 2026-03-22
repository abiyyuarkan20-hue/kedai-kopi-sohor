// 1. Inisialisasi Supabase
// Gunakan window agar tidak error "already declared" jika script ter-load 2x
window.SUPABASE_URL = "https://oedjjfbfndfvqkrdqepm.supabase.co".trim();
window.SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZGpqZmJmbmRmdnFrcmRxZXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTA2NTIsImV4cCI6MjA4OTc2NjY1Mn0.iToPibvOYgJC6vvThHUQn2zYzqzIMEoXjYXwbpT6kX4".trim();

if (typeof supabase === "undefined") {
  console.error("Supabase library not found!");
}

const sbClient = supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_KEY,
);

document.addEventListener("alpine:init", () => {
  Alpine.store("auth", {
    user: JSON.parse(localStorage.getItem("user")) || null,
    isRegister: false,
    loading: false,
    formData: { name: "", email: "", password: "" },

    init() {
      // PENTING: Sekarang checkSession sudah ada di bawah, jadi tidak akan error lagi
      this.checkSession();

      Alpine.watch(
        () => this.user,
        (val) => {
          if (!val) this.renderGoogleButton();
        },
      );

      this.initGoogleAuth();
    },

    // --- FUNGSI YANG SEBELUMNYA HILANG ---
    async checkSession() {
      try {
        const {
          data: { session },
        } = await sbClient.auth.getSession();
        if (session?.user) {
          this.saveUserData(session.user);
        } else {
          this.clearLocalData();
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
          alert("Registrasi berhasil! Silakan cek email konfirmasi.");
          this.isRegister = false;
        } else {
          const { data, error } = await sbClient.auth.signInWithPassword({
            email: this.formData.email,
            password: this.formData.password,
          });
          if (error) throw error;
          if (data.user) {
            this.saveUserData(data.user);
            window.location.href = "index.html";
          }
        }
      } catch (err) {
        alert("Auth Error: " + err.message);
      } finally {
        this.loading = false;
      }
    },

    initGoogleAuth() {
      const checkGoogle = setInterval(() => {
        if (typeof google !== "undefined" && google.accounts) {
          clearInterval(checkGoogle);
          google.accounts.id.initialize({
            client_id:
              "622209008591-677gjbfrj9222rbr07j4vsko40kod5pb.apps.googleusercontent.com",
            callback: (res) => this.handleGoogleLogin(res),
          });
          this.renderGoogleButton();
        }
      }, 500);
    },

    async handleGoogleLogin(response) {
      this.loading = true;
      try {
        const { data, error } = await sbClient.auth.signInWithIdToken({
          provider: "google",
          token: response.credential,
        });
        if (error) throw error;
        if (data.user) {
          this.saveUserData(data.user);
          window.location.href = "index.html";
        }
      } catch (err) {
        alert("Google Login Failed: " + err.message);
      } finally {
        this.loading = false;
      }
    },

    async loginWithGithub() {
      this.loading = true;
      try {
        const { error } = await sbClient.auth.signInWithOAuth({
          provider: "github",
          options: {
            redirectTo: window.location.origin + "/sohor-kopi/login.html",
          },
        });
        if (error) throw error;
      } catch (err) {
        alert("GitHub Error: " + err.message);
      } finally {
        this.loading = false;
      }
    },

    renderGoogleButton() {
      setTimeout(() => {
        const btn = document.getElementById("google-login-button");
        if (btn && typeof google !== "undefined") {
          google.accounts.id.renderButton(btn, {
            theme: "filled_black",
            size: "large",
            shape: "pill",
            width: btn.offsetWidth || 300,
          });
        }
      }, 300);
    },

    saveUserData(user) {
      const userData = {
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email.split("@")[0],
        email: user.email,
        picture:
          user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      this.user = userData;
    },

    clearLocalData() {
      localStorage.removeItem("user");
      this.user = null;
    },

    async logout() {
      try {
        await sbClient.auth.signOut();
      } finally {
        this.clearLocalData();
        window.location.href = "index.html";
      }
    },

    async forgotPassword() {
      const email = prompt("Masukkan alamat email Anda:");
      if (!email) return;
      this.loading = true;
      try {
        const { error } = await sbClient.auth.resetPasswordForEmail(email, {
          redirectTo:
            window.location.origin + "/sohor-kopi/update-password.html",
        });
        if (error) throw error;
        alert("Cek email Anda untuk link reset!");
      } catch (err) {
        alert("Error: " + err.message);
      } finally {
        this.loading = false;
      }
    },
  });
});
google.accounts.id.renderButton(btn, {
  theme: "outline", // Menggunakan outline agar background putih kita yang dominan
  size: "large",
  shape: "pill", // Akan dipotong oleh border-radius 16px kita
  width: btn.offsetWidth,
  logo_alignment: "center",
});
