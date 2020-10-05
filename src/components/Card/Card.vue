<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <img :src="card.card_images[0].image_url" v-bind="attrs" v-on="on" :alt="card.name"/>
    </template>
    <span>{{ card.name }}</span>
  </v-tooltip>
</template>

<script>
  export default {
    name: 'Card',
    props: ['card'],
  }
</script>