<template>
  <div>
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
  </div>
</template>

<script>
  export default {
    name: 'CardSearch',
    props: {
      showCard: Function,
      addCardToDeck: Function,
    },
    data() {
      return {
        searchPhrase: '',
        cardsFound: [],
      }
    },
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
    }
  }
</script>