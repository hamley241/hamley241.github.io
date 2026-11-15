(() => {
  const design = (entry) => Object.freeze({
    ...entry,
    assets: Object.freeze(entry.assets),
    story: Object.freeze(entry.story),
    spin: entry.spin ? Object.freeze(entry.spin) : null,
  });

  window.ATTIRE_COLLECTION = Object.freeze([
    design({
      code: 'AA-05',
      name: 'Red Anarkali',
      accent: '#c92d32',
      assets: {
        model: 'assets/aa-05-model.png',
        cutout: 'assets/v4-aa-05-cutout.png',
        alt: 'Model wearing the red Anarkali and floral dupatta',
      },
      story: {
        title: 'A vivid, flowing statement',
        special: 'A full red Anarkali line is balanced by a light floral dupatta.',
        mood: 'Romantic · Celebratory',
        occasions: 'Wedding functions · Festive gatherings · Evening celebrations',
      },
    }),
    design({
      code: 'AA-06',
      name: 'Royal blue gown',
      accent: '#2f45c6',
      assets: {
        model: 'assets/aa-06-model.png',
        cutout: 'assets/v4-aa-06-cutout.png',
        alt: 'Model wearing the royal-blue gown with silver diamond motifs',
      },
      story: {
        title: 'A regal evening silhouette',
        special: 'Royal blue is lifted by repeating silver motifs and a sweeping full-length skirt.',
        mood: 'Regal · Luminous',
        occasions: 'Receptions · Sangeet evenings · Formal celebrations',
      },
    }),
    design({
      code: 'AA-07',
      name: 'Floral gown',
      accent: '#b95e72',
      assets: {
        model: 'assets/aa-07-model.png',
        cutout: 'assets/v4-aa-07-cutout.png',
        alt: 'Model wearing the multicolour floral gown',
      },
      story: {
        title: 'Florals with full-length movement',
        special: 'An all-over floral composition gives the long silhouette colour, softness, and visual rhythm.',
        mood: 'Expressive · Graceful',
        occasions: 'Day weddings · Garden celebrations · Festive brunches',
      },
    }),
    design({
      code: 'AA-08',
      name: 'Yellow gown',
      accent: '#e1b414',
      assets: {
        model: 'assets/aa-08-model.png',
        cutout: 'assets/v4-aa-08-cutout.png',
        alt: 'Model wearing the yellow gown with white patterned bodice',
      },
      story: {
        title: 'Sunlit colour, graphic contrast',
        special: 'A patterned light bodice gives structure to the bright yellow skirt and its easy movement.',
        mood: 'Fresh · Joyful',
        occasions: 'Haldi celebrations · Daytime festivities · Summer gatherings',
      },
    }),
    design({
      code: 'AA-09',
      name: 'Black and gold gown',
      accent: '#8f7848',
      assets: {
        model: 'assets/aa-09-model.png',
        cutout: 'assets/v4-aa-09-cutout.png',
        alt: 'Model wearing the black gown with gold lace bodice',
      },
      story: {
        title: 'Classic black, detailed in gold',
        special: 'A gold-detailed bodice brings light and definition to the clean black gown.',
        mood: 'Polished · Dramatic',
        occasions: 'Cocktail evenings · Receptions · Formal dinners',
      },
    }),
    design({
      code: 'AA-10',
      name: 'Brown and green lehenga',
      accent: '#8baa29',
      assets: {
        model: 'assets/aa-10-model.png',
        cutout: 'assets/v4-aa-10-cutout.png',
        alt: 'Model wearing the brown net lehenga and green blouse',
      },
      story: {
        title: 'Layered borders made for movement',
        special: 'The lime blouse, sheer waist, and two border tiers give the brown skirt a clear architectural rhythm.',
        mood: 'Playful · Sculptural',
        occasions: 'Mehendi and sangeet events · Festive weddings · Dance-led celebrations',
      },
      spin: {
        frameCount: 12,
        framePattern: 'assets/v5-aa-10-spin-transparent/frame-{index}.png',
      },
    }),
  ]);
})();
