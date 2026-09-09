<!-- src/components/AuthModal.vue -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <!-- Close button -->
      <button type="button" class="close-button" aria-label="Close" @click="$emit('close')">
        ×
      </button>

      <!-- Header -->
      <div class="modal-header-content">
        <p class="section-label">WELCOME TO BOOKHIVE</p>

        <h2>
          {{ isLogin ? "Welcome back" : "Create your account" }}
        </h2>

        <p class="modal-subtitle">
          {{
            isLogin
              ? "Log in to access your BookHive account and continue."
              : "Create an account to use BookHive to the fullest."
          }}
        </p>
      </div>

      <!-- Authentication form -->
      <form ref="authForm" class="needs-validation" novalidate @submit.prevent="handleSubmit">
        <!-- Full name - Register only -->
        <div v-if="!isLogin" class="form-group">
          <label for="fullName" class="form-label"> Full Name </label>

          <input
            id="fullName"
            type="text"
            class="form-control"
            v-model="form.full_name"
            placeholder="Enter your full name"
            pattern="[A-Za-zÀ-ÿ\s]+"
            minlength="4"
            required
          />

          <div class="invalid-feedback">
            Please enter a valid full name using letters and spaces only.
          </div>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email" class="form-label"> Email Address </label>

          <input
            id="email"
            type="email"
            class="form-control"
            v-model="form.email"
            placeholder="you@example.com"
            required
          />

          <div class="invalid-feedback">Please enter a valid email address.</div>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password" class="form-label"> Password </label>

          <input
            id="password"
            type="password"
            class="form-control"
            v-model="form.password"
            placeholder="Enter your password"
            minlength="8"
            required
          />

          <div class="invalid-feedback">Password must be at least 8 characters long.</div>
        </div>

        <!-- Backend error -->
        <div v-if="errorMessage" class="alert alert-danger auth-error" role="alert">
          {{ errorMessage }}
        </div>

        <!-- Submit -->
        <button type="submit" class="submit-button" :disabled="isSubmitting">
          <span v-if="isSubmitting">
            {{ isLogin ? "Signing in..." : "Creating account..." }}
          </span>

          <span v-else>
            {{ isLogin ? "Sign In" : "Create Account" }}
          </span>
        </button>
      </form>

      <!-- Switch Login/Register -->
      <div class="switch-auth">
        <span>
          {{ isLogin ? "Don't have a BookHive account?" : "Already have a BookHive account?" }}
        </span>

        <button type="button" class="switch-button" @click="switchMode">
          {{ isLogin ? "Register" : "Login" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AuthModal",

  emits: ["close", "login-success"],

  data() {
    return {
      isLogin: true,

      isSubmitting: false,

      errorMessage: "",

      form: {
        full_name: "",
        email: "",
        password: "",
      },
    };
  },

  methods: {
    switchMode() {
      this.isLogin = !this.isLogin;

      this.errorMessage = "";

      this.form = {
        full_name: "",
        email: "",
        password: "",
      };

      // Remove Bootstrap validation state when switching forms
      this.$nextTick(() => {
        const form = this.$refs.authForm;

        if (form) {
          form.classList.remove("was-validated");
          form.reset();
        }
      });
    },

    async handleSubmit() {
      this.errorMessage = "";

      const form = this.$refs.authForm;

      /*
       * Activate Bootstrap validation only after
       * the user attempts to submit the form.
       */
      form.classList.add("was-validated");

      if (!form.checkValidity()) {
        return;
      }

      this.isSubmitting = true;

      const endpoint = this.isLogin
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/register";

      try {
        const response = await fetch(endpoint, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            ...(this.isLogin
              ? {}
              : {
                  full_name: this.form.full_name.trim(),
                }),

            email: this.form.email.trim(),

            password: this.form.password,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          /*
           * Store JWT token for protected API requests.
           */
          localStorage.setItem("token", data.token);

          /*
           * Send authenticated user back to App.vue.
           */
          this.$emit("login-success", data.user);

          /*
           * Reset form after successful authentication.
           */
          this.form = {
            full_name: "",
            email: "",
            password: "",
          };

          form.classList.remove("was-validated");
        } else {
          this.errorMessage = data.message || "Authentication failed. Please try again.";
        }
      } catch (error) {
        console.error("Authentication error:", error);

        this.errorMessage = "Unable to connect to the server. Please try again.";
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
/* =========================================
   BOOKHIVE AUTH MODAL
   ========================================= */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background: rgba(42, 34, 15, 0.82);

  backdrop-filter: blur(6px);

  animation: fadeIn 0.2s ease;
}

.modal-content {
  position: relative;

  width: 100%;
  max-width: 460px;

  padding: 38px;

  background: #3a3221;

  border: 1px solid #6c665a;

  border-radius: 20px;

  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(220, 229, 70, 0.04);

  color: #fbfcfd;

  animation: modalSlideIn 0.25s ease;
}

/* =========================================
   CLOSE BUTTON
   ========================================= */

.close-button {
  position: absolute;

  top: 16px;
  right: 16px;

  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #6c665a;
  border-radius: 50%;

  background: transparent;

  color: #969288;

  font-size: 1.5rem;
  line-height: 1;

  cursor: pointer;

  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.close-button:hover {
  background: #29210f;
  border-color: #dce546;
  color: #dce546;
  transform: rotate(90deg);
}

/* =========================================
   HEADER
   ========================================= */

.modal-header-content {
  margin-bottom: 28px;

  padding-right: 30px;
}

.section-label {
  margin: 0 0 8px;

  color: #dce546;

  font-size: 0.72rem;
  font-weight: 800;

  letter-spacing: 0.13em;
}

.modal-header-content h2 {
  margin: 0 0 10px;

  color: #fbfcfd;

  font-size: 2rem;
  font-weight: 750;

  line-height: 1.2;
}

.modal-subtitle {
  margin: 0;

  color: #969288;

  font-size: 0.92rem;

  line-height: 1.6;
}

/* =========================================
   FORM
   ========================================= */

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;

  margin-bottom: 8px;

  color: #fbfcfd;

  font-size: 0.86rem;
  font-weight: 650;
}

.form-control {
  width: 100%;

  min-height: 48px;

  padding: 12px 14px;

  background: #29210f;

  border: 1px solid #6c665a;

  border-radius: 10px;

  color: #fbfcfd;

  font-size: 0.92rem;

  box-shadow: none;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.form-control::placeholder {
  color: #6c665a;
}

.form-control:focus {
  background: #29210f;

  border-color: #dce546;

  color: #fbfcfd;

  box-shadow: 0 0 0 3px rgba(220, 229, 70, 0.12);
}

/* Bootstrap validation colours are kept subtle */
.was-validated .form-control:invalid {
  border-color: #dc3545;
}

.was-validated .form-control:valid {
  border-color: #6c665a;
}

.invalid-feedback {
  margin-top: 7px;

  font-size: 0.78rem;
}

/* =========================================
   BACKEND ERROR
   ========================================= */

.auth-error {
  margin: 5px 0 18px;

  padding: 11px 13px;

  background: rgba(220, 53, 69, 0.12);

  border: 1px solid rgba(220, 53, 69, 0.45);

  border-radius: 9px;

  color: #ffb3b8;

  font-size: 0.82rem;
}

/* =========================================
   SUBMIT BUTTON
   ========================================= */

.submit-button {
  width: 100%;

  min-height: 48px;

  margin-top: 4px;

  border: none;

  border-radius: 10px;

  background: #dce546;

  color: #2a220f;

  font-size: 0.92rem;
  font-weight: 800;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background: #e6ee61;

  transform: translateY(-2px);

  box-shadow: 0 8px 20px rgba(220, 229, 70, 0.18);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.65;

  cursor: not-allowed;
}

/* =========================================
   LOGIN / REGISTER SWITCH
   ========================================= */

.switch-auth {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  margin-top: 24px;

  color: #969288;

  font-size: 0.82rem;

  text-align: center;
}

.switch-button {
  padding: 0;

  border: none;

  background: transparent;

  color: #dce546;

  font-weight: 750;

  cursor: pointer;
}

.switch-button:hover {
  text-decoration: underline;
}

/* =========================================
   ANIMATIONS
   ========================================= */

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(15px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* =========================================
   MOBILE
   ========================================= */

@media (max-width: 600px) {
  .modal-overlay {
    padding: 14px;
  }

  .modal-content {
    padding: 30px 22px;
    border-radius: 16px;
  }

  .modal-header-content h2 {
    font-size: 1.65rem;
  }

  .modal-subtitle {
    font-size: 0.85rem;
  }

  .switch-auth {
    flex-direction: column;
    gap: 3px;
  }
}
</style>
