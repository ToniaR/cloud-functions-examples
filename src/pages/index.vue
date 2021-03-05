<template>
  <div class="container">
    <!-- <h1 class="title">Cloud Functions Examples</h1> -->
    <!-- <div>
      <h2>Quotes</h2>
      <ul>
        <li v-for="quote in quotes" :key="quote.id">{{ quote }}</li>
      </ul>
    </div> -->
    <form v-if="!this.isLoggedIn">
      <div>
        <input
          type="email"
          name="email"
          placeholder="Your email"
          v-model="user.email"
        />
      </div>
      <br />
      <div>
        <input
          type="password"
          name="password"
          placeholder="password"
          v-model="user.password"
        />
      </div>
      <br />
      <button @click.prevent="createAccountHandler">
        Create a new account
      </button>
      <div>or</div>
      <button @click.prevent="signInHandler">Sign in</button>
    </form>

    <!-- <section v-if="this.isLoggedIn">
      <p>{{ this.currentUser.email }}</p>
      <p>{{ this.currentUser.displayName }}</p>
      <input type="file" id="file" ref="file" @change="handleFileUpload()" />

      <section class="quote-form">
        <h2>Add your quote</h2>
        <form>
          <div>
            <input
              type="text"
              name="name"
              placeholder="Your name"
              v-model="quote.name"
            />
          </div>
          <br />
          <div>
            <input
              type="text"
              name="quote"
              placeholder="Quote"
              v-model="quote.text"
            />
          </div>
          <br />
          <button @click.prevent="addQuoteHandler">Add quote</button>
        </form>
      </section>

      <button @click.prevent="signOutHandler">Log out</button>
    </section> -->
  </div>
</template>

<script>
import { firebase } from "~/plugins/firebase.js";

export default {
  data() {
    return {
      user: {
        email: "",
        password: ""
      },
      quote: {
        name: "",
        text: "",
      },
      
      file: "",
      currentUser: null,
      isLoggedIn: false,
      quotes: null
    };
  },
  mounted() {
    this.getQuotes();
  },
  methods: {
    createAccountHandler() {
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.user.email, this.user.password)
        .then(userCredential => {
          this.currentUser = userCredential.user;
          this.isLoggedIn = !this.isLoggedIn;
          //localStorage.setItem("isLoggedIn", this.isLoggedIn);
          console.log("User signed in");
          this.clearForm();
        })
        .catch(error => {
          let errorCode = error.code;
          let errorMessage = error.message;
          console.log(
            "errorMessage " + errorMessage + " errorCode ",
            +errorCode
          );
        });
    },
    signInHandler() {
      firebase
        .auth()
        .signInWithEmailAndPassword(this.user.email, this.user.password)
        .then(userCredential => {
          this.currentUser = userCredential.user;
          this.isLoggedIn = true;
          this.clearForm();
        })
        .catch(error => {
          var errorCode = error.code;
          var errorMessage = error.message;
        });
    },
    signOutHandler() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          this.isLoggedIn = !this.isLoggedIn;
          this.clearForm();
        })
        .catch(error => {
        });
    },
    clearForm() {
      this.user.email = "";
      this.user.password = "";
    },
    handleFileUpload() {
      this.file = this.$refs.file.files[0];
    },
    addQuoteHandler() {
      firebase
        .firestore()
        .collection("quotes")
        .doc()
        .set(this.quote)
        .then(() => console.log("Quote was created!"))
        .catch(error => console.log("Error ", error));
    },
    getQuotes() {
      firebase
        .firestore().collection("quotes")
        .onSnapshot((querySnapshot) => {
            let newQuotes = [];
            querySnapshot.forEach((doc) => {
              newQuotes.push(doc.data());
            });
            this.quotes = newQuotes;
        });
    }
  }
};
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}
</style>
