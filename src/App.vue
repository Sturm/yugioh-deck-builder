<template>
  <v-app id="app">
    <Drawer :links="items"></Drawer>
    <v-main>
      <v-row>
        <v-col cols="12">
          <v-card elevation="2">
            <v-row>
              <v-col>
                <v-select
                  :items="items"
                  label="Select deck"
                ></v-select>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col cols="8">
          <v-card elevation="2">
            <h2>Main deck: {{ deck.main.length }}</h2>

            <draggable
              v-model="deck.main"
              @start="drag=true"
              @end="drag=false"
              @update="save"
              class="main-deck"
            >
              <div v-for="(card,index) in deck.main" :key="index" class="card">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <img :src="card.card_images[0].image_url" v-bind="attrs" v-on="on"/>
                    <!--                    <v-btn @click="removeCardFromDeck(card)">X</v-btn>-->
                  </template>
                  <span>{{ card.name }}</span>
                </v-tooltip>
              </div>
            </draggable>
            <br><br>
            <h2>Extra deck: {{ deck.extra.length }}</h2>
            <draggable
              v-model="deck.main"
              @start="drag=true"
              @end="drag=false"
              @update="save"
              class="main-deck"
            >
              <div v-for="(card,index) in deck.extra" :key="index" class="card">
                <img :src="card.card_images[0].image_url"/>
                <v-btn @click="removeCardFromDeck(card)">X</v-btn>
              </div>
            </draggable>
          </v-card>
        </v-col>
        <v-col>
          <v-card elevation="2">
            <h1>Deck builder</h1>
            <v-text-field
              label="Search card"
              v-model="searchPhrase"
              @input="searchCards"
            />
            <div class="search-deck">
              <div v-for="card in cardsFound" :key="card.id" class="card">
                <img :src="card.card_images[0].image_url"/>
                <v-btn @click="addCardToDeck(card)">+</v-btn>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
  import Drawer from './components/Drawer/Drawer';
  import draggable from 'vuedraggable';

  export default {
    name: 'App',
    components: {
      Drawer,
      draggable,
    },
    data() {
      return {
        searchPhrase: '',
        cardsFound: [],
        deck: {
          main: [],
          extra: [],
          side: [],
        },
        myArray: [
          {
            id: 1,
            name: 'ddd',
          },
          {
            id: 2,
            name: 'asdssassa',
          }
        ],
        items: [
          { title: 'My decks', icon: 'mdi-view-dashboard' },
        ],
        maxCards: {
          main: 60,
          extra: 15,
          side: 15,
          copies: 3,
        }
      }
    },
    mounted() {
      if (null !== localStorage.getItem('deck')) {
        this.deck = JSON.parse(localStorage.getItem('deck'));
      }
      console.log(this.deck);
    },
    computed: {},
    methods: {
      searchCards() {
        if (this.searchPhrase.length === 0) this.cardsFound = [];
        if (this.searchPhrase.length <= 3) return;

        fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${this.searchPhrase}`)
        .then(res => res.json())
        .then(json => {
          this.cardsFound = json.data;
        });
      },
      addCardToDeck(card) {
        const type = this.checkCardType(card);

        /** Check if deck does not exceed card limit */
        if (this.deck[type].length >= this.maxCards[type]) return;

        /** Check if card does not exceed max copies */
        const cardCount = this.deck[type].filter(cardInDeck => cardInDeck.name === card.name).length;
        const cardMaxCopies = this.checkBanlist(card);
        if (cardCount >= cardMaxCopies) return;

        this.deck[type] = [...this.deck[type], card];
        this.save();
      },
      removeCardFromDeck(card) {
        this.deck.main.splice(this.deck.main.indexOf(card), 1);
        this.save();
      },
      save() {
        localStorage.setItem('deck', JSON.stringify(this.deck));
      },
      checkCardType(card) {
        let type;
        switch (card.type) {
          case 'XYZ Monster':
          case 'Fusion Monster':
          case 'Link Monster':
          case 'Synchro Monster':
            type = 'extra';
            break;
          default:
            type = 'main';
            break;
        }
        return type;
      },
      checkBanlist(card) {
        if (typeof card.banlist_info !== 'undefined' && typeof card.banlist_info.ban_tcg !== 'undefined') {
          switch (card.banlist_info.ban_tcg) {
            case 'Banned':
              return 0;
            case 'Limited':
              return 1;
            case 'Semi-Limited':
              return 2;
          }
        }
        return 3;
      }
    }
  }

</script>

<style>
  html, body {
    font-family: Roboto, sans-serif;
  }

  .main-deck {
    display: flex;
    flex-wrap: wrap;
    flex: 1 0 11%;
  }

  .v-main__wrap {
    margin: 1rem;
  }

  .v-card {
    padding: 1rem;
  }

  .card {
    display: flex;
    flex-direction: column;
    margin: 2px;
  }

  .card img {
    height: 80px;
  }

  .card button {
    margin-top: 5px;
  }

  .search-deck {
    display: flex;
    flex-wrap: wrap;
    flex: 1 0 11%;
  }
</style>
