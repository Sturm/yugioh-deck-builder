<template>
  <v-app id="app">
    <Drawer :links="items"></Drawer>
    <v-main>
      <v-row>
        <v-col>
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
                          <v-btn color="primary darken-1" class="ma-2" v-bind="attrs" v-on="on">Export
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
                      <v-card-title class="headline">
                        Add new deck
                      </v-card-title>
                      <v-card-text>
                        <v-text-field
                          label="Deck name"
                          v-model="newDeck"
                          required
                        ></v-text-field>
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="green darken-1" text @click="addNewDeck">
                          Add
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </template>
              </v-col>
            </v-row>
          </v-card>
          <v-card elevation="2" v-if="featuredCard !== null">
            <h2>{{ featuredCard.name }}</h2>
            {{ featuredCard.desc }}
            <br>
            <div v-if="featuredCard.atk && featuredCard.def">
              <b>ATK:</b> {{ featuredCard.atk }} <b>DEF:</b> {{ featuredCard.def }}
            </div>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card elevation="2" class="card-deck">
            <div v-if="selectedDeck !== null">
              <h2>Main deck: {{ deck.main.length }}</h2>
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
              <h2>Extra deck: {{ deck.extra.length }}</h2>
              <draggable
                v-model="deck.extra"
                @start="drag=true"
                @end="drag=false"
                @update="save"
                class="main-deck"
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
              <h2>Side deck: {{ deck.side.length }}</h2>
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
        <v-col>
          <v-card elevation="2">
            <h2>Deck builder</h2>
            <v-text-field
              label="Search card"
              v-model="searchPhrase"
              @input="searchCards"
            />
            <div class="search-deck">
              <div
                v-for="card in cardsFound"
                :key="card.id"
                class="search-card"
                @mouseover="showCard(card)"
              >
                <img :src="card.card_images[0].image_url"/>
                <div>
                  {{ card.name }}<br>
                  <v-btn class="ma-1" color="primary" @click="addCardToDeck(card)">Add</v-btn>
                  <v-btn class="ma-1" @click="addCardToDeck(card, true)">Side</v-btn>
                </div>
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
  import Card from './components/Card/Card';

  export default {
    name: 'App',
    components: {
      Drawer,
      draggable,
      Card,
    },
    data() {
      return {
        dialog: false,
        searchPhrase: '',
        selectedDeck: null,
        newDeck: '',
        cardsFound: [],
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
      addCardToDeck(card, toSideDeck = false) {
        const type = toSideDeck ? 'side' : this.checkCardType(card);

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
        localStorage.setItem('decks', JSON.stringify(this.decks));
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
      },
      addNewDeck() {
        this.decks[this.newDeck] = {
          main: [],
          extra: [],
          side: [],
        };
        this.save();
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


  .main-deck {
    display: flex;
    flex-wrap: wrap;
  }

  .card {
    display: flex;
    flex-direction: column;
    /*margin: 2px;*/
    /*width: 55px;*/
    /*width: 10%;*/
    /*max-width: 10%;*/
    flex: 0 1 10%;

    /*flex-direction: column;*/
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
  }

  .card-deck h2 {
    margin-bottom: 10px;
  }
</style>
