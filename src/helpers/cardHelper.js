module.exports = {
  checkBanlist: (card) => {
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