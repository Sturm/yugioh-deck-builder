<template>
  <v-app id="app">
    <Drawer :links="items"></Drawer>
    <v-main>
      <v-row>
        <v-col lg="3" md="3" sm="12">
          <v-card elevation="2">
            <v-row>
              <v-col>
                <v-select
                  :items="Object.keys(decks)"
                  label="Select deck"
                  @input="selectDeck"
                />
                <template>
                  <v-dialog persistent max-width="290" v-model="dialog">
                    <template v-slot:activator="{ on, attrs }">
                      <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn color="primary darken-1" class="ma-2" v-bind="attrs" v-on="on">
                            Export
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item link @click="exportDeck('ygp')">
                            <v-list-item-title>YGOPro</v-list-item-title>
                          </v-list-item>
                          <v-list-item link @click="exportDeck('db')">
                            <v-list-item-title>Dueling Book</v-list-item-title>
                          </v-list-item>
                          <v-list-item link disabled>
                            <v-list-item-title>KDE Decklist</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                      <v-btn class="ma-2" @click="sortDeck">Sort</v-btn>
                      <v-btn color="error darken-2" class="ma-2">Delete deck</v-btn>
                      <v-btn color="primary" dark v-bind="attrs" v-on="on" class="ma-2">
                        New deck
                      </v-btn>
                    </template>
                    <v-card>
                      <v-form v-on:submit="addNewDeck">
                        <v-card-title class="headline">
                          Add new deck
                        </v-card-title>
                        <v-card-text>
                          <v-text-field
                            label="Deck name"
                            v-model="newDeck"
                            autofocus
                            required
                          ></v-text-field>
                        </v-card-text>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="green darken-1" text @click="addNewDeck">
                            Add
                          </v-btn>
                        </v-card-actions>
                      </v-form>
                    </v-card>
                  </v-dialog>
                </template>
              </v-col>
            </v-row>
          </v-card>
          <v-card elevation="2" v-if="featuredCard !== null">
            <CardFeatured :card="featuredCard"/>
          </v-card>
        </v-col>
        <v-col lg="6" md="6" sm="12">
          <v-card elevation="2" class="card-deck">
            <div v-if="selectedDeck !== null">
              <span class="text--disabled">
               {{ selectedDeck }}
              </span>
              <h2 v-if="deck.main.length !== 0">
                <v-badge color="amber darken-1" :content="deck.main.length">Main Deck</v-badge>
              </h2>
              <h2 v-else>Main Deck</h2>
              <draggable
                v-model="deck.main"
                @start="drag=true"
                @end="drag=false"
                @update="save"
                class="main-deck"
                group="main-deck"
              >
                <div
                  v-for="(card,index) in deck.main"
                  :key="index"
                  class="card"
                  @mouseover="showCard(card)"
                >
                  <Card :card="card"></Card>
                </div>
              </draggable>
              <br><br>
              <h2 v-if="deck.extra.length !== 0">
                <v-badge color="black" :content="deck.extra.length">Extra Deck</v-badge>
              </h2>
              <h2 v-else>Extra Deck</h2>
              <draggable
                v-model="deck.extra"
                @start="drag=true"
                @end="drag=false"
                @update="save"
                class="extra-deck"
              >
                <div
                  v-for="(card,index) in deck.extra"
                  :key="index"
                  class="card"
                  @mouseover="showCard(card)"
                >
                  <Card :card="card"></Card>
                </div>
              </draggable>
              <br><br>
              <h2 v-if="deck.side.length !== 0">
                <v-badge color="amber darken-1" :content="deck.side.length">Side Deck</v-badge>
              </h2>
              <h2 v-else>Side Deck</h2>
              <draggable
                v-model="deck.side"
                @start="drag=true"
                @end="drag=false"
                @update="save"
                class="main-deck"
                group="main-deck"
              >
                <div
                  v-for="(card,index) in deck.side"
                  :key="index"
                  class="card"
                  @mouseover="showCard(card)"
                >
                  <Card :card="card"></Card>
                </div>
              </draggable>
            </div>
            <div v-else>
              <v-alert dense type="info" color="primary">
                Please create new deck or select existing
              </v-alert>
            </div>
          </v-card>
        </v-col>
        <v-col lg="3" md="3" sm="12">
          <v-card elevation="2">
            <CardSearch
              :show-card="showCard"
              :add-card-to-deck="addCardToDeck"
            />
          </v-card>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
  import Drawer from './components/Drawer/Drawer';
  import draggable from 'vuedraggable';
  import Card from './components/Card/Card';
  import CardSearch from './components/CardSearch/CardSearch';
  import CardFeatured from './components/CardFeatured/CardFeatured';
  import CardHelper from './helpers/cardHelper';

  export default {
    name: 'App',

    components: {
      CardFeatured,
      CardSearch,
      Drawer,
      draggable,
      Card,
    },

    data() {
      return {
        dialog: false,
        selectedDeck: null,
        newDeck: '',
        featuredCard: null,
        decks: {},
        deck: {
          main: [],
          extra: [],
          side: [],
        },
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
      if (null !== localStorage.getItem('decks')) {
        this.decks = JSON.parse(localStorage.getItem('decks'));
      }
    },

    methods: {

      addCardToDeck(card, toSideDeck = false) {
        const type = toSideDeck ? 'side' : CardHelper.checkCardType(card);

        /** Check if deck does not exceed card limit */
        if (this.deck[type].length >= this.maxCards[type]) return;

        /** Check if card does not exceed max copies */
        const cardCount = this.deck[type].filter(cardInDeck => cardInDeck.name === card.name).length;
        const cardMaxCopies = CardHelper.checkBanlist(card);
        if (cardCount >= cardMaxCopies) return;

        this.deck[type] = [...this.deck[type], card];
        this.save();
      },

      removeCardFromDeck(card) {
        this.deck.main.splice(this.deck.main.indexOf(card), 1);
        this.save();
      },

      save() {
        localStorage.setItem('decks', JSON.stringify(this.decks));
      },

      addNewDeck(e) {
        e.preventDefault();
        this.decks[this.newDeck] = {
          main: [],
          extra: [],
          side: [],
        };
        this.save();
        this.selectedDeck = this.newDeck;
        this.deck = this.decks[this.newDeck];

        this.newDeck = '';
        if (this.dialog) this.dialog = false;
      },

      selectDeck(selectedDeck) {
        this.deck = this.decks[selectedDeck];
        this.selectedDeck = selectedDeck;
      },

      showCard(card) {
        this.featuredCard = card;
      },

      sortDeck() {
        ['main', 'extra', 'side'].forEach(deckType => {
          this.deck[deckType] = this.deck[deckType].sort((a, b) => {
            return a.id - b.id;
          }).sort((a, b) => {
            if (a.type === 'Tuner Monster') a.type = 'Effect Monster';
            if (a.type > b.type) return 1;
            if (a.type < b.type) return -1;
            return 0;
          }).sort((a, b) => {
            return b.level - a.level;
          });
        });
        this.save();
      },

      exportDeck(deckType) {
        console.log(deckType);
      }
    }
  }
</script>

<style>
  .col {
    flex-basis: auto !important;
  }

  html, body {
    font-family: Roboto, sans-serif;
  }

  .v-main__wrap {
    margin: 1rem;
  }

  .v-card {
    padding: 1rem;
    margin-bottom: 24px;
  }


  .main-deck,
  .extra-deck {
    display: flex;
    flex-wrap: wrap;
  }


  .extra-deck .card {
    display: flex;
    flex-direction: column;
    flex: 0 1 2%;
  }

  .extra-deck .card img {
    height: 60px;
  }


  .card img {
    height: 80px;
  }

  .card button {
    margin-top: 5px;
  }

  .search-deck {
    height: 400px;
    overflow-y: scroll;
  }

  .search-deck .search-card {
    display: flex;
    margin-bottom: 10px;
  }

  .search-deck .search-card div {
    margin-left: 10px;
  }

  .search-deck .search-card div button {
    display: inline-block;
  }

  .search-deck .search-card img {
    width: 55px;
    max-height: 80px;
  }

  .card-deck h2 {
    margin-bottom: 10px;
  }
</style>
