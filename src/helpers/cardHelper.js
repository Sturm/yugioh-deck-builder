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
};