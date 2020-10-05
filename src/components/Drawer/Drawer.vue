<template>
  <div>
    <v-navigation-drawer v-model="drawer" app>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">
            Deck Builder
          </v-list-item-title>
          <v-list-item-subtitle>
            v1
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list dense nav>
        <v-list-item
          v-for="item in links"
          :key="item.title"
          link
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app color="primary darken-2" class="white--text">
      <v-app-bar-nav-icon @click="drawer = !drawer" class="white--text"></v-app-bar-nav-icon>

      <v-toolbar-title>Yu-Gi-Oh! Deck Builder</v-toolbar-title>
    </v-app-bar>
  </div>
</template>

<script>
  export default {
    name: 'Drawer',
    props: ['links'],
    data: () => ({
      drawer: false,
    }),
  }
</script>